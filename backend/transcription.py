import whisper
import os
import uuid
from datetime import datetime

# Add ffmpeg to path for Windows
os.environ["PATH"] += r";C:\Users\ADMIN\ffmpeg\ffmpeg-8.1.1-essentials_build\bin"

# Load model once at startup
print("Loading Whisper model...")
model = whisper.load_model("base")
print("Whisper model loaded!")

def transcribe_audio(audio_file_path: str) -> dict:
    try:
        result = model.transcribe(
            audio_file_path,
            word_timestamps=True,
            verbose=False
        )

        words_with_timing = []
        for segment in result.get("segments", []):
            for word_info in segment.get("words", []):
                words_with_timing.append({
                    "word": word_info["word"].strip(),
                    "start": word_info["start"],
                    "end": word_info["end"]
                })

        return {
            "text": result["text"].strip(),
            "words": words_with_timing,
            "language": result.get("language", "en"),
            "duration": words_with_timing[-1]["end"] if words_with_timing else 0
        }

    except Exception as e:
        print(f"Transcription error: {e}")
        return {
            "text": "",
            "words": [],
            "language": "en",
            "duration": 0
        }

def save_audio_file(audio_bytes: bytes, user_id: str) -> str:
    os.makedirs("audio", exist_ok=True)
    filename = f"audio/{user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}.wav"
    with open(filename, "wb") as f:
        f.write(audio_bytes)
    return filename