from pathlib import Path
from typing import Any

import whisper

from config import settings
from utils.logger import get_logger

logger = get_logger("services.transcription")

class TranscriptionError(Exception):
    """Custom exception for transcription failures."""
    pass

# Initialize Whisper model
try:
    logger.info(f"Loading Whisper model: {settings.WHISPER_MODEL}")
    model = whisper.load_model(settings.WHISPER_MODEL)
    logger.info("Whisper model loaded successfully")
except Exception as e:
    logger.error(f"Failed to load Whisper model: {e}")
    model = None


def transcribe_audio(
    audio_path: str | Path,
    task: str = "transcribe",
    language: str = "en"
) -> dict[str, Any]:
    """
    Transcribes audio file using OpenAI Whisper (English Only).

    Args:
        audio_path: Absolute path to the audio file.
        task: Either 'transcribe' or 'translate'.
        language: Language code (e.g., 'en').

    Returns:
        Dictionary containing 'text' and 'segments'.

    Raises:
        RuntimeError: If Whisper model fails to initialize.
        FileNotFoundError: If audio file is missing.
        TranscriptionError: If transcription process fails.
    """
    if model is None:
        raise RuntimeError("Whisper model not initialized properly.")

    audio_path = Path(audio_path)
    if not audio_path.exists():
        logger.error(f"Audio file not found: {audio_path}")
        raise FileNotFoundError(f"Audio file not found: {audio_path}")

    try:
        logger.info(f"Transcribing {audio_path.name} (task={task}, lang={language})")
        result = model.transcribe(
            str(audio_path),
            task=task,
            language=language,
            verbose=False,
            word_timestamps=True
        )

        # Split segments into Reel-style chunks
        raw_segments = result.get("segments", [])
        reel_segments = split_into_reel_segments(
            raw_segments, max_words=settings.MAX_WORDS_PER_SEGMENT
        )

        result["segments"] = reel_segments
        logger.info(f"Transcription complete: {len(reel_segments)} segments generated.")

        return result
    except Exception as e:
        logger.error(f"Whisper transcription failed: {e}")
        raise TranscriptionError(f"Transcription failed: {str(e)}") from e


def split_into_reel_segments(
    segments: list[dict[str, Any]], max_words: int = 4
) -> list[dict[str, Any]]:
    """
    Splits long Whisper segments into smaller chunks based on word count.

    Args:
        segments: List of segments from Whisper.
        max_words: Maximum words per output segment.

    Returns:
        List of refined segments.
    """
    new_segments = []

    for seg in segments:
        words = seg.get("words", [])
        if not words:
            new_segments.append(seg)
            continue

        for i in range(0, len(words), max_words):
            chunk = words[i : i + max_words]
            if not chunk:
                continue

            chunk_text = " ".join([w["word"].strip() for w in chunk])
            new_segments.append({
                "start": chunk[0]["start"],
                "end": chunk[-1]["end"],
                "text": chunk_text
            })

    return new_segments
