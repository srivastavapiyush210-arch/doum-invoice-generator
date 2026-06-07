from PIL import Image
import os
import numpy as np

img_path = r"c:\Users\sriva\OneDrive\Desktop\invoice generator\public\seal.png"
if os.path.exists(img_path):
    img = Image.open(img_path).convert("RGBA")
    arr = np.array(img)
    
    # Find all visible pixels (alpha > 50)
    visible_y, visible_x = np.where(arr[:, :, 3] > 50)
    
    print(f"Total image size: {img.size}")
    print(f"Visible pixels bounds: y=[{np.min(visible_y)}, {np.max(visible_y)}], x=[{np.min(visible_x)}, {np.max(visible_x)}]")
    
    # Let's count visible pixels in the top-left area
    # e.g., y < 100, x < 100
    top_left_visible = np.sum((arr[:100, :100, 3] > 50))
    print(f"Visible pixels in top-left 100x100: {top_left_visible}")
