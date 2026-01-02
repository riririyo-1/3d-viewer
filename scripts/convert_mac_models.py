#!/usr/bin/env python3
# iMacとMacBookAirのOBJファイルをGLBに変換するスクリプト

import os
import sys
import json
import struct
import base64
import time
from pathlib import Path
from collections import defaultdict


# -- 画像をBase64データURIにエンコード ------------------
def image_to_base64_uri(filepath):
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


# -- MTLファイル読込み ------------------
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


# -- OBJファイル読込み ------------------
def load_obj_data(obj_file):
    print(f"OBJファイル読込み開始: {obj_file}")
    v, vt, vn = [], [], []
    material_groups = defaultdict(lambda: {
        'vertices': [], 'normals': [], 'texcoords': [], 'indices': [], 'vertex_cache': {}
    })
    current_material = "default"

    with open(obj_file, 'r', encoding='utf-8') as file:
        for line in file:
            parts = line.strip().split()
            if not parts: continue

            cmd = parts[0]
            if cmd == 'v':
                v.append([float(parts[1]), float(parts[2]), float(parts[3])])
            elif cmd == 'vt':
                # GLTFではV座標が反転しているので、1.0 - v で反転
                u = float(parts[1])
                v_coord = float(parts[2])
                vt.append([u, 1.0 - v_coord])
            elif cmd == 'vn':
                vn.append([float(parts[1]), float(parts[2]), float(parts[3])])
            elif cmd == 'usemtl':
                current_material = parts[1]
            elif cmd == 'f':
                group = material_groups[current_material]
                face_vertices = []
                for vert_str in parts[1:]:
                    if vert_str in group['vertex_cache']:
                        face_vertices.append(group['vertex_cache'][vert_str])
                    else:
                        v_idx, vt_idx, vn_idx = None, None, None
                        idx_parts = vert_str.split('/')
                        if len(idx_parts) >= 1 and idx_parts[0]:
                            v_idx = int(idx_parts[0]) - 1
                        if len(idx_parts) >= 2 and idx_parts[1]:
                            vt_idx = int(idx_parts[1]) - 1
                        if len(idx_parts) >= 3 and idx_parts[2]:
                            vn_idx = int(idx_parts[2]) - 1

                        if v_idx is not None and 0 <= v_idx < len(v):
                            group['vertices'].extend(v[v_idx])
                        else:
                            group['vertices'].extend([0, 0, 0])

                        if vn_idx is not None and 0 <= vn_idx < len(vn):
                            group['normals'].extend(vn[vn_idx])
                        else:
                            group['normals'].extend([0, 0, 1])

                        if vt_idx is not None and 0 <= vt_idx < len(vt):
                            group['texcoords'].extend(vt[vt_idx])
                        else:
                            group['texcoords'].extend([0, 0])

                        new_idx = len(group['vertex_cache'])
                        group['vertex_cache'][vert_str] = new_idx
                        face_vertices.append(new_idx)

                # 三角形分割
                for i in range(1, len(face_vertices) - 1):
                    group['indices'].extend([face_vertices[0], face_vertices[i], face_vertices[i+1]])

    print(f"OBJ読込み完了: {len(material_groups)} マテリアルグループ")
    for mat, group in material_groups.items():
        vertex_count = len(group['vertices']) // 3
        face_count = len(group['indices']) // 3
        print(f"  {mat}: {vertex_count} vertices, {face_count} faces")
    
    return material_groups


