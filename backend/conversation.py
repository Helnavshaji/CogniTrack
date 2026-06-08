from groq import Groq
import os
import json
import random

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

ALEX_SYSTEM = """You are Alex, a warm caring best friend doing a daily check-in conversation.

YOUR PERSONALITY:
- Talk exactly like a caring close friend texting — casual, warm, real
- You ALWAYS read what the person just said and respond TO THAT specifically
- If they are sad or struggling → comfort them warmly first, then ask a follow-up
- If they mention something specific (not eating, bad sleep, stress, loneliness) → address THAT directly
- If they are happy → celebrate with them genuinely, then dig deeper
- You ask ONE follow-up question per response, based on what they just told you
- Maximum 2 sentences total per response
- NEVER repeat a question already asked
- NEVER ask generic questions after the first one
- NEVER ignore what they said and jump to something unrelated

GOOD EXAMPLES:
Person: "I haven't eaten anything today"
Alex: "Hey that's not okay, please eat something — even a small snack helps your brain function 💙 What's been keeping you so caught up that you forgot to eat?"

Person: "I had really bad dreams last night"  
Alex: "Ugh bad dreams are the worst, they mess with your whole day 😔 Do you remember what the dreams were about, or has something been stressing you out lately?"

Person: "I'm so stressed about finding a job, nothing is working"
Alex: "That sounds genuinely exhausting, especially when you're putting in real effort 💙 How long have you been searching, and what kind of work are you going for?"

Person: "I talked to my friend today and felt a bit better"
Alex: "That's so good, having someone to talk to really does help 😊 What did you two talk about that made you feel better?"

BAD EXAMPLES (never do these):
- "How are you feeling about things right now?" (too generic, ignores what they said)
- "Tell me more about that — what's been the hardest part?" (robotic fallback)
- Repeating the same question twice"""


def call_ai(messages: list, max_tokens: int = 300) -> str:
    """Call Groq API with full message history."""
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            max_tokens=max_tokens,
            temperature=0.85
        )
        result = response.choices[0].message.content.strip()
        try:
            print(f"AI response: {result[:150]}")
        except Exception:
            pass
        return result
    except Exception as e:
        print(f"Groq API error: {e}")
        import traceback
        traceback.print_exc()
        raise e


def get_next_question(conversation_history: list, session_number: int) -> str:
    try:
        if not conversation_history:
            openers = [
                "Hey! Really glad you checked in today 😊 So tell me honestly — how are you actually doing right now?",
                "Hey friend! How has life been treating you lately — what's going on with you?",
                "So good to see you here! Don't hold back — how are you really feeling today?",
                "Hey! I've been thinking about you. What's been on your mind lately?",
            ]
            return random.choice(openers)

        # Get the last user message
        last_user_msg = ""
        for msg in reversed(conversation_history):
            if msg["role"] == "user":
                last_user_msg = msg["content"]
                break

        try:
            print(f"\n=== Generating follow-up ===")
            print(f"Last user said: {last_user_msg}")
        except Exception:
            pass

        # Build messages for Groq — system prompt + full conversation history
        messages = [{"role": "system", "content": ALEX_SYSTEM}]
        
        # Add full conversation history
        for msg in conversation_history:
            messages.append({
                "role": msg["role"],
                "content": msg["content"]
            })

        # Add instruction to respond to the last message
       # Add instruction to respond to the last message
        messages.append({
            "role": "user",
            "content": f"[INSTRUCTION - do not repeat this] The person just said: '{last_user_msg}'. Respond warmly to what they specifically said, then ask ONE follow-up question about it. Do NOT ask a generic question. Do NOT repeat any question already asked. Maximum 2 sentences."
        })

        result = call_ai(messages, max_tokens=150)
        return result
    except Exception as e:
        print(f"get_next_question error: {e}")
        # Smart fallbacks based on what they said
        if last_user_msg:
            words = last_user_msg.lower()
            if "eat" in words or "food" in words or "hungry" in words:
                return "Please don't skip meals — even something small helps 💙 What's been keeping you so busy today?"
            elif "sleep" in words or "tired" in words or "dream" in words:
                return "Not sleeping well really affects everything 😔 How long has this been going on for you?"
            elif "stress" in words or "anxious" in words or "worry" in words:
                return "That sounds really tough to carry around 💙 What do you think is the main thing stressing you out?"
            elif "happy" in words or "good" in words or "great" in words:
                return "That genuinely makes me smile! 😊 What's been making things feel better lately?"
            elif "sad" in words or "bad" in words or "terrible" in words:
                return "I'm really sorry you're feeling that way 💙 What's been the hardest part of it?"
        return "That sounds like a lot to deal with — how long have you been feeling this way?"


