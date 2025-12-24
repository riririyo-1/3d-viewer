#!/usr/bin/env python
import os
import json
import struct
import base64
import time
from pathlib import Path

# -- 設定 ------------------
INPUT_OBJ_FILE = "低温封止+NDターレット.obj"  # 変換したいOBJファイルパス

# -- 出力ファイル名の自動生成（重複時は連番付与） ------------------
def get_output_filename(input_file, new_extension=".glb"):
    base_name = os.path.splitext(input_file)[0]
    output_file = f"{base_name}{new_extension}"
    counter = 1
    while os.path.exists(output_file):
        output_file = f"{base_name}_{counter}{new_extension}"
        counter += 1
    return output_file


# -- 画像をBase64データURIにエンコード ------------------
def image_to_base64_uri(filepath):
    """画像ファイルを読み込み、Base64エンコードされたデータURIを返す"""
    try:
        with open(filepath, "rb") as f:
            encoded_string = base64.b64encode(f.read()).decode('ascii')
            mime_type = "image/png" if str(filepath).lower().endswith(".png") else "image/jpeg"
            return f"data:{mime_type};base64,{encoded_string}"
    except FileNotFoundError:
        print(f"  [警告] テクスチャファイルが見つかりません: {filepath}")
        return None
    except Exception as e:
        print(f"  [エラー] テクスチャファイルの読み込み中にエラーが発生しました: {e}")
        return None

# -- MTLファイル読込み（テクスチャ・発光対応） ------------------
def load_mtl_file(mtl_file, obj_dir):
    print(f"MTLファイル読込み開始: {mtl_file}")
    materials = {}
    current_material = None
    if not os.path.exists(mtl_file):
        print("  [情報] MTLファイルが見つかりませんでした。")
        return materials

    with open(mtl_file, 'r', encoding='utf-8') as file:
        for line in file:
            parts = line.strip().split()
            if not parts:
                continue
            
            cmd = parts[0]
            if cmd == 'newmtl':
                current_material = parts[1]
                materials[current_material] = {
                    'pbrMetallicRoughness': {
                        'baseColorFactor': [0.8, 0.8, 0.8, 1.0],
                        'metallicFactor': 0.0,
                        'roughnessFactor': 0.8,
                    },
                    'emissiveFactor': [0.0, 0.0, 0.0],
                    'alphaMode': 'OPAQUE',
                    'doubleSided': True
                }
            elif current_material:
                if cmd == 'Kd':
                    materials[current_material]['pbrMetallicRoughness']['baseColorFactor'][:3] = [float(p) for p in parts[1:4]]
                elif cmd == 'Ke':
                    materials[current_material]['emissiveFactor'] = [float(p) for p in parts[1:4]]
                elif cmd == 'Ns':
                    shininess = float(parts[1])
                    roughness = (2 / (shininess + 2))**0.5
                    materials[current_material]['pbrMetallicRoughness']['roughnessFactor'] = roughness
                elif cmd == 'd':
                    alpha = float(parts[1])
                    materials[current_material]['pbrMetallicRoughness']['baseColorFactor'][3] = alpha
                    if alpha < 1.0:
                        materials[current_material]['alphaMode'] = 'BLEND'
                elif cmd == 'Tr':
                    alpha = 1.0 - float(parts[1])
                    materials[current_material]['pbrMetallicRoughness']['baseColorFactor'][3] = alpha
                    if alpha < 1.0:
                        materials[current_material]['alphaMode'] = 'BLEND'
                elif cmd == 'map_Kd':
                    texture_path = obj_dir / ' '.join(parts[1:])
                    materials[current_material]['texture_path'] = texture_path

    print(f"MTL読込み完了: マテリアル数={len(materials)}")
    return materials

