from pathlib import Path

import ffmpeg

from utils.logger import get_logger

logger = get_logger("services.audio")

class AudioExtractionError(Exception):
    """Custom exception for audio extraction failures."""
    pass

def extract_audio(video_path: str | Path) -> str:
    """
    Extracts audio from a video file and saves it as an MP3.

    Args:
        video_path: Absolute path to the input video file.

    Returns:
        Path to the extracted MP3 file as a string.

    Raises:
        FileNotFoundError: If the input video file does not exist.
        AudioExtractionError: If FFmpeg fails to extract audio.
    """
    video_path = Path(video_path)
    if not video_path.exists():
        logger.error(f"Video file not found for extraction: {video_path}")
        raise FileNotFoundError(f"Video file not found: {video_path}")

    audio_path = video_path.with_suffix(".mp3")

    try:
        logger.info(f"Extracting audio from {video_path.name} to {audio_path.name}")

        # -vn: skip video, -acodec libmp3lame: use mp3 codec, -q:a 2: high quality VBR
        stream = ffmpeg.input(str(video_path))
        stream = ffmpeg.output(stream, str(audio_path), vn=None, acodec='libmp3lame', **{'q:a': 2})
        ffmpeg.run(stream, overwrite_output=True, capture_stdout=True, capture_stderr=True)

        logger.info(f"Audio extraction successful: {audio_path}")
    except ffmpeg.Error as e:
        error_msg = e.stderr.decode('utf-8') if e.stderr else str(e)
        logger.error(f"FFmpeg audio extraction failed: {error_msg}")
        raise AudioExtractionError(f"Failed to extract audio: {error_msg}") from e

    return str(audio_path)
