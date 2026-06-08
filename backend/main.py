from fastapi import FastAPI, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session as DBSession
from dotenv import load_dotenv
from datetime import datetime
import uvicorn
import os
import uuid
import json

load_dotenv()

from database import get_db, Session, UserBaseline, Base, engine
from transcription import transcribe_audio, save_audio_file
from biomarkers import extract_linguistic_biomarkers
from audio_features import extract_audio_features
from conversation import get_next_question, analyze_response_with_ai, generate_session_report
from drift_detection import update_baseline, detect_drift

Base.metadata.create_all(engine)

app = FastAPI(title="Cognitive Health Monitor")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "running"}

@app.post("/session/start")
async def start_session(user_id: str, db: DBSession = Depends(get_db)):
    session_id = str(uuid.uuid4())
    session_count = db.query(Session).filter(Session.user_id == user_id).count()
    first_question = get_next_question([], session_count + 1)
    return {
        "session_id": session_id,
        "first_question": first_question,
        "session_number": session_count + 1
    }

@app.post("/session/respond")
async def process_response(
    audio: UploadFile = File(None),
    session_id: str = Form(...),
    user_id: str = Form(...),
    question: str = Form(...),
    history: str = Form(default="[]"),
    text_response: str = Form(default=None),
    db: DBSession = Depends(get_db)
):
    if text_response is not None:
        # User typed a direct response
        transcript_text = text_response.strip()
        audio_path = ""
        try:
            print(f"\n>>> User typed: {transcript_text}")
        except Exception:
            pass

        # Default acoustic features for typed text checkin
        acoustic_features = {
            "speech_rate_wpm": 0.0,
            "pause_count": 0,
            "mean_pause_duration_s": 0.0,
            "max_pause_s": 0.0,
            "pause_ratio": 0.0,
            "energy_mean": 0.0,
            "energy_variability": 0.0,
            "pitch_mean_hz": 0.0,
            "pitch_variability": 0.0,
            "total_duration_s": 0.0
        }
    else:
        # User spoke a voice response
        # 1. Save audio
        audio_bytes = await audio.read()
        audio_path = save_audio_file(audio_bytes, user_id)

        # 2. Transcribe
        transcript_data = transcribe_audio(audio_path)
        transcript_text = transcript_data["text"]
        try:
            print(f"\n>>> User said: {transcript_text}")
        except Exception:
            pass

        # 3. Extract acoustic features
        acoustic_features = extract_audio_features(audio_path, transcript_data["words"])

    # 3. Extract linguistic biomarkers
    text_biomarkers = extract_linguistic_biomarkers(transcript_text)
    all_features = {**text_biomarkers, **acoustic_features}

    # 4. AI analysis
    ai_analysis = analyze_response_with_ai(transcript_text, question)

    # 5. Save to database
    new_session = Session(
        user_id=user_id,
        session_id=session_id + "_" + str(uuid.uuid4())[:8],
        transcript=transcript_text,
        audio_path=audio_path,
        ai_analysis=ai_analysis,
        **{k: all_features.get(k) for k in [
            "speech_rate_wpm", "pause_count", "mean_pause_duration_s",
            "pause_ratio", "energy_mean", "energy_variability",
            "pitch_mean_hz", "pitch_variability", "avg_sentence_length",
            "flesch_kincaid_grade", "type_token_ratio", "filler_rate",
            "semantic_coherence", "emotional_valence", "self_reference_ratio"
        ]}
    )
    db.add(new_session)
    db.commit()

    # 6. Update baseline
    baseline_record = db.query(UserBaseline).filter(
        UserBaseline.user_id == user_id
    ).first()
    existing_baseline = baseline_record.baseline_data if baseline_record else {}
    session_count = db.query(Session).filter(Session.user_id == user_id).count()
    new_baseline = update_baseline(existing_baseline, all_features)

    if baseline_record:
        baseline_record.baseline_data = new_baseline
        baseline_record.session_count = session_count
        baseline_record.updated_at = datetime.utcnow()
    else:
        baseline_record = UserBaseline(
            user_id=user_id,
            baseline_data=new_baseline,
            session_count=session_count
        )
        db.add(baseline_record)
    db.commit()

    # 7. Detect drift
    alert = detect_drift(all_features, new_baseline, session_count)
    if alert:
        new_session.alert_triggered = json.dumps(alert)
        db.commit()

    # 8. Rebuild full conversation history
    # history from frontend = everything BEFORE this exchange
    conversation_history = json.loads(history)
    
    # Now add current question + current answer
    conversation_history.append({
        "role": "assistant",
        "content": question
    })
    conversation_history.append({
        "role": "user", 
        "content": transcript_text
    })

    exchange_count = len([m for m in conversation_history if m["role"] == "user"])
    print(f"Exchange #{exchange_count} complete. Total messages: {len(conversation_history)}")

    # 9. After 4 exchanges — generate report
    if exchange_count >= 4:
        print("Session complete — generating personal report...")
        report = generate_session_report(conversation_history, all_features)
        
        # Save report and full conversation history inside ai_analysis JSON column
        ai_analysis_dict = dict(ai_analysis) if ai_analysis else {}
        ai_analysis_dict["report"] = report
        ai_analysis_dict["conversation_history"] = conversation_history
        new_session.ai_analysis = ai_analysis_dict
        db.commit()

        return {
            "status": "complete",
            "transcript": transcript_text,
            "alert": alert,
            "report": report
        }


    # 10. Get next question based on full real conversation
    next_question = get_next_question(conversation_history, session_count)

    return {
        "status": "continue",
        "next_question": next_question,
        "transcript": transcript_text,
        "alert": alert
    }

@app.get("/history/{user_id}")
async def get_history(user_id: str, db: DBSession = Depends(get_db)):
    sessions = db.query(Session).filter(
        Session.user_id == user_id
    ).order_by(Session.created_at).all()
    
    completed_sessions = []
    for s in sessions:
        ai_anal = s.ai_analysis or {}
        if isinstance(ai_anal, str):
            try:
                ai_anal = json.loads(ai_anal)
            except Exception:
                ai_anal = {}
        
        if isinstance(ai_anal, dict) and "report" in ai_anal:
            # Parse alert if stored as JSON string
            alert_data = None
            if s.alert_triggered:
                try:
                    alert_data = json.loads(s.alert_triggered)
                except Exception:
                    alert_data = {"summary": s.alert_triggered}
            
            completed_sessions.append({
                "date": s.created_at.strftime("%Y-%m-%d"),
                "speech_rate_wpm": s.speech_rate_wpm,
                "type_token_ratio": s.type_token_ratio,
                "semantic_coherence": s.semantic_coherence,
                "filler_rate": s.filler_rate,
                "pause_ratio": s.pause_ratio,
                "emotional_valence": s.emotional_valence,
                "transcript": s.transcript,
                "alert": alert_data,
                "report": ai_anal.get("report"),
                "conversation_history": ai_anal.get("conversation_history", [])
            })
            
    return {"sessions": completed_sessions}


@app.get("/baseline/{user_id}")
async def get_baseline(user_id: str, db: DBSession = Depends(get_db)):
    baseline = db.query(UserBaseline).filter(
        UserBaseline.user_id == user_id
    ).first()
    return {"baseline": baseline.baseline_data if baseline else {}}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)