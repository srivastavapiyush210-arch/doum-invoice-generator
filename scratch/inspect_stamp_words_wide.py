import fitz
doc = fitz.open(r"c:\Users\sriva\OneDrive\Desktop\invoice generator\public\template_invoice2.pdf")
page = doc[0]
words = page.get_text("words")

# x: 50 to 350 points -> 17.6mm to 123.5mm
# y: 550 to 700 points -> 194.2mm to 247.1mm

print("--- Words in wider region ---")
for w in words:
    x0, y0, x1, y1, text, block_no, line_no, word_no = w
    if 50 <= x0 <= 350 and 550 <= y0 <= 700:
        print(f"Word: {text:15s} at ({x0:6.2f}, {y0:6.2f}, {x1:6.2f}, {y1:6.2f}) in block {block_no}")
