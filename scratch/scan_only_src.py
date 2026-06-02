import os

def scan_dir(path):
    for root, dirs, files in os.walk(path):
        # exclude venv and node_modules
        dirs[:] = [d for d in dirs if d not in ["venv", "node_modules", ".git", ".gemini", "dist"]]
        for f in files:
            full_path = os.path.join(root, f)
            print(f"{full_path} - {os.path.getsize(full_path)} bytes")

print("Scanning only source/scratch files:")
scan_dir("c:\\Users\\ADMIN\\cognitive-health-ai")
