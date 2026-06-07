import fitz

doc = fitz.open(r"c:\Users\sriva\OneDrive\Desktop\invoice generator\public\template_invoice2.pdf")
page = doc[0]

# List images
image_list = page.get_images(full=True)
print(f"Number of images in template: {len(image_list)}")
for img in image_list:
    print(img)

# List text blocks
print("\nText Blocks:")
for b in page.get_text("blocks"):
    print(b)
