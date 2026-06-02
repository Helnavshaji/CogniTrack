import os
from dotenv import load_dotenv
load_dotenv()

from groq import Groq
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

models_to_try = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "llama-3.1-70b-versatile",
    "mixtral-8x7b-32768"
]

for model in models_to_try:
    try:
        print(f"Trying model: {model}...")
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": "Say hello"}],
            max_tokens=10
        )
        print(f"Success with {model}! Response: {response.choices[0].message.content.strip()}")
        break
    except Exception as e:
        print(f"Failed with {model}: {e}")
