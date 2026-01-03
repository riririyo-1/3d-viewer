#!/usr/bin/env python3
# MacBookAir 13inchのOBJファイルを90度回転させるスクリプト

import os
from pathlib import Path


# 回転関数（X軸周りに-90度回転）
def rotate_x_90(x, y, z):
    """X軸周りに-90度回転"""
    return (x, z, -y)


def rotate_normal_x_90(nx, ny, nz):
    """法線ベクトルもX軸周りに-90度回転"""
    return (nx, nz, -ny)


# OBJファイルを回転させて上書き
def rotate_obj_file(obj_file):
    print(f"OBJファイル読込み: {obj_file}")

    output_lines = []

    with open(obj_file, 'r', encoding='utf-8') as f:
        for line in f:
            parts = line.strip().split()
            if not parts:
                output_lines.append(line)
                continue

            cmd = parts[0]

            if cmd == 'v':
                x, y, z = map(float, parts[1:4])
                rx, ry, rz = rotate_x_90(x, y, z)
                output_lines.append(f"v {rx} {ry} {rz}\n")

            elif cmd == 'vn':
                nx, ny, nz = map(float, parts[1:4])
                rnx, rny, rnz = rotate_normal_x_90(nx, ny, nz)
                output_lines.append(f"vn {rnx} {rny} {rnz}\n")

            else:
                output_lines.append(line)

    # バックアップを作成
    backup_file = obj_file.with_suffix('.obj.bak')
    if not backup_file.exists():
        print(f"バックアップ作成: {backup_file}")
        os.rename(obj_file, backup_file)

    # 回転後のファイルを書き込み
    with open(obj_file, 'w', encoding='utf-8') as f:
        f.writelines(output_lines)

    print(f"回転完了: {obj_file}")
    print(f"バックアップ: {backup_file}")


def main():
    obj_dir = Path("frontend/public/obj/MacBookAir_13inch")
    obj_file = obj_dir / "MacBookAir_13inch.obj"

    if not obj_file.exists():
        print(f"エラー: OBJファイルが見つかりません: {obj_file}")
        return

    print("=== MacBookAir 13inch OBJ 90度回転処理開始 ===")
    rotate_obj_file(obj_file)
    print("\n=== 回転完了 ===")
    print("元のファイルは .bak として保存されています。")


if __name__ == "__main__":
    main()
