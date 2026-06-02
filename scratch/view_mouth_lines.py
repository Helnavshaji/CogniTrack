with open(r"c:\Users\ADMIN\cognitive-health-ai\frontend\src\Checkin.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
    with open("scratch/mouth_lines.txt", "w", encoding="utf-8") as out:
        for i in range(269, min(300, len(lines))):
            out.write(f"{i+1}: {lines[i]}")
print("Done!")
