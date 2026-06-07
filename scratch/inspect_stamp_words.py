import fitz
doc = fitz.open(r"c:\Users\sriva\OneDrive\Desktop\invoice generator\public\template_invoice2.pdf")
page = doc[0]
words = page.get_text("words")

# Convert mm to points
# x: 70mm to 120mm -> 70/210 * 595 = 198 to 340 points
# y: 220mm to 240mm -> 220/297 * 842 = 623 to 680 points

print("--- Words in the stamp region ---")
for w in words:
    x0, y0, x1, y1, text, block_no, line_no, word_no = w
    if 180 <= x0 <= 350 and 600 <= y0 <= 680:
        print(f"Word: {text} at ({x0:.2f}, {y0:.2f}, {x1:.2f}, {y1:.2f})")
