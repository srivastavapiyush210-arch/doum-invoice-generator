from PIL import Image
import os
import numpy as np

crop_path = r"c:\Users\sriva\OneDrive\Desktop\invoice generator\scratch\bg_crop_above_stamp.png"
if not os.path.exists(crop_path):
    print("Crop image not found!")
else:
    img = Image.open(crop_path).convert("RGB")
    arr = np.array(img)
    # Count pixels that are not close to white (e.g., any channel < 240)
    non_white = np.sum((arr[:, :, 0] < 240) | (arr[:, :, 1] < 240) | (arr[:, :, 2] < 240))
    print(f"Total pixels: {arr.shape[0]*arr.shape[1]}")
    print(f"Non-white pixels: {non_white}")
    
    # Let's save a thresholded image where non-white pixels are black, and white pixels are white
    # to see if there is any readable text shape in it.
    thresh = np.where((arr[:, :, 0] < 240) | (arr[:, :, 1] < 240) | (arr[:, :, 2] < 240), 0, 255).astype(np.uint8)
    thresh_img = Image.fromarray(thresh)
    thresh_img.save(r"c:\Users\sriva\OneDrive\Desktop\invoice generator\scratch\bg_crop_thresholded.png")
    print("Saved thresholded image to scratch/bg_crop_thresholded.png")
