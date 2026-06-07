import fitz # PyMuPDF
doc = fitz.open(r"c:\Users\sriva\OneDrive\Desktop\invoice generator\public\template_invoice2.pdf")
page = doc[0]
text_instances = page.get_text("blocks")
for block in text_instances:
    x0, y0, x1, y1, text, block_no, block_type = block
    safe_text = text.replace('\u20b9', 'Rs.').encode('ascii', errors='replace').decode('ascii')
    print(f"Block {block_no} ({x0:.2f}, {y0:.2f}, {x1:.2f}, {y1:.2f}): {repr(safe_text)}")
