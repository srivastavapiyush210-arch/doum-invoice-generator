from PIL import Image
import os
import numpy as np

img_path = r"c:\Users\sriva\OneDrive\Desktop\invoice generator\public\seal.png"
if os.path.exists(img_path):
    img = Image.open(img_path).convert("RGBA")
    arr = np.array(img)
    
    # Make the top-left 100x100 pixels completely transparent
    arr[:100, :100, 3] = 0
    
    # Save the updated image
    cleaned_img = Image.fromarray(arr)
    cleaned_img.save(img_path, "PNG")
    print("Successfully cleaned seal.png and removed the ':n' characters from the top-left corner!")
else:
    print("seal.png not found!")
