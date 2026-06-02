with open(r"c:\Users\ADMIN\cognitive-health-ai\frontend\src\Checkin.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
    with open("scratch/tofixed_checkin.txt", "w", encoding="utf-8") as out:
        for num, line in enumerate(lines, 1):
            if ".toFixed" in line:
                out.write(f"{num}: {line.strip()}\n")
print("Done!")
