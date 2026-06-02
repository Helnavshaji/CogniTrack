import json
import os

log_path = r"C:\Users\ADMIN\.gemini\antigravity\brain\0a62f74e-5814-4302-8a62-340fb55cb32f\.system_generated\logs\transcript.jsonl"

files_of_interest = [
    "app.jsx",
    "dashboard.jsx",
    "splash.jsx",
    "brainportal.jsx",
    "index.css",
    "customcursor.jsx",
    "checkin.jsx"
]

print("Scanning log file...")
if not os.path.exists(log_path):
    print("Log file does not exist at:", log_path)
    exit(1)

history = []

with open(log_path, "r", encoding="utf-8") as f:
    for line_num, line in enumerate(f, 1):
        try:
            data = json.loads(line)
        except Exception:
            continue
        
        tool_calls = data.get("tool_calls", [])
        for call in tool_calls:
            name = call.get("name", "")
            if name in ["write_to_file", "replace_file_content", "multi_replace_file_content"]:
                args = call.get("args", {})
                
                # Parse values which may be JSON string encoded
                parsed_args = {}
                for k, v in args.items():
                    if isinstance(v, str):
                        try:
                            # Try parsing as JSON string (like removing literal surrounding quotes)
                            parsed_args[k] = json.loads(v)
                        except Exception:
                            # If it fails, strip double quotes manually
                            parsed_args[k] = v.strip('"\'')
                    else:
                        parsed_args[k] = v
                
                target = parsed_args.get("TargetFile", "")
                if target:
                    basename = os.path.basename(target).lower()
                    if basename in files_of_interest:
                        history.append({
                            "line": line_num,
                            "tool": name,
                            "target": target,
                            "basename": basename,
                            "args": parsed_args
                        })

print(f"\nFound {len(history)} tool calls modifying our files of interest.")

# Sort history by line number
history.sort(key=lambda x: x["line"])

# For each file of interest, let's find the FIRST version (the original before modifications)
# and print some details, then write them to scratch
os.makedirs("scratch/history_extracted", exist_ok=True)

written_files = set()
for item in history:
    fname = item["basename"]
    line = item["line"]
    tool = item["tool"]
    args = item["args"]
    
    # We want to look at what was written. For replace_file_content, it's a diff. 
    # For write_to_file, it is the full code.
    print(f"Line {line}: {tool} on {item['target']}")
    
    if tool == "write_to_file":
        code = args.get("CodeContent", "")
        if code:
            # Save this version
            version_id = len([x for x in written_files if x.startswith(fname)]) + 1
            out_path = f"scratch/history_extracted/{fname}_v{version_id}_line{line}.txt"
            with open(out_path, "w", encoding="utf-8") as out_f:
                out_f.write(code)
            print(f"  -> Saved full file version to {out_path}")
            written_files.add(f"{fname}_v{version_id}")
    elif tool == "replace_file_content":
        # Save the ReplacementContent and TargetContent so we can inspect
        target_content = args.get("TargetContent", "")
        replacement_content = args.get("ReplacementContent", "")
        out_path = f"scratch/history_extracted/{fname}_replace_line{line}.json"
        with open(out_path, "w", encoding="utf-8") as out_f:
            json.dump({"target": target_content, "replacement": replacement_content}, out_f, indent=2)
        print(f"  -> Saved replacement details to {out_path}")
