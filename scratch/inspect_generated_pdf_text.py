import os
import glob
import fitz # PyMuPDF

downloads_dir = r"C:\Users\sriva\Downloads"
pdf_files = glob.glob(os.path.join(downloads_dir, "Invoice-*.pdf")) + glob.glob(os.path.join(downloads_dir, "*FBF60250*.pdf"))

if not pdf_files:
    print("No generated PDFs found in Downloads!")
else:
    # Get the latest one
    latest_pdf = max(pdf_files, key=os.path.getmtime)
    print(f"Inspecting latest PDF: {latest_pdf}")
    doc = fitz.open(latest_pdf)
    for page_num in range(len(doc)):
        page = doc[page_num]
        print(f"--- Page {page_num} blocks ---")
        blocks = page.get_text("blocks")
        for b in blocks:
            x0, y0, x1, y1, text, block_no, block_type = b
            safe_text = text.replace('\u20b9', 'Rs.').encode('ascii', errors='replace').decode('ascii')
            print(f"Block {block_no} ({x0:.2f}, {y0:.2f}, {x1:.2f}, {y1:.2f}): {repr(safe_text)}")
