import os

dir_path = r"c:\Users\ADMIN\cognitive-health-ai\scratch\history_extracted"
for f in os.listdir(dir_path):
    full_path = os.path.join(dir_path, f)
    if os.path.isfile(full_path) and f.endswith(".txt"):
        with open(full_path, "r", encoding="utf-8") as file_obj:
            content = file_obj.read()
            is_truncated = "truncated" in content
            print(f"{f}: size={os.path.getsize(full_path)} is_truncated={is_truncated}")
