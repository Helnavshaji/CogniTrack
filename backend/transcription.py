import os
import uuid
from datetime import datetime
from groq import Groq

# Initialize Groq client using environment variable
def get_groq_client():
    return Groq(api_key=os.getenv("GROQ_API_KEY"))

def transcribe_audio(audio_file_path: str) -> dict:
    """
    Transcribes recorded audio using Groq's fast cloud Whisper API.
    Returns the full text transcript along with word-level timestamps.
    """
    try:
        client = get_groq_client()
        with open(audio_file_path, "rb") as file:
            transcription = client.audio.transcriptions.create(
                file=(os.path.basename(audio_file_path), file.read()),
                model="whisper-large-v3-turbo",
                response_format="verbose_json",
                timestamp_granularities=["word"],
                language="en"
            )

        # Extract word timings for speech rate & pause calculations
        words_with_timing = []
        raw_words = getattr(transcription, "words", []) or []

        for item in raw_words:
            word = getattr(item, "word", "") if hasattr(item, "word") else item.get("word", "")
            start = getattr(item, "start", 0.0) if hasattr(item, "start") else item.get("start", 0.0)
            end = getattr(item, "end", 0.0) if hasattr(item, "end") else item.get("end", 0.0)
            
            words_with_timing.append({
                "word": str(word).strip(),
                "start": float(start),
                "end": float(end)
            })

        transcript_text = getattr(transcription, "text", "").strip()

        return {
            "text": transcript_text,
            "words": words_with_timing,
            "language": "en",
            "duration": words_with_timing[-1]["end"] if words_with_timing else 0
        }

    except Exception as e:
        print(f"Transcription failed: {e}")
        return {
            "text": "",
            "words": [],
            "language": "en",
            "duration": 0
        }

def save_audio_file(audio_bytes: bytes, user_id: str) -> str:
    """Saves incoming audio bytes to a local file in the audio directory."""
    os.makedirs("audio", exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"audio/{user_id}_{timestamp}_{uuid.uuid4().hex[:8]}.wav"
    with open(filename, "wb") as f:
        f.write(audio_bytes)
    return filename