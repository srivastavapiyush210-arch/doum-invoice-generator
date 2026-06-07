from PIL import Image
import os

img_path = r"c:\Users\sriva\OneDrive\Desktop\invoice generator\public\invoice_template_bg.png"
output_path = r"c:\Users\sriva\OneDrive\Desktop\invoice generator\scratch\bg_bottom_crop.png"

if os.path.exists(img_path):
    img = Image.open(img_path)
    w, h = img.size
    # Crop the bottom region where the address is (approx y: 90% to 96% of height)
    crop_rect = (0, int(h * 0.90), w, int(h * 0.96))
    cropped = img.crop(crop_rect)
    cropped.save(output_path)
    print(f"Saved background bottom crop to {output_path} ({cropped.size})")
else:
    print("Background image not found!")
