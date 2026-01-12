from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from src.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health/")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@patch("src.presentation.routers.conversion.ObjToGlbUseCase")
def test_convert_obj_to_glb(mock_usecase_cls):
    # Setup mock
    mock_instance = mock_usecase_cls.return_value
    mock_instance.execute.return_value = "path/to/converted.glb"

    payload = {"storage_path": "user/test/model.obj", "output_format": "glb"}

    # Execute
    response = client.post("/conversion/obj2glb", json=payload)

    # Verify
    assert response.status_code == 200
    data = response.json()
    assert data["original_path"] == "user/test/model.obj"
    assert data["converted_path"] == "path/to/converted.glb"
    assert data["format"] == "glb"
    mock_instance.execute.assert_called_once_with("user/test/model.obj")
