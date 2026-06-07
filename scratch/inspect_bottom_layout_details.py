import sys
import fitz

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = "public/template_invoice2.pdf"
doc = fitz.open(pdf_path)
page = doc[0]

pt_to_mm = 25.4 / 72.0

print("=== Text Blocks in Bottom Area (y > 200mm) ===")
blocks = page.get_text("blocks")
for b in blocks:
    x0, y0, x1, y1, text, block_no, block_type = b
    if y0 * pt_to_mm > 195:
        text_clean = text.replace('\n', ' | ').strip()
        print(f"Block {block_no}:")
        print(f"  Pts: [{x0:.2f}, {y0:.2f}, {x1:.2f}, {y1:.2f}]")
        print(f"  MM:  [{x0*pt_to_mm:.2f}, {y0*pt_to_mm:.2f}, {x1*pt_to_mm:.2f}, {y1*pt_to_mm:.2f}]")
        print(f"  Text: '{text_clean}'")
