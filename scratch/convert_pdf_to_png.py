import os
import fitz

def convert_pdf_page_to_png(pdf_path, png_path, dpi=300):
    print(f"Converting {pdf_path} to {png_path} at {dpi} DPI...")
    if not os.path.exists(pdf_path):
        print(f"Error: {pdf_path} does not exist!")
        return False
    
    doc = fitz.open(pdf_path)
    page = doc.load_page(0)  # first page
    
    # Calculate matrix based on DPI
    # default resolution is 72 dpi
    zoom = dpi / 72.0
    matrix = fitz.Matrix(zoom, zoom)
    
    pix = page.get_pixmap(matrix=matrix)
    pix.save(png_path)
    
    print(f"Successfully saved image: {png_path} ({pix.width}x{pix.height} pixels)")
    return True

# Convert both templates
convert_pdf_page_to_png("public/template_invoice2.pdf", "public/invoice_template_bg.png")
convert_pdf_page_to_png("public/template_invoice.pdf", "public/invoice_template_with_qr.png")
print("Done!")
