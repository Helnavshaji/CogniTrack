import os

def scan_dir(path):
    for root, dirs, files in os.walk(path):
        for f in files:
            full_path = os.path.join(root, f)
            print(f"{full_path} - {os.path.getsize(full_path)} bytes")

print("Scanning c:\\Users\\ADMIN\\cognitive-health-ai...")
scan_dir("c:\\Users\\ADMIN\\cognitive-health-ai")
