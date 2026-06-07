import sys
import fitz

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = "public/template_invoice.pdf"
doc = fitz.open(pdf_path)
page = doc[0]

pt_to_mm = 25.4 / 72.0

paths = page.get_drawings()
print(f"Total drawing paths: {len(paths)}")

for idx, p in enumerate(paths):
    rect = p["rect"]
    x0, y0, x1, y1 = rect.x0, rect.y0, rect.x1, rect.y1
    w = x1 - x0
    h = y1 - y0
    # If in bottom-left and not full page
    if x0 < 200 and y0 > 500 and w < 200 and h < 200:
        aspect = w / h if h != 0 else 0
        print(f"Path {idx}:")
        print(f"  Pts Rect: [{x0:.2f}, {y0:.2f}, {x1:.2f}, {y1:.2f}] (size {w:.2f}x{h:.2f}, aspect {aspect:.2f})")
        print(f"  MM Rect:  [{x0*pt_to_mm:.2f}, {y0*pt_to_mm:.2f}, {x1*pt_to_mm:.2f}, {y1*pt_to_mm:.2f}]")
        print(f"  Width: {w*pt_to_mm:.2f}mm, Height: {h*pt_to_mm:.2f}mm")
