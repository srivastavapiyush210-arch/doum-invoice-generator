import sys
import fitz

# Reconfigure stdout to use UTF-8
sys.stdout.reconfigure(encoding='utf-8')

pdf_path = "public/template_invoice2.pdf"
doc = fitz.open(pdf_path)
page = doc[0]

# Page dimensions
width_pt, height_pt = page.rect.width, page.rect.height
pt_to_mm = 25.4 / 72.0
print(f"Page dimensions: {width_pt} x {height_pt} pt ({width_pt*pt_to_mm:.2f} x {height_pt*pt_to_mm:.2f} mm)")

print("\n--- Text Blocks ---")
blocks = page.get_text("blocks") # x0, y0, x1, y1, text, block_no, block_type
for b in blocks:
    x0, y0, x1, y1, text, block_no, block_type = b
    text_clean = text.replace('\n', ' | ').strip()
    if text_clean:
        print(f"Block {block_no} (MM: [{x0*pt_to_mm:.2f}, {y0*pt_to_mm:.2f}, {x1*pt_to_mm:.2f}, {y1*pt_to_mm:.2f}]):")
        print(f"  '{text_clean}'")
