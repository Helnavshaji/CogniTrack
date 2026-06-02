with open(r"c:\Users\ADMIN\cognitive-health-ai\frontend\src\Checkin.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
    for num, line in enumerate(lines, 1):
        if "function getSentimentEmoji" in line:
            # print that line and the next 30 lines
            for i in range(num - 1, min(num + 30, len(lines))):
                print(f"{i+1}: {lines[i].strip()}")
