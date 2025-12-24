#!/usr/bin/env python
import os
import json
import struct
import base64
import time
import math
from pathlib import Path
from collections import defaultdict


# -- 設定 ------------------
INPUT_OBJ_DIR = Path("public/obj/'25-0912-FlexiSpot E7B Pro-3D-1")
OUTPUT_GLB_DIR = Path("public/glb")


# -- 回転行列を適用（X軸周りに-90度回転） ------------------
def rotate_x_90(x, y, z):
    """X軸周りに-90度回転"""
    return (x, z, -y)


def rotate_normal_x_90(nx, ny, nz):
    """法線ベクトルもX軸周りに-90度回転"""
    return (nx, nz, -ny)


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


# -- OBJファイル読込み（回転を適用） ------------------
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
                x, y, z = map(float, parts[1:4])
                v.append(rotate_x_90(x, y, z))
            elif cmd == 'vt':
                u_coord, v_coord = map(float, parts[1:3])
                vt.append((u_coord, 1.0 - v_coord))
            elif cmd == 'vn':
                nx, ny, nz = map(float, parts[1:4])
                vn.append(rotate_normal_x_90(nx, ny, nz))
            elif cmd == 'usemtl':
                current_material = parts[1]
            elif cmd == 'f':
                group = material_groups[current_material]
                vertex_cache = group['vertex_cache']
                face_indices = []

                for part in parts[1:]:
                    indices = [(int(i) if i else 0) for i in part.split('/')]
                    key = tuple(indices)

                    if key not in vertex_cache:
                        v_idx = indices[0]
                        vt_idx = indices[1] if len(indices) > 1 else 0
                        vn_idx = indices[2] if len(indices) > 2 else 0

                        group['vertices'].extend(v[v_idx - 1])
                        if vt_idx > 0:
                            group['texcoords'].extend(vt[vt_idx - 1])
                        if vn_idx > 0:
                            group['normals'].extend(vn[vn_idx - 1])

                        vertex_idx = len(group['vertices']) // 3 - 1
                        vertex_cache[key] = vertex_idx
                        face_indices.append(vertex_idx)
                    else:
                        face_indices.append(vertex_cache[key])

                for i in range(1, len(face_indices) - 1):
                    group['indices'].extend([face_indices[0], face_indices[i], face_indices[i + 1]])

    for group in material_groups.values():
        group.pop('vertex_cache', None)

    print(f"OBJ読込み完了: マテリアルグループ数={len(material_groups)}")
    return material_groups


