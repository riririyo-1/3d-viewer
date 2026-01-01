
from fastapi import APIRouter, HTTPException
from src.presentation.schemas.request import ConversionRequest, ConversionResponse
from src.application.usecases.obj_to_glb_usecase import ObjToGlbUseCase

router = APIRouter()

@router.post("/obj2glb", response_model=ConversionResponse)
async def convert_obj_to_glb(request: ConversionRequest):
    usecase = ObjToGlbUseCase()
    try:
        converted_path = usecase.execute(request.storage_path)
        return ConversionResponse(
            original_path=request.storage_path,
            converted_path=converted_path,
            format="glb"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
