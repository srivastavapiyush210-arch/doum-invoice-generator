import fitz # PyMuPDF
doc = fitz.open(r"c:\Users\sriva\OneDrive\Desktop\invoice generator\public\template_invoice2.pdf")
page = doc[0]
for page_num in range(len(doc)):
    page = doc[page_num]
    text_page = page.get_text("words")
    for word in text_page:
        x0, y0, x1, y1, text, block_no, line_no, word_no = word
        if ":" in text or "n" in text.lower() or "c" in text.lower():
            print(f"Page {page_num} Word: {text} at ({x0:.2f}, {y0:.2f}, {x1:.2f}, {y1:.2f}) in block {block_no}")
