import os
import glob
import fitz

downloads_dir = r"C:\Users\sriva\Downloads"
pdf_files = glob.glob(os.path.join(downloads_dir, "Invoice-*.pdf"))

if not pdf_files:
    print("No generated invoice PDFs found in Downloads folder.")
else:
    # Get the latest PDF file
    latest_pdf = max(pdf_files, key=os.path.getmtime)
    print(f"Inspecting latest PDF: {latest_pdf}")
    
    doc = fitz.open(latest_pdf)
    page = doc[0]
    
    text_page = page.get_text("dict")
    print("\nText spans in the top-right header region (y between 30 and 100 points):")
    found_title = None
    found_num = None
    
    for block in text_page["blocks"]:
        if "lines" in block:
            for line in block["lines"]:
                for span in line["spans"]:
                    bbox = span["bbox"]
                    # Top-right header region
                    if bbox[0] > 350 and bbox[1] > 30 and bbox[3] < 120:
                        x0_mm = bbox[0] * 25.4 / 72.0
                        y0_mm = bbox[1] * 25.4 / 72.0
                        x1_mm = bbox[2] * 25.4 / 72.0
                        y1_mm = bbox[3] * 25.4 / 72.0
                        print(f"Span: {repr(span['text'])} at bbox: ({bbox[0]:.2f}, {bbox[1]:.2f}, {bbox[2]:.2f}, {bbox[3]:.2f})")
                        print(f"  In mm -> left: {x0_mm:.2f}mm, top: {y0_mm:.2f}mm, right: {x1_mm:.2f}mm, bottom: {y1_mm:.2f}mm")
                        if "Invoice Number" in span["text"]:
                            found_title = bbox
                        elif "#" in span["text"] or any(char.isdigit() for char in span["text"]):
                            found_num = bbox
                            
    if found_title and found_num:
        diff_points = found_num[1] - found_title[1]
        diff_mm = diff_points * 25.4 / 72.0
        print(f"\nVertical offset between title top and number top: {diff_points:.2f} pt ({diff_mm:.2f} mm)")
        # We want the offset to be 0 (aligned)
        print(f"To align them, we need to shift the dynamic overlay by {-diff_mm:.2f} mm vertically!")
