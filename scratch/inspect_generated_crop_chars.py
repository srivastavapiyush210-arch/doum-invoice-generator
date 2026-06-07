from PIL import Image
import os
import numpy as np

crop_path = r"c:\Users\sriva\OneDrive\Desktop\invoice generator\scratch\generated_pdf_crop_above_stamp.png"
if os.path.exists(crop_path):
    img = Image.open(crop_path).convert("L")
    arr = np.array(img)
    # Crop to the actual text area (approx columns 70 to 180, rows 0 to 80)
    # Let's find bounding box of dark pixels
    dark_y, dark_x = np.where(arr < 180)
    if len(dark_y) > 0:
        min_y, max_y = np.min(dark_y), np.max(dark_y)
        min_x, max_x = np.min(dark_x), np.max(dark_x)
        print(f"Text bounding box in crop: y=[{min_y}, {max_y}], x=[{min_x}, {max_x}]")
        
        # Crop to bounding box with 5px padding
        p = 5
        sub_crop = arr[max(0, min_y-p):min(arr.shape[0], max_y+p), max(0, min_x-p):min(arr.shape[1], max_x+p)]
        
        # Render sub_crop to console
        h, w = sub_crop.shape
        new_w = 60
        new_h = int(h * (new_w / w) * 0.5)
        sub_img = Image.fromarray(sub_crop).resize((new_w, new_h))
        sub_arr = np.array(sub_img)
        
        print("--- HIGH RESOLUTION TEXT TRACE ---")
        for r in range(sub_arr.shape[0]):
            line = ""
            for c in range(sub_arr.shape[1]):
                val = sub_arr[r, c]
                if val < 160:
                    line += "#"
                elif val < 200:
                    line += "+"
                else:
                    line += " "
            print(line)
        print("----------------------------------")
    else:
        print("No dark pixels found in crop!")
else:
    print("Crop image not found!")
