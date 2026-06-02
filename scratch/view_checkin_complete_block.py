with open(r"c:\Users\ADMIN\cognitive-health-ai\frontend\src\Checkin.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
    with open("scratch/checkin_complete_block.txt", "w", encoding="utf-8") as out:
        for i in range(414, min(445, len(lines))):
            out.write(f"{i+1}: {lines[i]}")
print("Done!")
