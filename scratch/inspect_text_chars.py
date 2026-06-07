import sys
import fitz

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = "public/template_invoice2.pdf"
doc = fitz.open(pdf_path)
page = doc[0]

pt_to_mm = 25.4 / 72.0

# Extract text characters with their exact coordinates
# Page.get_text("words") returns list of tuples: (x0, y0, x1, y1, "word", block_no, line_no, word_no)
words = page.get_text("words")

print("=== Words in Block 22 ===")
for w in words:
    x0, y0, x1, y1, word, block_no, line_no, word_no = w
    if block_no == 22:
        print(f"  Word: '{word}' -> MM: [{x0*pt_to_mm:.2f}, {y0*pt_to_mm:.2f}, {x1*pt_to_mm:.2f}, {y1*pt_to_mm:.2f}]")

print("\n=== Words in Block 23 ===")
for w in words:
    x0, y0, x1, y1, word, block_no, line_no, word_no = w
    if block_no == 23:
        print(f"  Word: '{word}' -> MM: [{x0*pt_to_mm:.2f}, {y0*pt_to_mm:.2f}, {x1*pt_to_mm:.2f}, {y1*pt_to_mm:.2f}]")
