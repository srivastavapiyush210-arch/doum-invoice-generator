from PIL import Image
import os
import numpy as np

img_path = r"c:\Users\sriva\OneDrive\Desktop\invoice generator\public\seal.png"

if os.path.exists(img_path):
    img = Image.open(img_path)
    w, h = img.size
    print(f"seal.png size: {w}x{h}")
    
    # Get the bottom 25% of the image
    bottom_crop = img.crop((0, int(h * 0.75), w, h))
    arr = np.array(bottom_crop)
    
    # Check if there are non-transparent pixels (alpha > 0)
    # The image has 4 channels: R, G, B, A
    if arr.shape[2] == 4:
        alpha_channel = arr[:, :, 3]
        non_transparent = np.sum(alpha_channel > 0)
        print(f"Number of non-transparent pixels in bottom 25% of seal.png: {non_transparent}")
        if non_transparent > 100:
            print("CONFIRMED: public/seal.png contains non-transparent pixels at the bottom, which is the address text!")
        else:
            print("No pixels found at the bottom of seal.png.")
    else:
        print("Image does not have an alpha channel.")
else:
    print("seal.png not found!")
