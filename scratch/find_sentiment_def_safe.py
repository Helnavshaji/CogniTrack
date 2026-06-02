with open(r"c:\Users\ADMIN\cognitive-health-ai\frontend\src\Checkin.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
    for num, line in enumerate(lines, 1):
        if "getSentimentEmoji" in line and "const" in line:
            with open("scratch/sentiment_def.txt", "w", encoding="utf-8") as out:
                for i in range(num - 1, min(num + 30, len(lines))):
                    out.write(f"{i+1}: {lines[i]}")
            break
print("Done!")
