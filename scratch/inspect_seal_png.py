from PIL import Image
import os
import numpy as np

img_path = r"c:\Users\sriva\OneDrive\Desktop\invoice generator\public\seal.png"
if not os.path.exists(img_path):
    print("seal.png not found!")
else:
    img = Image.open(img_path)
    print(f"seal.png size: {img.size}, mode: {img.mode}")
    # Convert to RGBA
    img_rgba = img.convert("RGBA")
    arr = np.array(img_rgba)
    
    # Check if there are non-transparent dark pixels in the top 50 rows and top 50 columns
    crop = arr[0:50, 0:50]
    # A pixel is dark and not transparent if its alpha > 50 and RGB values are small (e.g. < 150)
    dark_pixels = np.sum((crop[:, :, 3] > 50) & (crop[:, :, 0] < 150) & (crop[:, :, 1] < 150) & (crop[:, :, 2] < 150))
    print(f"Number of dark non-transparent pixels in top-left 50x50 corner of seal.png: {dark_pixels}")
    
    # Let's render the top-left corner as ASCII art
    print("--- ASCII of top-left 50x50 of seal.png ---")
    for r in range(50):
        line = ""
        for c in range(50):
            pixel = crop[r, c]
            if pixel[3] > 50 and pixel[0] < 150: # Dark and visible
                line += "#"
            else:
                line += " "
        if line.strip():
            print(line)
    print("-------------------------------------------")
