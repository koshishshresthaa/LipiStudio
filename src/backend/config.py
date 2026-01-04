from pathlib import Path

from pydantic import BaseModel


class Settings(BaseModel):
    """
    Application settings and configuration.
    """
    # Project Identity
    PROJECT_NAME: str = "LipiStudio"
    VERSION: str = "0.1.0"

    # Paths
    BASE_DIR: Path = Path(__file__).resolve().parent
    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    LOGS_DIR: Path = BASE_DIR / "logs"

    # Model Configuration
    WHISPER_MODEL: str = "turbo"

    # Subtitle Styling (Reel Style)
    SUBTITLE_FONT_SIZE: int = 12
    SUBTITLE_MARGIN_V: int = 60
    SUBTITLE_BOLD: int = 1
    SUBTITLE_OUTLINE: int = 2
    SUBTITLE_SHADOW: float = 0.5
    SUBTITLE_COLOR: str = "&H00FFFFFF"  # White
    SUBTITLE_OUTLINE_COLOR: str = "&H00000000"  # Black
    SUBTITLE_WRAP_STYLE: int = 2  # No wrap

    # Processing Constraints
    MAX_WORDS_PER_SEGMENT: int = 4

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        self.LOGS_DIR.mkdir(parents=True, exist_ok=True)

# Global settings instance
settings = Settings()
