import sys
import fitz

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = "public/template_invoice.pdf"
doc = fitz.open(pdf_path)
page = doc[0]

pt_to_mm = 25.4 / 72.0

# Get draw paths
paths = page.get_drawings()
print(f"Total drawing paths: {len(paths)}")

# Filter paths in the bottom-left quadrant (x < 150 pt, y > 500 pt)
ql_paths = []
for p in paths:
    rect = p["rect"]
    # check if in bottom-left
    if rect.x0 < 150 and rect.y0 > 550:
        ql_paths.append(rect)

if ql_paths:
    min_x = min(r.x0 for r in ql_paths)
    max_x = max(r.x1 for r in ql_paths)
    min_y = min(r.y0 for r in ql_paths)
    max_y = max(r.y1 for r in ql_paths)
    
    print("\nQR code drawing paths bounds:")
    print(f"  Pts Rect: [{min_x:.2f}, {min_y:.2f}, {max_x:.2f}, {max_y:.2f}]")
    print(f"  MM Rect:  [{min_x*pt_to_mm:.2f}, {min_y*pt_to_mm:.2f}, {max_x*pt_to_mm:.2f}, {max_y*pt_to_mm:.2f}]")
    print(f"  Width: {(max_x-min_x)*pt_to_mm:.2f}mm, Height: {(max_y-min_y)*pt_to_mm:.2f}mm")
else:
    print("No drawing paths found in the bottom-left area.")