# -- GLBファイル生成 ------------------
def create_glb_file(material_groups, mtl_data, output_glb_file, obj_dir):
    print(f"\nGLBファイル生成開始: {output_glb_file}")
    
    binary_data = bytearray()
    buffer_views = []
    accessors = []
    meshes = []
    textures = []
    images = []
    materials_gltf = []
    
    texture_map = {}
    
    # 各マテリアルグループを処理
    for mat_name, group in material_groups.items():
        if not group['indices']:
            continue
        
        # 頂点データをバイナリに追加
        vertices_bytes = struct.pack(f'{len(group["vertices"])}f', *group['vertices'])
        vertex_offset = len(binary_data)
        binary_data.extend(vertices_bytes)
        vertex_byte_length = len(vertices_bytes)
        
        # 法線データ
        normals_bytes = struct.pack(f'{len(group["normals"])}f', *group['normals'])
        normal_offset = len(binary_data)
        binary_data.extend(normals_bytes)
        normal_byte_length = len(normals_bytes)
        
        # テクスチャ座標
        texcoords_bytes = struct.pack(f'{len(group["texcoords"])}f', *group['texcoords'])
        texcoord_offset = len(binary_data)
        binary_data.extend(texcoords_bytes)
        texcoord_byte_length = len(texcoords_bytes)
        
        # インデックスデータ（unsigned intを使用）
        indices_bytes = struct.pack(f'{len(group["indices"])}I', *group['indices'])
        index_offset = len(binary_data)
        binary_data.extend(indices_bytes)
        index_byte_length = len(indices_bytes)
        
        # BufferView作成
        vertex_buffer_view_idx = len(buffer_views)
        buffer_views.append({
            "buffer": 0,
            "byteOffset": vertex_offset,
            "byteLength": vertex_byte_length,
            "target": 34962
        })
        
        normal_buffer_view_idx = len(buffer_views)
        buffer_views.append({
            "buffer": 0,
            "byteOffset": normal_offset,
            "byteLength": normal_byte_length,
            "target": 34962
        })
        
        texcoord_buffer_view_idx = len(buffer_views)
        buffer_views.append({
            "buffer": 0,
            "byteOffset": texcoord_offset,
            "byteLength": texcoord_byte_length,
            "target": 34962
        })
        
        index_buffer_view_idx = len(buffer_views)
        buffer_views.append({
            "buffer": 0,
            "byteOffset": index_offset,
            "byteLength": index_byte_length,
            "target": 34963
        })
        
        # Accessor作成
        vertex_count = len(group['vertices']) // 3
        
        # 頂点座標のmin/max計算
        vertices_list = group['vertices']
        x_coords = [vertices_list[i] for i in range(0, len(vertices_list), 3)]
        y_coords = [vertices_list[i+1] for i in range(0, len(vertices_list), 3)]
        z_coords = [vertices_list[i+2] for i in range(0, len(vertices_list), 3)]
        
        vertex_accessor_idx = len(accessors)
        accessors.append({
            "bufferView": vertex_buffer_view_idx,
            "componentType": 5126,
            "count": vertex_count,
            "type": "VEC3",
            "max": [max(x_coords), max(y_coords), max(z_coords)],
            "min": [min(x_coords), min(y_coords), min(z_coords)]
        })
        
        normal_accessor_idx = len(accessors)
        accessors.append({
            "bufferView": normal_buffer_view_idx,
            "componentType": 5126,
            "count": vertex_count,
            "type": "VEC3"
        })
        
        texcoord_accessor_idx = len(accessors)
        accessors.append({
            "bufferView": texcoord_buffer_view_idx,
            "componentType": 5126,
            "count": vertex_count,
            "type": "VEC2"
        })
        
        index_accessor_idx = len(accessors)
        accessors.append({
            "bufferView": index_buffer_view_idx,
            "componentType": 5125,  # UNSIGNED_INT
            "count": len(group['indices']),
            "type": "SCALAR"
        })
        
        # マテリアル処理
        material_idx = len(materials_gltf)
        mat_def = mtl_data.get(mat_name, {})
        
        gltf_material = {
            "name": mat_name,
            "pbrMetallicRoughness": mat_def.get('pbrMetallicRoughness', {
                'baseColorFactor': [0.8, 0.8, 0.8, 1.0],
                'metallicFactor': 0.0,
                'roughnessFactor': 0.8
            }),
            "emissiveFactor": mat_def.get('emissiveFactor', [0.0, 0.0, 0.0]),
            "alphaMode": mat_def.get('alphaMode', 'OPAQUE'),
            "doubleSided": mat_def.get('doubleSided', True)
        }
        
        # テクスチャ処理
        if 'texture_path' in mat_def:
            texture_path = mat_def['texture_path']
            if texture_path not in texture_map:
                data_uri = image_to_base64_uri(texture_path)
                if data_uri:
                    image_idx = len(images)
                    images.append({"uri": data_uri})
                    texture_idx = len(textures)
                    textures.append({"source": image_idx})
                    texture_map[texture_path] = texture_idx
                    gltf_material['pbrMetallicRoughness']['baseColorTexture'] = {"index": texture_idx}
            else:
                gltf_material['pbrMetallicRoughness']['baseColorTexture'] = {"index": texture_map[texture_path]}
        
        materials_gltf.append(gltf_material)
        
        # Primitive作成
        primitive = {
            "attributes": {
                "POSITION": vertex_accessor_idx,
                "NORMAL": normal_accessor_idx,
                "TEXCOORD_0": texcoord_accessor_idx
            },
            "indices": index_accessor_idx,
            "material": material_idx
        }
        
        meshes.append({"primitives": [primitive]})
    
    # glTF JSONの組み立て
    gltf = {
        "asset": {"version": "2.0", "generator": "Custom OBJ to GLB Converter"},
        "scene": 0,
        "scenes": [{"nodes": list(range(len(meshes)))}],
        "nodes": [{"mesh": i} for i in range(len(meshes))],
        "meshes": meshes,
        "accessors": accessors,
        "bufferViews": buffer_views,
        "buffers": [{"byteLength": len(binary_data)}]
    }
    
    if materials_gltf:
        gltf["materials"] = materials_gltf
    if textures:
        gltf["textures"] = textures
    if images:
        gltf["images"] = images
    
    # GLBファイル書き込み
    json_data = json.dumps(gltf, separators=(',', ':'))
    json_bytes = json_data.encode('utf-8')
    json_padding = (4 - len(json_bytes) % 4) % 4
    json_bytes += b' ' * json_padding
    
    binary_padding = (4 - len(binary_data) % 4) % 4
    binary_data.extend(b'\x00' * binary_padding)
    
    with open(output_glb_file, 'wb') as f:
        # GLBヘッダー
        f.write(struct.pack('<I', 0x46546C67))  # magic: 'glTF'
        f.write(struct.pack('<I', 2))            # version
        total_length = 12 + 8 + len(json_bytes) + 8 + len(binary_data)
        f.write(struct.pack('<I', total_length))
        
        # JSONチャンク
        f.write(struct.pack('<I', len(json_bytes)))
        f.write(struct.pack('<I', 0x4E4F534A))  # 'JSON'
        f.write(json_bytes)
        
        # バイナリチャンク
        f.write(struct.pack('<I', len(binary_data)))
        f.write(struct.pack('<I', 0x004E4942))  # 'BIN\0'
        f.write(binary_data)
    
    print(f"GLB生成完了: {output_glb_file}")


