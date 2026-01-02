
import unittest
from unittest.mock import patch, MagicMock
from src.infrastructure.converters.obj2gltf_converter import Obj2GltfConverter

class TestObj2GltfConverter(unittest.TestCase):
    @patch('subprocess.run')
    def test_convert_success(self, mock_run):
        # Setup
        mock_result = MagicMock()
        mock_result.returncode = 0
        mock_run.return_value = mock_result
        
        converter = Obj2GltfConverter()
        input_path = "test.obj"
        output_path = "test.glb"
        
        # Execute
        result = converter.convert(input_path, output_path)
        
        # Verify
        self.assertEqual(result, output_path)
        mock_run.assert_called_once()
        args = mock_run.call_args[0][0]
        self.assertIn("obj2gltf", args)
        self.assertIn("-i", args)
        self.assertIn(input_path, args)
        self.assertIn("-o", args)
        self.assertIn(output_path, args)

    @patch('subprocess.run')
    def test_convert_failure(self, mock_run):
        # Setup
        mock_result = MagicMock()
        mock_result.returncode = 1
        mock_result.stderr = "Error converting"
        mock_run.return_value = mock_result
        
        converter = Obj2GltfConverter()
        
        # Execute & Verify
        with self.assertRaises(Exception) as context:
            converter.convert("in.obj", "out.glb")
        
        self.assertIn("obj2gltf failed", str(context.exception))
