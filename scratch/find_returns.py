with open(r"c:\Users\ADMIN\cognitive-health-ai\frontend\src\Checkin.jsx", "r", encoding="utf-8") as f:
    for num, line in enumerate(f, 1):
        if "return (" in line or "return" in line:
            # print line number and strip
            print(f"Line {num}: {line.strip()}")
