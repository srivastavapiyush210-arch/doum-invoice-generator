import fitz

doc = fitz.open(r"c:\Users\sriva\OneDrive\Desktop\invoice generator\public\template_invoice2.pdf")
page = doc[0]

text_instances = page.get_text("dict")
print("Searching for CHOWRINGHEE text spans:")
for block in text_instances["blocks"]:
    if "lines" in block:
        for line in block["lines"]:
            for span in line["spans"]:
                if "CHOWRINGHEE" in span["text"]:
                    print(f"Span text: {repr(span['text'])} at bbox: {span['bbox']}")
