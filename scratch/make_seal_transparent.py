import os
from PIL import Image

image_path = "public/seal.png"
if os.path.exists(image_path):
    img = Image.open(image_path).convert("RGBA")
    datas = img.getdata()
    
    new_data = []
    for item in datas:
        # If the pixel is near-white (R, G, B all > 240), make it transparent
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save("public/seal.png", "PNG")
    print("Successfully converted seal.png to transparent RGBA PNG!")
else:
    print("seal.png not found!")
