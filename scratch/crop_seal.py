from PIL import Image
import os
import numpy as np

img_path = r"c:\Users\sriva\OneDrive\Desktop\invoice generator\public\seal.png"

if os.path.exists(img_path):
    img = Image.open(img_path)
    w, h = img.size
    arr = np.array(img)
    
    if arr.shape[2] == 4:
        alpha = arr[:, :, 3]
        
        # We only look at rows 0 to 500 (where the seal is, ignoring the bottom text)
        seal_alpha = alpha[0:500, :]
        
        # Find the bounding box of non-transparent pixels in this region
        rows = np.any(seal_alpha > 0, axis=1)
        cols = np.any(seal_alpha > 0, axis=0)
        
        ymin, ymax = np.where(rows)[0][[0, -1]]
        xmin, xmax = np.where(cols)[0][[0, -1]]
        
        # Add a small padding of 2 pixels
        ymin = max(0, ymin - 2)
        ymax = min(h, ymax + 2)
        xmin = max(0, xmin - 2)
        xmax = min(w, xmax + 2)
        
        print(f"Original size: {w}x{h}")
        print(f"Cropping to seal bounding box: xmin={xmin}, ymin={ymin}, xmax={xmax}, ymax={ymax}")
        
        cropped_img = img.crop((xmin, ymin, xmax, ymax))
        cropped_img.save(img_path)
        print(f"Successfully saved cropped seal to {img_path} ({cropped_img.width}x{cropped_img.height})")
    else:
        print("Image does not have alpha channel.")
else:
    print("seal.png not found!")
