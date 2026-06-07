import os
import fitz

pdf_path = "public/template_invoice2.pdf"
doc = fitz.open(pdf_path)

# Image 6 corresponds to xref 211
xref = 211
print(f"Extracting image with xref {xref}...")

# PyMuPDF extraction
base_image = doc.extract_image(xref)
image_bytes = base_image["image"]
image_ext = base_image["ext"]

# Save image
output_path = f"public/seal.{image_ext}"
with open(output_path, "wb") as f:
    f.write(image_bytes)

print(f"Successfully saved seal image to: {output_path}")
