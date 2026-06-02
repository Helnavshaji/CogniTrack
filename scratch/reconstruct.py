import json
import os

log_path = r"C:\Users\ADMIN\.gemini\antigravity\brain\0a62f74e-5814-4302-8a62-340fb55cb32f\.system_generated\logs\transcript.jsonl"

print("Scanning transcript to reconstruct file versions...")

files_history = {}

with open(log_path, "r", encoding="utf-8") as f:
    for line_num, line in enumerate(f, 1):
        try:
            data = json.loads(line)
        except Exception:
            continue
        
        # Check tool calls
        tool_calls = data.get("tool_calls", [])
        for call in tool_calls:
            name = call.get("name", "")
            if name == "write_to_file":
                args = call.get("args", {})
                target = args.get("TargetFile", "")
                content = args.get("CodeContent", "")
                description = args.get("Description", "")
                
                if target:
                    basename = os.path.basename(target).lower()
                    if basename not in files_history:
                        files_history[basename] = []
                    
                    files_history[basename].append({
                        "line": line_num,
                        "description": description,
                        "content": content
                    })

# Let's print out the history for each file
for basename, versions in files_history.items():
    print(f"\n--- {basename} has {len(versions)} versions in history ---")
    for idx, ver in enumerate(versions):
        # Snippet of content
        snippet = ver["content"][:100].replace("\n", " ")
        print(f"[{idx}] Line {ver['line']}: {ver['description'][:80]} | Content length: {len(ver['content'])} | Snippet: {snippet}")

print("\nFinished scan.")
