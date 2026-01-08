from minio import Minio
from src.config.settings import settings


class MinioClient:
    def __init__(self):
        self.client = Minio(
            f"{settings.MINIO_ENDPOINT}:{settings.MINIO_PORT}",
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_SECURE,
        )
        self.bucket = settings.MINIO_BUCKET_NAME

    def download_file(self, object_name: str, file_path: str):
        self.client.fget_object(self.bucket, object_name, file_path)

    def upload_file(
        self, object_name: str, file_path: str, content_type: str = "model/gltf-binary"
    ):
        self.client.fput_object(
            self.bucket, object_name, file_path, content_type=content_type
        )
