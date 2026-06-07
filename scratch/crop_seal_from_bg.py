import os
from PIL import Image

bg_path = "public/invoice_template_bg.png"
if not os.path.exists(bg_path):
    print(f"Error: {bg_path} does not exist!")
    exit(1)

# Open high-res background
img_bg = Image.open(bg_path)
bg_w, bg_h = img_bg.size

# A4 dimensions in mm
a4_w_mm = 210.0
a4_h_mm = 297.0

# Seal mm coordinates from PDF inspection
left_mm = 72.57
top_mm = 232.05
width_mm = 51.96
height_mm = 46.58

# Convert mm to pixels based on the actual high-res background size
x0 = int((left_mm / a4_w_mm) * bg_w)
y0 = int((top_mm / a4_h_mm) * bg_h)
x1 = int(((left_mm + width_mm) / a4_w_mm) * bg_w)
y1 = int(((top_mm + height_mm) / a4_h_mm) * bg_h)

print(f"Cropping seal region: x0={x0}, y0={y0}, x1={x1}, y1={y1} from {bg_w}x{bg_h} image...")
seal_crop = img_bg.crop((x0, y0, x1, y1)).convert("RGBA")

# Convert white background to transparent
datas = seal_crop.getdata()
new_data = []
for item in datas:
    # If pixel is near-white, make it transparent
    # The seal itself is dark navy/blue/purple, so near-white pixels (all RGB values > 240)
    # represent the clean white background.
    if item[0] > 240 and item[1] > 240 and item[2] > 240:
        new_data.append((255, 255, 255, 0))
    else:
        new_data.append(item)

seal_crop.putdata(new_data)

# Save output
output_path = "public/seal.png"
seal_crop.save(output_path, "PNG")
print(f"Successfully saved transparent seal to: {output_path} (Size: {seal_crop.width}x{seal_crop.height})")
