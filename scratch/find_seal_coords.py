import fitz

doc = fitz.open(r"c:\Users\sriva\OneDrive\Desktop\invoice generator\public\template_invoice2.pdf")
page = doc[0]

# List images with rects
for img in page.get_images():
    xref = img[0]
    rects = page.get_image_rects(xref)
    if rects:
        bbox = rects[0]
        width = bbox[2] - bbox[0]
        height = bbox[3] - bbox[1]
        x_mm = bbox[0] * 25.4 / 72.0
        y_mm = bbox[1] * 25.4 / 72.0
        w_mm = width * 25.4 / 72.0
        h_mm = height * 25.4 / 72.0
        print(f"Xref: {xref}, bbox: {bbox}")
        print(f"  In mm -> left: {x_mm:.2f}mm, top: {y_mm:.2f}mm, width: {w_mm:.2f}mm, height: {h_mm:.2f}mm\n")
