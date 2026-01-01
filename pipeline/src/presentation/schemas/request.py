
from pydantic import BaseModel

class ConversionRequest(BaseModel):
    storage_path: str
    output_format: str = "glb"

class ConversionResponse(BaseModel):
    original_path: str
    converted_path: str
    format: str
