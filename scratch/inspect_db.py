import sqlite3
import json

conn = sqlite3.connect('data/sessions.db')
cursor = conn.cursor()

# Get table schema
cursor.execute("PRAGMA table_info(sessions)")
print("SCHEMA:")
for row in cursor.fetchall():
    print(row)

# Get row count
cursor.execute("SELECT COUNT(*) FROM sessions")
print("\nROW COUNT:", cursor.fetchone()[0])

# Get last 5 rows (just session_id, created_at, transcript, and keys of ai_analysis)
cursor.execute("SELECT session_id, created_at, transcript, ai_analysis FROM sessions ORDER BY created_at DESC LIMIT 5")
print("\nLAST 5 ROWS:")
for row in cursor.fetchall():
    sess_id, created_at, transcript, ai_analysis_str = row
    try:
        ai_analysis = json.loads(ai_analysis_str) if ai_analysis_str else {}
        ai_analysis_keys = list(ai_analysis.keys())
    except Exception as e:
        ai_analysis_keys = f"ERROR parsing JSON: {e}"
    print(f"SessionID: {sess_id} | CreatedAt: {created_at} | Transcript: {transcript[:50]}... | AI Analysis keys: {ai_analysis_keys}")

conn.close()
