from pathlib import Path
from typing import Any

import ffmpeg

from config import settings
from utils.logger import get_logger

logger = get_logger("services.subtitle")

class SubtitleError(Exception):
    """Custom exception for subtitle processing failures."""
    pass

def format_timestamp(seconds: float) -> str:
    """
    Formats seconds into SRT timestamp format (HH:MM:SS,mmm).

    Args:
        seconds: Time in seconds.

    Returns:
        Formatted SRT timestamp string.
    """
    milliseconds = int((seconds % 1) * 1000)
    minutes = int(seconds // 60)
    hours = int(minutes // 60)
    minutes = minutes % 60
    seconds = int(seconds % 60)
    return f"{hours:02}:{minutes:02}:{seconds:02},{milliseconds:03}"

def generate_srt_content(segments: list[dict[str, Any]]) -> str:
    """
    Converts Whisper segments list into valid SRT file content.

    Args:
        segments: List of segments from Whisper response.
        Each segment must have 'start', 'end', and 'text'.

    Returns:
        The complete SRT file content as a string.
    """
    srt_output = []
    for i, segment in enumerate(segments, start=1):
        start = format_timestamp(segment['start'])
        end = format_timestamp(segment['end'])
        text = segment['text'].strip()

        # SRT Entry
        srt_output.append(f"{i}")
        srt_output.append(f"{start} --> {end}")
        srt_output.append(text)
        srt_output.append("") # Blank line after each entry

    return "\n".join(srt_output)

def burn_subtitles(
    video_path: str | Path,
    segments: list[dict[str, Any]],
    template_id: str | None = None,
    output_path: str | Path | None = None
) -> str:
    """
    Burns subtitles into the video using ffmpeg hardsubs.

    Args:
        video_path: Absolute path to the input video.
        segments: List of caption segments.
        output_path: Path for the final video. Defaults to input_name_captioned.mp4.

    Returns:
        Path to the captioned video as a string.

    Raises:
        FileNotFoundError: If input video is missing.
        SubtitleError: If FFmpeg fails to burn subtitles.
    """
    video_path = Path(video_path)
    if not video_path.exists():
        logger.error(f"Video file not found for burning: {video_path}")
        raise FileNotFoundError(f"Video not found: {video_path}")

    # 1. Generate SRT file
    srt_content = generate_srt_content(segments)
    srt_path = video_path.with_suffix('.srt')

    try:
        with open(srt_path, "w", encoding="utf-8") as f:
            f.write(srt_content)

        # 2. Prepare Output Path
        if output_path is None:
            output_path = video_path.parent / f"{video_path.stem}_captioned.mp4"
        else:
            output_path = Path(output_path)

        # 3. Burn Subtitles
        logger.info(f"Burning subtitles for {video_path.name} with template: {template_id}")

        # Resolve Template
        tid = template_id or settings.DEFAULT_TEMPLATE
        template = settings.CAPTION_TEMPLATES.get(tid, settings.CAPTION_TEMPLATES[settings.DEFAULT_TEMPLATE])

        # Build ASS style string from selected template
        style = (
            f"Alignment=2,Fontsize={template['font_size']},"
            f"MarginV={template['margin_v']},Bold={template['bold']},"
            f"Outline={template['outline']},Shadow={template['shadow']},"
            f"PrimaryColour={template['primary_color']},"
            f"OutlineColour={template['outline_color']},"
            f"WrapStyle={settings.SUBTITLE_WRAP_STYLE}"
        )

        # Explicitly map video and audio to ensure audio is preserved
        input_stream = ffmpeg.input(str(video_path))
        video = input_stream.video.filter('subtitles', str(srt_path), force_style=style)
        audio = input_stream.audio

        # Use vcodec libx264 for video and aac for audio
        stream = ffmpeg.output(video, audio, str(output_path), vcodec='libx264', acodec='aac')
        ffmpeg.run(stream, overwrite_output=True, capture_stdout=True, capture_stderr=True)

        logger.info(f"Subtitle burn successful: {output_path}")
        return str(output_path)

    except ffmpeg.Error as e:
        error_message = e.stderr.decode('utf-8') if e.stderr else str(e)
        logger.error(f"FFmpeg burn failed: {error_message}")
        raise SubtitleError(f"FFmpeg burn failed: {error_message}") from e
    except Exception as e:
        logger.error(f"Subtitle processing failed: {e}")
        raise SubtitleError(f"Processing failed: {str(e)}") from e
