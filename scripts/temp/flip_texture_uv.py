#!/usr/bin/env python3
# Material_271のテクスチャUV座標を左右反転させるスクリプト

import os
from pathlib import Path


# -- OBJファイルのUV座標を反転 ------------------
def flip_uv_for_material(obj_file, target_material="Material_271"):
    print(f"OBJファイル読込み: {obj_file}")

    # テクスチャ座標を格納
    vt_list = []
    # Material_271で使用されているvtインデックスを記録
    target_vt_indices = set()
    current_material = None

    # 1回目のパス: Material_271で使用されているvtインデックスを収集
    with open(obj_file, 'r', encoding='utf-8') as f:
        for line in f:
            parts = line.strip().split()
            if not parts:
                continue

            cmd = parts[0]

            if cmd == 'vt':
                vt_list.append(line)
            elif cmd == 'usemtl':
                current_material = parts[1]
            elif cmd == 'f' and current_material == target_material:
                # 面の各頂点からvtインデックスを抽出
                for part in parts[1:]:
                    indices = part.split('/')
                    if len(indices) > 1 and indices[1]:
                        vt_idx = int(indices[1])
                        target_vt_indices.add(vt_idx)

    print(f"反転対象のUV座標数: {len(target_vt_indices)}")

    # 2回目のパス: ファイルを書き換え
    output_lines = []
    vt_counter = 0

    with open(obj_file, 'r', encoding='utf-8') as f:
        for line in f:
            parts = line.strip().split()
            if not parts:
                output_lines.append(line)
                continue

            cmd = parts[0]

            if cmd == 'vt':
                vt_counter += 1
                if vt_counter in target_vt_indices:
                    # U座標を反転 (1.0 - u)
                    u, v = float(parts[1]), float(parts[2])
                    u_flipped = 1.0 - u
                    output_lines.append(f"vt {u_flipped} {v}\n")
                else:
                    output_lines.append(line)
            else:
                output_lines.append(line)

    # バックアップを作成
    backup_file = obj_file.with_suffix('.obj.bak2')
    if not backup_file.exists():
        print(f"バックアップ作成: {backup_file}")
        os.rename(obj_file, backup_file)
    else:
        print(f"既存バックアップを上書き: {backup_file}")
        os.replace(obj_file, backup_file)

    # 反転後のファイルを書き込み
    with open(obj_file, 'w', encoding='utf-8') as f:
        f.writelines(output_lines)

    print(f"UV反転完了: {obj_file}")


def main():
    obj_dir = Path("frontend/public/obj/iMac_21.5inch")
    obj_file = obj_dir / "iMac_21.5inch.obj"

    if not obj_file.exists():
        print(f"エラー: OBJファイルが見つかりません: {obj_file}")
        return

    print("=== Material_271 テクスチャUV反転処理開始 ===")
    flip_uv_for_material(obj_file, "Material_271")
    print("\n=== UV反転完了 ===")
    print("元のファイルは .bak2 として保存されています。")


if __name__ == "__main__":
    main()
