import os
import shutil

src_dir = r"c:\Users\ADMIN\cognitive-health-ai\frontend\src"

pages_dir = os.path.join(src_dir, "pages")
components_dir = os.path.join(src_dir, "components")

if os.path.exists(pages_dir):
    print("Deleting pages dir...")
    shutil.rmtree(pages_dir)

if os.path.exists(components_dir):
    print("Deleting components dir...")
    shutil.rmtree(components_dir)

print("Cleanup done!")
