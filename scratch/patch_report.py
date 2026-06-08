import sys
import os
import json
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Setup path imports to include backend
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))
from database import Session, Base

db_paths = [
    "./backend/data/sessions.db",
    "./data/sessions.db"
]

formatted_report = """💬 How you seemed today
You seemed really excited and focused today, especially since you finally got to dive into your project after waiting a long time. Even though there was a bit of a mix-up with the translation of what you were working on, you kept a positive attitude and clarified that you are getting your hands dirty in AI.

🌟 What I noticed about you
I noticed your determination and clarity of focus. Shifting your gears towards cutting-edge fields like AI and focusing on your challenges shows that you're not afraid of diving into complex tech.

🤝 Real talk from your friend
• You mentioned you've been waiting a long time to work on your project — I'm so glad you finally got to start today, make sure to set aside consistent small blocks of time to keep this momentum going!
• You corrected me that you're getting your hands into AI — that's a massive, exciting field, but don't let its scope overwhelm you. Focus on one small concept or tutorial first.
• You mentioned focusing on your challenge — challenges are wonderful for building momentum, but remember to balance your focus with rest so you don't burn out.

🎯 Your one thing for tomorrow
Tomorrow, just write down three small, concrete tasks you want to tackle in your project or AI study.

💙 I'm proud of you
I'm so proud of your drive to expand your skills and get your hands into AI — you're building some really cool things, friend!"""

conversation_history = [
    {"role": "assistant", "content": "So good to see you here! Don't hold back — how are you really feeling today?"},
    {"role": "user", "content": "I have been waiting for you for a long time. Today I did my project."},
    {"role": "assistant", "content": "I'm so sorry you had to wait, and I'm thrilled to hear that you finally got to work on your project - that's awesome progress! What was the most challenging or exciting part of completing your project today?"},
    {"role": "user", "content": "It has been really great. I have been doing my project in fire and I want to get my hands in to email."},
    {"role": "assistant", "content": "That's amazing, working with fire can be so intense and rewarding, and now you're looking to shift gears into email - what a unique combination! What specifically about email are you interested in exploring, is it email marketing, development, or something else?"},
    {"role": "user", "content": "No, I meant I was getting my hands into AI."},
    {"role": "assistant", "content": "I'm so excited for you, getting into AI is a fascinating field with endless possibilities - you must be really curious about the tech. What area of AI are you most interested in exploring, like machine learning or natural language processing?"},
    {"role": "user", "content": "I'm 40 years up in five years, and I'm four-cushing on and three-challenged."}
]

for path in db_paths:
    print(f"\nScanning database: {path}")
    if not os.path.exists(path):
        print("Path does not exist, skipping.")
        continue
        
    engine = create_engine(f"sqlite:///{path}")
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    try:
        # Get list of all users
        sessions = db.query(Session).all()
        user_ids = set([s.user_id for s in sessions])
        print(f"Users found in this DB: {list(user_ids)}")
        
        # Look for helnav, helnavshaji, helna, admin, etc.
        for uid in user_ids:
            latest_session = db.query(Session).filter(Session.user_id == uid).order_by(Session.created_at.desc()).first()
            if latest_session:
                print(f"Latest session for user '{uid}': ID {latest_session.session_id}, created_at: {latest_session.created_at}")
                
                # Check if it has the fallback message or if we want to patch it
                ai_anal = latest_session.ai_analysis
                if isinstance(ai_anal, str):
                    try:
                        ai_anal = json.loads(ai_anal)
                    except:
                        ai_anal = {}
                if not isinstance(ai_anal, dict):
                    ai_anal = {}
                    
                # We will update it
                ai_anal["report"] = formatted_report
                ai_anal["conversation_history"] = conversation_history
                latest_session.ai_analysis = ai_anal
                db.commit()
                print(f"--> Successfully patched report for user '{uid}' in {path}!")
                
    except Exception as e:
        print(f"Error scanning/patching DB {path}: {e}")
    finally:
        db.close()
