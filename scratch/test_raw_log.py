import json

log_path = r"C:\Users\ADMIN\.gemini\antigravity\brain\0a62f74e-5814-4302-8a62-340fb55cb32f\.system_generated\logs\transcript.jsonl"

with open(log_path, "r", encoding="utf-8") as f:
    for num, line in enumerate(f, 1):
        if num == 123:
            try:
                data = json.loads(line)
                # Print keys
                print("Keys:", list(data.keys()))
                calls = data.get("tool_calls", [])
                print("Tool calls count:", len(calls))
                if calls:
                    call = calls[0]
                    args = call.get("args", {})
                    code = args.get("CodeContent")
                    if code:
                        print("Code length in log:", len(code))
                        print("Does it contain '<truncated'?", "<truncated" in code)
                        print("First 200 chars:")
                        print(code[:200])
                        print("\nLast 200 chars:")
                        print(code[-200:])
            except Exception as e:
                print("Error:", e)
            break
