import numpy as np
from typing import Optional

BIOMARKERS_TO_TRACK = [
    "speech_rate_wpm", "pause_ratio", "mean_pause_duration_s",
    "type_token_ratio", "filler_rate", "semantic_coherence",
    "emotional_valence", "avg_sentence_length", "flesch_kincaid_grade",
    "pitch_variability", "energy_variability"
]

MIN_SESSIONS_FOR_BASELINE = 7
ALERT_THRESHOLD = 2.0

ALERT_DIRECTIONS = {
    "speech_rate_wpm": "decrease",
    "pause_ratio": "increase",
    "mean_pause_duration_s": "increase",
    "type_token_ratio": "decrease",
    "filler_rate": "increase",
    "semantic_coherence": "decrease",
    "emotional_valence": "decrease",
    "avg_sentence_length": "decrease",
    "flesch_kincaid_grade": "decrease",
    "pitch_variability": "decrease",
    "energy_variability": "decrease",
}

def update_baseline(existing_baseline: dict, new_session: dict) -> dict:
    baseline = existing_baseline.copy() if existing_baseline else {}

    for metric in BIOMARKERS_TO_TRACK:
        val = new_session.get(metric)
        if val is None:
            continue

        if metric not in baseline:
            baseline[metric] = {
                "mean": val, "std": 0, "count": 1, "M2": 0
            }
        else:
            n = baseline[metric]["count"] + 1
            delta = val - baseline[metric]["mean"]
            mean = baseline[metric]["mean"] + delta / n
            delta2 = val - mean
            M2 = baseline[metric]["M2"] + delta * delta2
            std = np.sqrt(M2 / n) if n > 1 else 0
            baseline[metric] = {
                "mean": round(mean, 5),
                "std": round(std, 5),
                "count": n,
                "M2": M2
            }

    return baseline

def detect_drift(current_session: dict, baseline: dict, session_count: int) -> Optional[dict]:
    if session_count < MIN_SESSIONS_FOR_BASELINE:
        return None

    alerts = []
    z_scores = {}

    for metric in BIOMARKERS_TO_TRACK:
        if metric not in baseline or metric not in current_session:
            continue

        b = baseline[metric]
        if b["std"] < 0.001:
            continue

        current_val = current_session[metric]
        z_score = (current_val - b["mean"]) / b["std"]
        z_scores[metric] = round(z_score, 2)

        direction = ALERT_DIRECTIONS.get(metric, "both")
        triggered = False

        if direction == "decrease" and z_score < -ALERT_THRESHOLD:
            triggered = True
        elif direction == "increase" and z_score > ALERT_THRESHOLD:
            triggered = True
        elif direction == "both" and abs(z_score) > ALERT_THRESHOLD:
            triggered = True

        if triggered:
            alerts.append({
                "metric": metric,
                "z_score": round(z_score, 2),
                "current": round(current_val, 3),
                "baseline_mean": round(b["mean"], 3),
            })

    if not alerts:
        return None

    return {
        "triggered": True,
        "alerts": alerts,
        "z_scores": z_scores,
        "summary": _interpret_alerts(alerts),
        "severity": "high" if len(alerts) >= 3 else "medium" if len(alerts) >= 2 else "low"
    }

def _interpret_alerts(alerts: list) -> str:
    descriptions = {
        "speech_rate_wpm": "speaking slower than usual",
        "pause_ratio": "pausing more than usual",
        "mean_pause_duration_s": "longer pauses between words",
        "type_token_ratio": "less vocabulary variety",
        "filler_rate": "more filler words than usual",
        "semantic_coherence": "lower topic coherence",
        "emotional_valence": "more negative tone than usual",
        "avg_sentence_length": "using shorter sentences",
        "flesch_kincaid_grade": "speech complexity decreased",
        "pitch_variability": "more monotone voice",
        "energy_variability": "flatter vocal energy"
    }
    messages = [descriptions.get(a["metric"], a["metric"]) for a in alerts]
    return "; ".join(messages)