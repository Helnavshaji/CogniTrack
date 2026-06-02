with open(r"c:\Users\ADMIN\cognitive-health-ai\frontend\src\Checkin.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
    with open("scratch/find_returns.txt", "w", encoding="utf-8") as out:
        for num, line in enumerate(lines, 1):
            if "return" in line:
                out.write(f"Line {num}: {line.strip()}\n")
print("Done!")