# -- .glb ファイルを生成 ------------------
def create_glb_file(material_groups, mtl_data, output_glb_file, obj_dir):
    print(f"GLB生成開始: {output_glb_file}")

    gltf = {
        "asset": {"version": "2.0", "generator": "Python OBJ to GLB Converter with Rotation"},
        "scene": 0, "scenes": [{"nodes": [0]}], "nodes": [{"mesh": 0}],
        "meshes": [{"primitives": []}], "materials": [], "textures": [],
        "images": [], "samplers": [{"magFilter": 9729, "minFilter": 9987}],
        "accessors": [], "bufferViews": [], "buffers": []
    }
    binary_blob = bytearray()

    # -- マテリアルとテクスチャの処理 ------------------
    material_map = {}
    for name, props in mtl_data.items():
        material_idx = len(gltf['materials'])
        material_map[name] = material_idx

        gltf_mat = {
            'pbrMetallicRoughness': props['pbrMetallicRoughness'].copy(),
            'emissiveFactor': props['emissiveFactor'].copy(),
            'alphaMode': props['alphaMode'],
            'doubleSided': props['doubleSided']
        }

        if 'texture_path' in props:
            texture_path = props['texture_path']
            base64_uri = image_to_base64_uri(texture_path)
            if base64_uri:
                image_idx = len(gltf['images'])
                gltf['images'].append({"uri": base64_uri})

                texture_idx = len(gltf['textures'])
                gltf['textures'].append({"source": image_idx, "sampler": 0})

                gltf_mat['pbrMetallicRoughness']['baseColorTexture'] = {"index": texture_idx}

        gltf['materials'].append(gltf_mat)

    if "default" not in material_map and "default" in material_groups:
        material_map["default"] = len(gltf['materials'])
        gltf['materials'].append({'pbrMetallicRoughness': {'baseColorFactor': [0.8, 0.8, 0.8, 1.0]}, 'doubleSided': True})

    # -- 各マテリアルグループのプリミティブを作成 ------------------
    for mat_name, group in material_groups.items():
        if not group['indices']:
            continue

        vertices = group['vertices']
        normals = group['normals']
        texcoords = group['texcoords']
        indices = group['indices']

        # -- 頂点データ ------------------
        vertex_data = struct.pack(f'<{len(vertices)}f', *vertices)
        pos_offset = len(binary_blob)
        binary_blob.extend(vertex_data)

        pos_bv_idx = len(gltf['bufferViews'])
        gltf['bufferViews'].append({"buffer": 0, "byteOffset": pos_offset, "byteLength": len(vertex_data), "target": 34962})

        pos_acc_idx = len(gltf['accessors'])
        gltf['accessors'].append({
            "bufferView": pos_bv_idx, "componentType": 5126, "count": len(vertices) // 3, "type": "VEC3",
            "min": [min(vertices[i::3]) for i in range(3)],
            "max": [max(vertices[i::3]) for i in range(3)]
        })

        primitive = {"attributes": {"POSITION": pos_acc_idx}, "material": material_map.get(mat_name, 0)}

        # -- 法線データ ------------------
        if normals:
            normal_data = struct.pack(f'<{len(normals)}f', *normals)
            norm_offset = len(binary_blob)
            binary_blob.extend(normal_data)

            norm_bv_idx = len(gltf['bufferViews'])
            gltf['bufferViews'].append({"buffer": 0, "byteOffset": norm_offset, "byteLength": len(normal_data), "target": 34962})

            norm_acc_idx = len(gltf['accessors'])
            gltf['accessors'].append({"bufferView": norm_bv_idx, "componentType": 5126, "count": len(normals) // 3, "type": "VEC3"})
            primitive["attributes"]["NORMAL"] = norm_acc_idx

        # -- UV座標データ ------------------
        if texcoords:
            texcoord_data = struct.pack(f'<{len(texcoords)}f', *texcoords)
            uv_offset = len(binary_blob)
            binary_blob.extend(texcoord_data)

            uv_bv_idx = len(gltf['bufferViews'])
            gltf['bufferViews'].append({"buffer": 0, "byteOffset": uv_offset, "byteLength": len(texcoord_data), "target": 34962})

            uv_acc_idx = len(gltf['accessors'])
            gltf['accessors'].append({"bufferView": uv_bv_idx, "componentType": 5126, "count": len(texcoords) // 2, "type": "VEC2"})
            primitive["attributes"]["TEXCOORD_0"] = uv_acc_idx

        # -- インデックスデータ ------------------
        indices_data = struct.pack(f'<{len(indices)}I', *indices)
        indices_offset = len(binary_blob)
        binary_blob.extend(indices_data)

        indices_bv_idx = len(gltf['bufferViews'])
        gltf['bufferViews'].append({"buffer": 0, "byteOffset": indices_offset, "byteLength": len(indices_data), "target": 34963})

        indices_acc_idx = len(gltf['accessors'])
        gltf['accessors'].append({
            "bufferView": indices_bv_idx, "componentType": 5125, "count": len(indices), "type": "SCALAR",
            "min": [min(indices)], "max": [max(indices)]
        })
        primitive["indices"] = indices_acc_idx

        gltf['meshes'][0]['primitives'].append(primitive)

    # -- GLBファイルの組み立て ------------------
    gltf['buffers'].append({"byteLength": len(binary_blob)})
    json_str = json.dumps(gltf, separators=(',', ':'))
    json_bytes = json_str.encode('utf-8')

    while len(json_bytes) % 4 != 0:
        json_bytes += b' '

    while len(binary_blob) % 4 != 0:
        binary_blob.append(0)

    file_length = 12 + 8 + len(json_bytes) + 8 + len(binary_blob)
    header = struct.pack('<I I I', 0x46546C67, 2, file_length)

    json_chunk = struct.pack('<I I', len(json_bytes), 0x4E4F534A) + json_bytes

    bin_chunk = struct.pack('<I I', len(binary_blob), 0x004E4942) + binary_blob

    with open(output_glb_file, 'wb') as f:
        f.write(header)
        f.write(json_chunk)
        f.write(bin_chunk)

    print(f"GLB生成完了: {output_glb_file}")


# -- メイン処理 ------------------
def main():
    obj_file = INPUT_OBJ_DIR / "'25-0912-FlexiSpot E7B Pro-3D-1.obj"

    if not obj_file.exists():
        print(f"エラー: OBJファイルが見つかりません: {obj_file}")
        return

    OUTPUT_GLB_DIR.mkdir(parents=True, exist_ok=True)

    obj_dir = obj_file.parent
    mtl_file = ""
    with open(obj_file, 'r', encoding='utf-8') as f:
        for line in f:
            if line.strip().startswith('mtllib'):
                mtl_file = obj_dir / line.strip().split(None, 1)[1]
                break

    output_file = OUTPUT_GLB_DIR / "'25-0912-FlexiSpot E7B Pro-3D-1.glb"

    print("=== OBJ+MTL → GLB（90度回転付き）変換開始 ===")
    start_time = time.time()

    material_groups = load_obj_data(obj_file)
    mtl_data = load_mtl_file(mtl_file, obj_dir)
    create_glb_file(material_groups, mtl_data, output_file, obj_dir)

    end_time = time.time()
    print(f"\n=== 変換完了（処理時間: {end_time - start_time:.2f}秒） ===")
    print(f"出力ファイル: {output_file} ({os.path.getsize(output_file) / 1024**2:.2f} MB)")


if __name__ == "__main__":
    main()
