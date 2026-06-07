from PIL import Image
import os
import numpy as np

crop_path = r"c:\Users\sriva\OneDrive\Desktop\invoice generator\scratch\bg_crop_above_stamp.png"
if os.path.exists(crop_path):
    img = Image.open(crop_path).convert("L") # Grayscale
    # Resize to make it printable in console (e.g. width 100)
    w, h = img.size
    new_w = 100
    new_h = int(h * (new_w / w) * 0.5) # 0.5 is aspect ratio correction for console characters
    img_resized = img.resize((new_w, new_h))
    arr = np.array(img_resized)
    
    print("--- ASCII ART OF BACKGROUND CROP ABOVE STAMP ---")
    for r in range(arr.shape[0]):
        line = ""
        for c in range(arr.shape[1]):
            val = arr[r, c]
            if val < 200: # Dark pixel
                line += "#"
            else:
                line += " "
        if line.strip(): # Only print lines that have content
            print(line)
    print("------------------------------------------------")
