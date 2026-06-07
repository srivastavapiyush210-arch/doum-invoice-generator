import sys
import fitz

sys.stdout.reconfigure(encoding='utf-8')

pt_to_mm = 25.4 / 72.0

def inspect_pdf_images(name, path):
    print(f"\n=== Inspecting Images in {name} ({path}) ===")
    doc = fitz.open(path)
    page = doc[0]
    image_list = page.get_images(full=True)
    print(f"Total images found: {len(image_list)}")
    
    # Get image boxes
    # page.get_image_rects(item) returns list of rects
    # an item in image_list is: (xref, smask, width, height, bpc, colorspace, alt_colorspace, name, filter, referer)
    for i, img_info in enumerate(image_list):
        xref = img_info[0]
        rects = page.get_image_rects(xref)
        print(f"Image {i} (xref: {xref}, size: {img_info[2]}x{img_info[3]}):")
        for r in rects:
            print(f"  Pts Rect: [{r.x0:.2f}, {r.y0:.2f}, {r.x1:.2f}, {r.y1:.2f}]")
            print(f"  MM Rect:  [{r.x0*pt_to_mm:.2f}, {r.y0*pt_to_mm:.2f}, {r.x1*pt_to_mm:.2f}, {r.y1*pt_to_mm:.2f}]")
            print(f"  Width: {r.width*pt_to_mm:.2f}mm, Height: {r.height*pt_to_mm:.2f}mm")

inspect_pdf_images("Template Invoice 1 (With QR)", "public/template_invoice.pdf")
inspect_pdf_images("Template Invoice 2 (Without QR)", "public/template_invoice2.pdf")
