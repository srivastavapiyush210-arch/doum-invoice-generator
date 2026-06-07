import os
import shutil

src_path = "public/invoice_template_bg.png"
dest_dir = "server/assets"
dest_path = os.path.join(dest_dir, "invoice_template_bg.png")

if os.path.exists(src_path):
    os.makedirs(dest_dir, exist_ok=True)
    shutil.copy2(src_path, dest_path)
    print(f"Successfully copied {src_path} to {dest_path}")
else:
    print(f"Error: {src_path} does not exist!")
