with open(r"c:\Users\ADMIN\cognitive-health-ai\frontend\src\Checkin.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
    for num, line in enumerate(lines, 1):
        if "getSentimentEmoji" in line and "const" in line:
            for i in range(num - 1, min(num + 30, len(lines))):
                # print lines safely using repr or similar
                print(f"{i+1}: {repr(lines[i].strip())}")
            break
