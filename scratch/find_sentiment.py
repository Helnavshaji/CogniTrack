with open(r"c:\Users\ADMIN\cognitive-health-ai\frontend\src\Checkin.jsx", "r", encoding="utf-8") as f:
    for num, line in enumerate(f, 1):
        if "sentiment" in line:
            # print line number and safe repr
            print(f"Line {num}: {repr(line.strip())}")