def convert_model(obj_dir_name, obj_filename):
    """指定されたモデルをOBJからGLBに変換"""
    obj_dir = Path(f"frontend/public/obj/{obj_dir_name}")
    obj_file = obj_dir / f"{obj_filename}.obj"
    
    if not obj_file.exists():
        print(f"エラー: OBJファイルが見つかりません: {obj_file}")
        return False
    
    output_dir = Path(f"frontend/public/glb/{obj_dir_name}")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # MTLファイルを探す
    mtl_file = None
    with open(obj_file, 'r', encoding='utf-8') as f:
        for line in f:
            if line.strip().startswith('mtllib'):
                mtl_filename = line.strip().split(None, 1)[1]
                mtl_file = obj_dir / mtl_filename
                break
    
    output_file = output_dir / f"{obj_filename}.glb"
    
    print(f"\n{'='*60}")
    print(f"=== {obj_filename} の変換開始 ===")
    print(f"{'='*60}")
    start_time = time.time()
    
    material_groups = load_obj_data(obj_file)
    mtl_data = load_mtl_file(mtl_file, obj_dir) if mtl_file else {}
    create_glb_file(material_groups, mtl_data, output_file, obj_dir)
    
    end_time = time.time()
    print(f"\n変換完了（処理時間: {end_time - start_time:.2f}秒）")
    print(f"出力ファイル: {output_file} ({os.path.getsize(output_file) / 1024**2:.2f} MB)")
    
    return True


def main():
    print("="*60)
    print("=== iMac & MacBookAir OBJ → GLB 変換 ===")
    print("="*60)
    
    models = [
        ("iMac_21.5inch", "iMac_21.5inch"),
        ("MacBookAir_13inch", "MacBookAir_13inch")
    ]
    
    success_count = 0
    for obj_dir_name, obj_filename in models:
        if convert_model(obj_dir_name, obj_filename):
            success_count += 1
    
    print("\n" + "="*60)
    print(f"=== 全ての変換が完了しました ({success_count}/{len(models)}) ===")
    print("="*60)


if __name__ == "__main__":
    main()
