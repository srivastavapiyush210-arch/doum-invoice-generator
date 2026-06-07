from PIL import Image
import os

img_path = r"c:\Users\sriva\OneDrive\Desktop\invoice generator\public\invoice_template_bg.png"
if not os.path.exists(img_path):
    print("Background image not found!")
else:
    img = Image.open(img_path)
    w, h = img.size
    print(f"Image dimensions: {w}x{h}")
    
    x = int((72.57 / 210.0) * w)
    y = int((232.05 / 297.0) * h)
    
    # Crop box: (left, upper, right, lower)
    box = (x, max(0, y-150), x+300, y+50)
    crop = img.crop(box)
    
    output_path = r"c:\Users\sriva\OneDrive\Desktop\invoice generator\scratch\bg_crop_above_stamp.png"
    crop.save(output_path)
    print(f"Saved crop to {output_path}")
