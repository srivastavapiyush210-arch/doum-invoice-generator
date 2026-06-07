import fitz
doc = fitz.open(r"c:\Users\sriva\OneDrive\Desktop\invoice generator\public\template_invoice2.pdf")
page = doc[0]

text_page = page.get_text("dict")
for block in text_page["blocks"]:
    if "lines" in block:
        for line in block["lines"]:
            for span in line["spans"]:
                x0, y0, x1, y1 = span["bbox"]
                text = span["text"]
                if 50 <= x0 <= 350 and 550 <= y0 <= 700:
                    print(f"Span: {repr(text)} at ({x0:.2f}, {y0:.2f}, {x1:.2f}, {y1:.2f})")
