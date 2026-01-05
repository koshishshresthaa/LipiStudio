# 🎙️ LipiStudio

LipiStudio is a professional, streamlined AI-powered video captioning engine. Designed specifically for high-impact "Reel-style" content, it transforms raw video into engaging, captioned social media assets in seconds.

## ✨ Features

- **Rapid Transcription**: Leverages OpenAI Whisper `turbo` for lightning-fast, accurate English subtitles.
- **High-Impact Styling**: Automatically chunks captions into 3-4 word segments optimized for TikTok, Reels, and Shorts.
- **Single-Line Enforcement**: Ensures captions remain clean and non-distracting with a strict single-line layout.
- **Audio Integrity**: Advanced FFmpeg mapping guarantees the original audio quality is perfectly preserved.
- **Professional Architecture**: Centralized configuration, strict typing, and robust logging built for extensibility.

## 🛠️ Tech Stack

- **Backend**: FastAPI, OpenAI Whisper, FFmpeg, Pydantic v2
- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons
- **Tooling**: Ruff (Linting/Formatting), Pytest, pre-commit

## 🚀 Quick Start

### Prerequisites
- Python 3.12+
- Node.js 18+
- FFmpeg installed on your system

### 1. Backend Setup
```bash
cd src/backend
uv venv
source .venv/bin/activate
uv pip install -e .
python -m uvicorn main:app --reload
```

### 2. Frontend Setup
```bash
cd src/frontend
npm install
npm run dev
```

## 📐 Project Structure

```text
├── src/
│   ├── backend/        # FastAPI Service, Whisper logic, Subtitle engine
│   └── frontend/       # React Studio Interface
├── uploads/            # (Ignored) Storage for video assets
└── pyproject.toml      # Project dependencies and metadata
```
<img width="1920" height="963" alt="image" src="https://github.com/user-attachments/assets/ae63b59d-e7ce-4618-adaa-e30dfc0813f8" />
