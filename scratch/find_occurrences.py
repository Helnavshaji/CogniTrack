import os

for root, dirs, files in os.walk("."):
    if "node_modules" in root or "venv" in root or ".git" in root:
        continue
    for file in files:
        if file.endswith(".py") or file.endswith(".js") or file.endswith(".jsx") or file.endswith(".json") or file.endswith(".html"):
            path = os.path.join(root, file)
            try:
                with open(path, "r", encoding="utf-8") as f:
                    content = f.read()
                if "llama3-70b-8192" in content or "Groq" in content:
                    print(f"Found in {path}")
            except Exception as e:
                pass
