import fitz

doc = fitz.open(r"c:\Users\sriva\OneDrive\Desktop\invoice generator\public\template_invoice2.pdf")
page = doc[0]

text_page = page.get_text("dict")
for block in text_page["blocks"]:
    if "lines" in block:
        for line in block["lines"]:
            for span in line["spans"]:
                if "Invoice Number" in span["text"]:
                    print(f"Span: {repr(span['text'])} at bbox: {span['bbox']}")
                    print(f"  In mm -> left: {span['bbox'][0]*25.4/72:.2f}mm, top: {span['bbox'][1]*25.4/72:.2f}mm, right: {span['bbox'][2]*25.4/72:.2f}mm, bottom: {span['bbox'][3]*25.4/72:.2f}mm")