# -- OBJファイル読込み（vt, vn対応） ------------------
def load_obj_data(obj_file):
    print(f"OBJファイル読込み開始: {obj_file}")
    v, vt, vn = [], [], []
    face_groups = {}
    current_material = "default"
    vertex_cache = {}
    final_vertices, final_normals, final_texcoords = [], [], []
    next_vertex_index = 0

    with open(obj_file, 'r', encoding='utf-8') as file:
        for line in file:
            parts = line.strip().split()
            if not parts: continue

            cmd = parts[0]
            if cmd == 'v':
                v.append(tuple(map(float, parts[1:4])))
            elif cmd == 'vt':
                vt.append(tuple(map(float, parts[1:3])))
            elif cmd == 'vn':
                vn.append(tuple(map(float, parts[1:4])))
            elif cmd == 'usemtl':
                current_material = parts[1]
                if current_material not in face_groups:
                    face_groups[current_material] = []
            elif cmd == 'f':
                if current_material not in face_groups:
                    face_groups[current_material] = []
                
                face_indices = []
                # 頂点のインデックスは v/vt/vn の形式
                for part in parts[1:]:
                    indices = [(int(i) if i else 0) for i in part.split('/')]
                    key = tuple(indices)

                    if key in vertex_cache:
                        face_indices.append(vertex_cache[key])
                    else:
                        v_idx, vt_idx, vn_idx = indices[0], indices[1] if len(indices) > 1 else 0, indices[2] if len(indices) > 2 else 0
                        final_vertices.extend(v[v_idx - 1])
                        if vt_idx > 0: final_texcoords.extend(vt[vt_idx - 1])
                        if vn_idx > 0: final_normals.extend(vn[vn_idx - 1])
                        
                        vertex_cache[key] = next_vertex_index
                        face_indices.append(next_vertex_index)
                        next_vertex_index += 1
                
                # 面を三角形に分割
                for i in range(1, len(face_indices) - 1):
                    face_groups[current_material].extend([face_indices[0], face_indices[i], face_indices[i + 1]])

    print(f"OBJ読込み完了: 最終頂点数={len(final_vertices)//3}")
    return {
        "vertices": final_vertices, "normals": final_normals,
        "texcoords": final_texcoords, "face_groups": face_groups
    }

