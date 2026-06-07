import fitz

pdf_path = "public/template_invoice2.pdf"
doc = fitz.open(pdf_path)

# Image xref is 211, smask is 210
print("Extracting base image and mask...")
pix_base = fitz.Pixmap(doc, 211)
pix_mask = fitz.Pixmap(doc, 210)

# Combine base image with alpha mask
print("Combining base image and mask to create transparent PNG...")
pix_transparent = fitz.Pixmap(pix_base, pix_mask)

# Save image
output_path = "public/seal.png"
pix_transparent.save(output_path)

print(f"Successfully saved transparent seal to: {output_path}")
print(f"Image properties: Size: {pix_transparent.width}x{pix_transparent.height}, Alpha: {pix_transparent.alpha}")
