import fitz
import os

pdf_path = r"c:\Users\sriva\OneDrive\Desktop\invoice generator\public\template_invoice2.pdf"
output_path = r"c:\Users\sriva\OneDrive\Desktop\invoice generator\scratch\template_bottom_crop.png"

if os.path.exists(pdf_path):
    doc = fitz.open(pdf_path)
    page = doc.load_page(0)
    
    # Crop to the bottom region (in points: A4 is 595.28 x 841.89 points)
    # Bottom region: y from 600 to 842 points (approx 211mm to 297mm)
    rect = fitz.Rect(0, 600, 595, 842)
    pix = page.get_pixmap(clip=rect, dpi=300)
    pix.save(output_path)
    print(f"Saved bottom crop to {output_path}")
else:
    print("PDF not found!")