def generate_session_report(conversation_history: list, biomarkers: dict) -> str:
    try:
        # Build clean conversation text
        lines = []
        for msg in conversation_history:
            if msg["role"] == "assistant":
                lines.append(f"Alex: {msg['content']}")
            else:
                lines.append(f"Person: {msg['content']}")

        full_convo = "\n".join(lines)
        try:
            print(f"\n=== Generating report ===\n{full_convo}\n")
        except Exception:
            pass

        # Extract what the person actually said
        user_messages = [msg["content"] for msg in conversation_history if msg["role"] == "user"]
        all_user_text = " ".join(user_messages)

        messages = [
            {
                "role": "system",
                "content": """You are Alex, writing a personal WhatsApp message to your best friend after their daily check-in.
Write like a real caring friend — warm, personal, specific.
NEVER use clinical words. NEVER give generic advice.
ALWAYS reference specific things they actually said."""
            },
            {
                "role": "user",
                "content": f"""Here is the full check-in conversation you just had with your friend:

{full_convo}

Now write them a personal message. Reference SPECIFIC things they said.
If they mentioned not eating — tell them to eat.
If they mentioned bad sleep — give sleep advice.
If they mentioned stress — address that stress specifically.
Use their actual words when possible.

Write using these exact sections:

💬 How you seemed today
(2-3 warm sentences. Name the EXACT things they told you. Example: "You mentioned you haven't been eating and that the job search is really draining you...")

🌟 What I noticed about you  
(One specific positive thing from the conversation — their honesty, strength, or something good they shared)

🤝 Real talk from your friend
(3 specific pieces of advice. Each MUST reference something they actually said.
Start each with •
Examples:
- You said you haven't eaten today — please eat something right now, even just a banana. Your brain literally cannot work well on empty.
- You mentioned the job search feels hopeless — try sending just ONE application tomorrow morning. One small step breaks the stuck feeling.
- You said talking to your friend helped — reach out to them again this week, don't wait for them to initiate.)

🎯 Your one thing for tomorrow
(One tiny specific action based on what they told you. Very concrete. Start with "Tomorrow, just...")

💙 I'm proud of you
(One warm closing sentence that references something specific they said today. Make them feel heard.)

Keep it under 300 words. Personal and warm like a text from someone who truly cares.
Every single point MUST reference what they actually said in the conversation above."""
            }
        ]

        result = call_ai(messages, max_tokens=700)
        try:
            print(f"Report generated:\n{result[:300]}\n")
        except Exception:
            pass
        return result

    except Exception as e:
        print(f"Report error: {e}")
        import traceback
        traceback.print_exc()
        return "I really heard everything you shared today and I'm so glad you talked to me 💙 Take it one small step at a time — you've got this."


def analyze_response_with_ai(user_response: str, question_asked: str) -> dict:
    try:
        messages = [
            {
                "role": "system",
                "content": "You are an analyzer. Return only valid JSON, no markdown, no explanation."
            },
            {
                "role": "user",
                "content": f"""Analyze this response:
Question: {question_asked}
Response: {user_response}

Return only this JSON:
{{"sentiment": "positive", "detected_concerns": [], "summary": "one sentence about what they said"}}

Replace values with what actually applies. detected_concerns can include: sleep, food, stress, loneliness, work, health."""
            }
        ]
        result = call_ai(messages, max_tokens=150)
        result = result.replace("```json", "").replace("```", "").strip()
        return json.loads(result)
    except Exception as e:
        print(f"Analysis error: {e}")
        return {
            "sentiment": "neutral",
            "detected_concerns": [],
            "summary": user_response[:100]
        }