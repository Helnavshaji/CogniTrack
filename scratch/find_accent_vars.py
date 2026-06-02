with open(r"c:\Users\ADMIN\cognitive-health-ai\frontend\src\Checkin.jsx", "r", encoding="utf-8") as f:
    for num, line in enumerate(f, 1):
        if "var(--accent-" in line:
            print(f"Line {num}: {line.strip()}")
