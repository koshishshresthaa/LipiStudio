import os
import shutil
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from config import settings
from services.audio import extract_audio, AudioExtractionError
from services.subtitle import burn_subtitles, SubtitleError
from services.transcription import transcribe_audio, TranscriptionError
from utils.logger import get_logger

# Initialize Logger
logger = get_logger("main")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Professional API for high-impact video captioning.",
    version=settings.VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the static files to allow previewing/downloading burned videos
app.mount("/outputs", StaticFiles(directory=str(settings.UPLOAD_DIR)), name="outputs")

# --- Models ---

class Segment(BaseModel):
    start: float = Field(..., description="Start time in seconds")
    end: float = Field(..., description="End time in seconds")
    text: str = Field(..., description="Caption text content")

class TranscriptionResponse(BaseModel):
    language: str
    segments: list[Segment]

class BurnRequest(BaseModel):
    video_path: str
    segments: list[Segment]

class BurnResponse(BaseModel):
    output_path: str
    download_url: str

# --- Endpoints ---

@app.get("/")
async def root() -> dict[str, str]:
    """Root endpoint to verify API health."""
    logger.info("Health check accessed")
    return {"status": "ok", "project": settings.PROJECT_NAME, "version": settings.VERSION}

@app.post("/upload")
async def upload_video(file: UploadFile = File(...)) -> dict[str, str]:
    """
    Uploads a video file to the server.
    """
    logger.info(f"Uploading file: {file.filename}")
    file_path = settings.UPLOAD_DIR / (file.filename or "uploaded_video.mp4")

    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        logger.info(f"File saved successfully: {file_path}")
        return {"filename": file.filename or "video.mp4", "path": str(file_path.absolute())}
    except Exception as e:
        logger.error(f"Failed to save file: {e}")
        raise HTTPException(status_code=500, detail=f"File storage failed: {str(e)}") from e

@app.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe(video_path: str = Form(...)) -> TranscriptionResponse:
    """
    Extracts audio and generates English transcripts.
    """
    logger.info(f"Transcription requested: {video_path}")
    path_obj = Path(video_path)

    if not path_obj.exists():
        logger.warning(f"File not found: {video_path}")
        raise HTTPException(status_code=404, detail="Video file not found")

    try:
        # 1. Extract Audio
        audio_path = extract_audio(path_obj)

        # 2. Transcribe
        result = transcribe_audio(audio_path, task="transcribe", language="en")

        return TranscriptionResponse(
            language="en",
            segments=[Segment(**seg) for seg in result.get("segments", [])]
        )

    except (AudioExtractionError, TranscriptionError) as e:
        logger.error(f"Processing failed: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e
    except Exception as e:
        logger.error(f"Unexpected error during transcription: {e}")
        raise HTTPException(status_code=500, detail="Internal processing error") from e

@app.post("/burn", response_model=BurnResponse)
async def burn_video(request: BurnRequest, req: Request) -> BurnResponse:
    """
    Burns the provided segments into the video.
    """
    logger.info(f"Burning subtitles for {request.video_path}")
    path_obj = Path(request.video_path)

    if not path_obj.exists():
        raise HTTPException(status_code=404, detail="Video file not found")

    try:
        segments_dict = [seg.model_dump() for seg in request.segments]
        output_path = burn_subtitles(path_obj, segments_dict)

        # Generate public URL
        filename = os.path.basename(output_path)
        base_url = str(req.base_url).rstrip("/")
        download_url = f"{base_url}/outputs/{filename}"

        return BurnResponse(output_path=output_path, download_url=download_url)
    except SubtitleError as e:
        logger.error(f"Burning failed: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e
    except Exception as e:
        logger.error(f"Unexpected error during burning: {e}")
        raise HTTPException(status_code=500, detail="Internal processing error") from e
