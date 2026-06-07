import os
import glob
import fitz # PyMuPDF
from PIL import Image
import numpy as np

downloads_dir = r"C:\Users\sriva\Downloads"
pdf_files = glob.glob(os.path.join(downloads_dir, "Invoice-*.pdf")) + glob.glob(os.path.join(downloads_dir, "*FBF60250*.pdf"))

if not pdf_files:
    print("No generated PDFs found!")
else:
    latest_pdf = max(pdf_files, key=os.path.getmtime)
    print(f"Rendering latest PDF: {latest_pdf}")
    doc = fitz.open(latest_pdf)
    page = doc[0]
    
    # Render page to a high-res Pixmap (300 DPI)
    zoom = 300 / 72
    mat = fitz.Matrix(zoom, zoom)
    pix = page.get_pixmap(matrix=mat)
    
    # Convert pixmap to PIL Image
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    w, h = img.size
    print(f"Rendered image size: {w}x{h}")
    
    # Stamp: left=72.57mm, top=232.05mm
    x = int((72.57 / 210.0) * w)
    y = int((232.05 / 297.0) * h)
    
    # Crop region above stamp
    box = (x - 100, max(0, y - 200), x + 200, y + 50)
    crop = img.crop(box)
    
    # Convert to grayscale for ASCII rendering
    crop_gray = crop.convert("L")
    arr = np.array(crop_gray)
    
    # Resize for console display
    new_w = 80
    new_h = int(arr.shape[0] * (new_w / arr.shape[1]) * 0.5)
    img_resized = crop_gray.resize((new_w, new_h))
    arr_resized = np.array(img_resized)
    
    print("--- ASCII ART OF GENERATED PDF ABOVE STAMP ---")
    for r in range(arr_resized.shape[0]):
        line = ""
        for c in range(arr_resized.shape[1]):
            val = arr_resized[r, c]
            if val < 180: # Dark pixels
                line += "#"
            else:
                line += " "
        if line.strip():
            print(line)
    print("----------------------------------------------")
    
    # Also save the crop as an image to inspect
    crop_path = r"c:\Users\sriva\OneDrive\Desktop\invoice generator\scratch\generated_pdf_crop_above_stamp.png"
    crop.save(crop_path)
    print(f"Saved generated PDF crop to {crop_path}")
