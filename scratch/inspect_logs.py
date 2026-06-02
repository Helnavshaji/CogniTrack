import json

log_path = r"C:\Users\ADMIN\.gemini\antigravity\brain\0a62f74e-5814-4302-8a62-340fb55cb32f\.system_generated\logs\transcript.jsonl"

with open(log_path, "r", encoding="utf-8") as f:
    for i in range(10):
        line = f.readline()
        if not line:
            break
        try:
            data = json.loads(line)
            print(f"Line {i+1}: keys = {list(data.keys())}")
            if "type" in data:
                print(f"  type = {data['type']}")
            if "tool_calls" in data:
                print(f"  tool_calls count = {len(data['tool_calls'])}")
                print(f"  tool_calls first = {data['tool_calls'][0]}")
            if "content" in data and data["content"]:
                print(f"  content length = {len(data['content'])}")
        except Exception as e:
            print(f"Line {i+1} error: {e}")
