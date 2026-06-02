import sys
import os
from dotenv import load_dotenv

# Add backend directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

load_dotenv()

from conversation import get_next_question

try:
    print("Testing get_next_question with empty history:")
    q1 = get_next_question([], 1)
    print("First question:", q1)
    
    print("\nTesting get_next_question with user message:")
    history = [
        {"role": "assistant", "content": q1},
        {"role": "user", "content": "I am feeling a bit tired because I haven't slept well and have been skipping breakfast."}
    ]
    q2 = get_next_question(history, 1)
    print("Second question:", q2)
    print("\nAll tests passed successfully!")
except Exception as e:
    print("Error during test:", e)
    import traceback
    traceback.print_exc()
