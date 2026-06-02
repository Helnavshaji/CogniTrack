with open(r"c:\Users\ADMIN\cognitive-health-ai\backend\main.py", "r", encoding="utf-8") as f:
    lines = f.readlines()
    with open("scratch/main_save.txt", "w", encoding="utf-8") as out:
        for i in range(74, min(140, len(lines))):
            out.write(f"{i+1}: {lines[i]}")
print("Done!")
