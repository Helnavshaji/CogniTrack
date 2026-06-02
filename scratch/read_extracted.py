import os

path = r"c:\Users\ADMIN\cognitive-health-ai\scratch\history_extracted\app.jsx_v1_line81.txt"
if os.path.exists(path):
    print("File size:", os.path.getsize(path))
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
        print("Literal contents first 500 chars:")
        print(repr(content[:500]))
        print("Literal contents last 500 chars:")
        print(repr(content[-500:]))
else:
    print("File does not exist")
