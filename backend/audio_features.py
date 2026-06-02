import librosa
import numpy as np
from typing import List, Dict
import os
import sys

def extract_audio_features(audio_path: str, word_timings: List[Dict]) -> dict:
    try:
        y, sr = librosa.load(audio_path, sr=16000)
        total_duration = librosa.get_duration(y=y, sr=sr)

        # Pause analysis
        pauses = []
        if len(word_timings) > 1:
            for i in range(1, len(word_timings)):
                gap = word_timings[i]["start"] - word_timings[i-1]["end"]
                if gap > 0.15:
                    pauses.append(gap)

        total_pause_time = sum(pauses) if pauses else 0
        speech_duration = total_duration - total_pause_time

        # Speech rate
        words_spoken = len(word_timings)
        words_per_minute = (words_spoken / speech_duration * 60) if speech_duration > 0 else 0

        # Energy
        rms = librosa.feature.rms(y=y)[0]
        energy_mean = float(np.mean(rms))
        energy_std = float(np.std(rms))

        # Pitch
        try:
            f0, voiced_flag, _ = librosa.pyin(y, fmin=80, fmax=400, sr=sr)
            voiced_f0 = f0[voiced_flag] if voiced_flag is not None else []
            pitch_mean = float(np.mean(voiced_f0)) if len(voiced_f0) > 0 else 0
            pitch_std = float(np.std(voiced_f0)) if len(voiced_f0) > 0 else 0
        except:
            pitch_mean = 0
            pitch_std = 0

        return {
            "speech_rate_wpm": round(words_per_minute, 2),
            "pause_count": len(pauses),
            "mean_pause_duration_s": round(float(np.mean(pauses)) if pauses else 0, 3),
            "max_pause_s": round(float(max(pauses)) if pauses else 0, 3),
            "pause_ratio": round(total_pause_time / total_duration, 3) if total_duration else 0,
            "energy_mean": round(energy_mean, 5),
            "energy_variability": round(energy_std, 5),
            "pitch_mean_hz": round(pitch_mean, 2),
            "pitch_variability": round(pitch_std, 2),
            "total_duration_s": round(total_duration, 2)
        }

    except Exception as e:
        print(f"Audio feature extraction error: {e}")
        return {
            "speech_rate_wpm": 0,
            "pause_count": 0,
            "mean_pause_duration_s": 0,
            "max_pause_s": 0,
            "pause_ratio": 0,
            "energy_mean": 0,
            "energy_variability": 0,
            "pitch_mean_hz": 0,
            "pitch_variability": 0,
            "total_duration_s": 0
        }