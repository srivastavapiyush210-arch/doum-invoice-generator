import fitz
import sys

doc = fitz.open(r"c:\Users\sriva\OneDrive\Desktop\invoice generator\public\template_invoice2.pdf")
page = doc[0]

print("All Text Blocks:")
for idx, b in enumerate(page.get_text("blocks")):
    x0, y0, x1, y1, text, block_no, block_type = b
    # clean text for printing to cp1252/console safely
    clean_text = text.encode('ascii', errors='replace').decode('ascii')
    print(f"Block {idx} ({x0:.2f}, {y0:.2f}, {x1:.2f}, {y1:.2f}): {repr(clean_text)}")