# -- .glb ファイルを生成 ------------------
def create_glb_file(obj_data, mtl_data, output_glb_file, obj_dir):
    print(f"GLB生成開始: {output_glb_file}")
    
    gltf = {
        "asset": {"version": "2.0", "generator": "Python OBJ to GLB Converter"},
        "scene": 0, "scenes": [{"nodes": [0]}], "nodes": [{"mesh": 0}],
        "meshes": [{"primitives": []}], "materials": [], "textures": [],
        "images": [], "samplers": [{"wrapS": 10497, "wrapT": 10497, "magFilter": 9729, "minFilter": 9987}],
        "accessors": [], "bufferViews": [], "buffers": []
    }
    binary_blob = bytearray()
    
    # 1. マテリアルとテクスチャの処理
    material_map = {}
    for name, props in mtl_data.items():
        material_idx = len(gltf['materials'])
        material_map[name] = material_idx
        
        gltf_mat = props.copy()
        if 'texture_path' in props:
            texture_path = props.pop('texture_path')
            base64_uri = image_to_base64_uri(texture_path)
            if base64_uri:
                image_idx = len(gltf['images'])
                gltf['images'].append({"uri": base64_uri})
                
                texture_idx = len(gltf['textures'])
                gltf['textures'].append({"source": image_idx, "sampler": 0})
                
                gltf_mat['pbrMetallicRoughness']['baseColorTexture'] = {"index": texture_idx}

        gltf['materials'].append(gltf_mat)

    if "default" not in material_map and any(k == "default" for k in obj_data['face_groups']):
         material_map["default"] = len(gltf['materials'])
         gltf['materials'].append({'pbrMetallicRoughness': {'baseColorFactor': [0.8, 0.8, 0.8, 1.0]}, 'doubleSided': True})

    # 2. ジオメトリデータの処理
    vertex_data = struct.pack(f'<{len(obj_data["vertices"])}f', *obj_data["vertices"])
    normal_data = struct.pack(f'<{len(obj_data["normals"])}f', *obj_data["normals"])
    texcoord_data = struct.pack(f'<{len(obj_data["texcoords"])}f', *obj_data["texcoords"])
    
    pos_offset = len(binary_blob); binary_blob.extend(vertex_data)
    norm_offset = len(binary_blob); binary_blob.extend(normal_data)
    uv_offset = len(binary_blob); binary_blob.extend(texcoord_data)

    pos_bv_idx = len(gltf['bufferViews'])
    gltf['bufferViews'].append({"buffer": 0, "byteOffset": pos_offset, "byteLength": len(vertex_data), "target": 34962})
    gltf['accessors'].append({"bufferView": pos_bv_idx, "componentType": 5126, "count": len(obj_data["vertices"]) // 3, "type": "VEC3", "min": [min(obj_data["vertices"][i::3]) for i in range(3)], "max": [max(obj_data["vertices"][i::3]) for i in range(3)]})
    
    norm_acc_idx, uv_acc_idx = -1, -1
    if normal_data:
        norm_bv_idx = len(gltf['bufferViews'])
        gltf['bufferViews'].append({"buffer": 0, "byteOffset": norm_offset, "byteLength": len(normal_data), "target": 34962})
        norm_acc_idx = len(gltf['accessors'])
        gltf['accessors'].append({"bufferView": norm_bv_idx, "componentType": 5126, "count": len(obj_data["normals"]) // 3, "type": "VEC3"})

    if texcoord_data:
        uv_bv_idx = len(gltf['bufferViews'])
        gltf['bufferViews'].append({"buffer": 0, "byteOffset": uv_offset, "byteLength": len(texcoord_data), "target": 34962})
        uv_acc_idx = len(gltf['accessors'])
        gltf['accessors'].append({"bufferView": uv_bv_idx, "componentType": 5126, "count": len(obj_data["texcoords"]) // 2, "type": "VEC2"})
    
    # 3. プリミティブ（面データ）の処理
    for mat_name, faces in obj_data['face_groups'].items():
        if not faces: continue
        
        indices_data = struct.pack(f'<{len(faces)}I', *faces)
        indices_offset = len(binary_blob); binary_blob.extend(indices_data)
        
        indices_bv_idx = len(gltf['bufferViews'])
        gltf['bufferViews'].append({"buffer": 0, "byteOffset": indices_offset, "byteLength": len(indices_data), "target": 34963})
        
        indices_acc_idx = len(gltf['accessors'])
        gltf['accessors'].append({"bufferView": indices_bv_idx, "componentType": 5125, "count": len(faces), "type": "SCALAR", "min": [min(faces)], "max": [max(faces)]})
        
        primitive = {"attributes": {"POSITION": 0}, "indices": indices_acc_idx, "material": material_map.get(mat_name, 0)}
        if norm_acc_idx != -1: primitive["attributes"]["NORMAL"] = norm_acc_idx
        if uv_acc_idx != -1: primitive["attributes"]["TEXCOORD_0"] = uv_acc_idx
        
        gltf['meshes'][0]['primitives'].append(primitive)

    # 4. GLBファイルの組み立て
    gltf['buffers'].append({"byteLength": len(binary_blob)})
    json_str = json.dumps(gltf, separators=(',', ':'))
    json_bytes = json_str.encode('utf-8')
    
    # JSONチャンクのパディング (4バイトアライメント)
    while len(json_bytes) % 4 != 0:
        json_bytes += b' '
    
    # BINチャンクのパディング (4バイトアライメント)
    while len(binary_blob) % 4 != 0:
        binary_blob.append(0)

    # GLBヘッダ (Magic, Version, Length)
    file_length = 12 + 8 + len(json_bytes) + 8 + len(binary_blob)
    header = struct.pack('<I I I', 0x46546C67, 2, file_length)
    
    # JSONチャンク (Length, Type)
    json_chunk = struct.pack('<I I', len(json_bytes), 0x4E4F534A) + json_bytes
    
    # BINチャンク (Length, Type)
    bin_chunk = struct.pack('<I I', len(binary_blob), 0x004E4942) + binary_blob
    
    with open(output_glb_file, 'wb') as f:
        f.write(header)
        f.write(json_chunk)
        f.write(bin_chunk)

    print(f"GLB生成完了: {output_glb_file}")

# -- メイン処理 ------------------
def main():
    obj_file = Path(INPUT_OBJ_FILE)
    if not obj_file.exists():
        print(f"エラー: OBJファイルが見つかりません: {obj_file}")
        return
        
    obj_dir = obj_file.parent
    mtl_file = ""
    with open(obj_file, 'r', encoding='utf-8') as f:
        for line in f:
            if line.strip().startswith('mtllib'):
                mtl_file = obj_dir / line.strip().split(None, 1)[1]
                break

    output_file = get_output_filename(str(obj_file))
    
    print("=== OBJ+MTL → GLB(単一ファイル) 変換開始 ===")
    start_time = time.time()
    
    obj_data = load_obj_data(obj_file)
    mtl_data = load_mtl_file(mtl_file, obj_dir)
    create_glb_file(obj_data, mtl_data, output_file, obj_dir)

    end_time = time.time()
    print(f"\n=== 変換完了（処理時間: {end_time - start_time:.2f}秒） ===")
    print(f"出力ファイル: {output_file} ({os.path.getsize(output_file) / 1024**2:.2f} MB)")

if __name__ == "__main__":
    main()
