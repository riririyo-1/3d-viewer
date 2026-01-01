
import os
import uuid
from src.infrastructure.converters.obj2gltf_converter import Obj2GltfConverter
from src.infrastructure.storage.minio_client import MinioClient

class ObjToGlbUseCase:
    def __init__(self):
        self.converter = Obj2GltfConverter()
        self.storage = MinioClient()
        self.temp_dir = "temp"

    def execute(self, storage_path: str) -> str:
        # storage_path e.g., "userId/fileId/model.obj"
        
        # Determine paths
        filename = os.path.basename(storage_path)
        base_name = os.path.splitext(filename)[0]
        local_input_path = os.path.join(self.temp_dir, f"{uuid.uuid4()}_{filename}")
        local_output_path = os.path.splitext(local_input_path)[0] + ".glb"
        
        try:
            # 1. Download
            self.storage.download_file(storage_path, local_input_path)
            
            # 2. Convert
            self.converter.convert(local_input_path, local_output_path, binary=True)
            
            # 3. Upload
            # New path: same directory as original, but .glb
            remote_dir = os.path.dirname(storage_path)
            new_storage_path = f"{remote_dir}/{base_name}.glb"
            
            self.storage.upload_file(new_storage_path, local_output_path, "model/gltf-binary")
            
            return new_storage_path
            
        finally:
            # Cleanup
            if os.path.exists(local_input_path):
                os.remove(local_input_path)
            if os.path.exists(local_output_path):
                os.remove(local_output_path)
