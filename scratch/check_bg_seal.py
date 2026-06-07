from PIL import Image
import os
import numpy as np

img_path = r"c:\Users\sriva\OneDrive\Desktop\invoice generator\public\invoice_template_bg.png"

if os.path.exists(img_path):
    img = Image.open(img_path).convert("RGB")
    w, h = img.size
    crop_rect = (int(w * 0.35), int(h * 0.75), int(w * 0.60), int(h * 0.92))
    seal_crop = img.crop(crop_rect)
    arr = np.array(seal_crop)
    # Blue pixels: B > 150, R < 120, G < 120
    blue_pixels = np.sum((arr[:, :, 2] > 150) & (arr[:, :, 0] < 120) & (arr[:, :, 1] < 120))
    print(f"Number of blue pixels: {blue_pixels}")
    if blue_pixels > 1000:
        print("CONFIRMED: The blue seal is already pre-printed in public/invoice_template_bg.png!")
    else:
        print("NO blue seal found in background image.")
else:
    print("Background image not found!")
