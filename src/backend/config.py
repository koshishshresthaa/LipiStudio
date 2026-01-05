from pathlib import Path
from typing import Any

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

    # Caption Templates
    CAPTION_TEMPLATES: dict[str, dict[str, Any]] = {
        "modern_reel": {
            "font_size": 10,
            "margin_v": 60,
            "bold": 1,
            "outline": 2,
            "shadow": 0.5,
            "primary_color": "&H00FFFFFF",
            "outline_color": "&H00000000",
        },
        "highlight": {
            "font_size": 14,
            "margin_v": 80,
            "bold": 1,
            "outline": 3,
            "shadow": 1.5,
            "primary_color": "&H0000FFFF",  # Yellow
            "outline_color": "&H00000000",
        },
        "minimalist": {
            "font_size": 8,
            "margin_v": 40,
            "bold": 0,
            "outline": 1,
            "shadow": 0,
            "primary_color": "&H00EEEEEE",  # Off-white/Light grey
            "outline_color": "&H00000000",
        },
    }
    DEFAULT_TEMPLATE: str = "modern_reel"
    SUBTITLE_WRAP_STYLE: int = 2  # No wrap

    # Processing Constraints
    MAX_WORDS_PER_SEGMENT: int = 4

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        self.LOGS_DIR.mkdir(parents=True, exist_ok=True)

# Global settings instance
settings = Settings()
