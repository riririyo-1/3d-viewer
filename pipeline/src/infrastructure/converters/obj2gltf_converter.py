import subprocess
import os


class Obj2GltfConverter:
    def convert(self, input_path: str, output_path: str, binary: bool = True):
        cmd = ["obj2gltf", "-i", input_path, "-o", output_path]
        if binary:
            cmd.append("--binary")

        result = subprocess.run(cmd, capture_output=True, text=True)

        if result.returncode != 0:
            raise Exception(f"obj2gltf failed: {result.stderr}")

        return output_path
