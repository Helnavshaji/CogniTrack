from sqlalchemy import create_engine, Column, Integer, Float, String, DateTime, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data/sessions.db")

os.makedirs("data", exist_ok=True)
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class Session(Base):
    __tablename__ = "sessions"
    id = Column(Integer, primary_key=True)
    user_id = Column(String, index=True)
    session_id = Column(String, unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    transcript = Column(Text)
    audio_path = Column(String)
    speech_rate_wpm = Column(Float)
    pause_count = Column(Integer)
    mean_pause_duration_s = Column(Float)
    pause_ratio = Column(Float)
    energy_mean = Column(Float)
    energy_variability = Column(Float)
    pitch_mean_hz = Column(Float)
    pitch_variability = Column(Float)
    avg_sentence_length = Column(Float)
    flesch_kincaid_grade = Column(Float)
    type_token_ratio = Column(Float)
    filler_rate = Column(Float)
    semantic_coherence = Column(Float)
    emotional_valence = Column(Float)
    self_reference_ratio = Column(Float)
    ai_analysis = Column(JSON)
    alert_triggered = Column(String, nullable=True)

class UserBaseline(Base):
    __tablename__ = "baselines"
    id = Column(Integer, primary_key=True)
    user_id = Column(String, unique=True, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow)
    session_count = Column(Integer, default=0)
    baseline_data = Column(JSON)

Base.metadata.create_all(engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        