from PIL import Image
import os
import numpy as np

img_path = r"c:\Users\sriva\OneDrive\Desktop\invoice generator\public\seal.png"

if os.path.exists(img_path):
    img = Image.open(img_path)
    w, h = img.size
    arr = np.array(img)
    
    # Calculate the number of non-transparent pixels in each row
    if arr.shape[2] == 4:
        alpha_channel = arr[:, :, 3]
        row_counts = np.sum(alpha_channel > 0, axis=1)
        
        # Print the row profile to find the gap between seal and text
        # The seal is a circle, so row counts should increase then decrease.
        # Then there should be a gap (low/zero counts) before the text rows start.
        print("Row index : Number of non-transparent pixels")
        for y in range(0, h, 10):
            print(f"Row {y:3d}: {row_counts[y]:4d}")
            
    else:
        print("Image does not have an alpha channel.")
else:
    print("seal.png not found!")
