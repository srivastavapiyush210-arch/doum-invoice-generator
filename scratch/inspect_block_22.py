import fitz
doc = fitz.open(r"c:\Users\sriva\OneDrive\Desktop\invoice generator\public\template_invoice2.pdf")
page = doc[0]
words = page.get_text("words")
for w in words:
    x0, y0, x1, y1, text, block_no, line_no, word_no = w
    if block_no == 22:
        print(f"Word: {text} at ({x0:.2f}, {y0:.2f}, {x1:.2f}, {y1:.2f})")
