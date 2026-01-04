from pathlib import Path

from config import settings


def test_settings_initialization():
    """Verify that settings are loaded with correct types and paths."""
    assert settings.PROJECT_NAME == "LipiStudio"
    assert isinstance(settings.BASE_DIR, Path)
    assert settings.WHISPER_MODEL == "turbo"

def test_upload_directory_exists():
    """Ensures the upload directory is created automatically."""
    assert settings.UPLOAD_DIR.exists()
    assert settings.UPLOAD_DIR.is_dir()
