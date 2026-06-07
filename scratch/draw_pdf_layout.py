import sys
import fitz

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = "public/template_invoice2.pdf"
doc = fitz.open(pdf_path)
page = doc[0]

# Render page to a high-res image
zoom = 2.0  # 144 DPI
matrix = fitz.Matrix(zoom, zoom)
pix = page.get_pixmap(matrix=matrix)

# Create a PIL image to draw on
from PIL import Image, ImageDraw, ImageFont
img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
draw = ImageDraw.Draw(img)

# Conversion factor from PDF points to pixels in our rendered image
pt_to_px = zoom

print(f"Rendered image size: {pix.width}x{pix.height}")

# Draw text blocks in RED
blocks = page.get_text("blocks")
for b in blocks:
    x0, y0, x1, y1, text, block_no, block_type = b
    text_clean = text.replace('\n', ' | ').strip()
    if text_clean:
        # Scale coordinates to pixels
        px0, py0, px1, py1 = x0*pt_to_px, y0*pt_to_px, x1*pt_to_px, y1*pt_to_px
        draw.rectangle([px0, py0, px1, py1], outline="red", width=2)
        draw.text((px0 + 2, py0 + 2), f"T{block_no}", fill="red")

# Draw images in BLUE
image_list = page.get_images(full=True)
for idx, img_info in enumerate(image_list):
    xref = img_info[0]
    rects = page.get_image_rects(xref)
    for r in rects:
        px0, py0, px1, py1 = r.x0*pt_to_px, r.y0*pt_to_px, r.x1*pt_to_px, r.y1*pt_to_px
        draw.rectangle([px0, py0, px1, py1], outline="blue", width=3)
        draw.text((px0 + 5, py1 - 15), f"I{idx} (xref:{xref})", fill="blue")

# Save debug image
img.save("public/pdf_layout_debug.png")
print("Saved debug image: public/pdf_layout_debug.png")
