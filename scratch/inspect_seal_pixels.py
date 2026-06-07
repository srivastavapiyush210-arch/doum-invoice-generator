from PIL import Image

img = Image.open('public/seal.png')
width, height = img.size

# Let's inspect pixels from the corners (top-left, top-right, bottom-left, bottom-right)
print("Top-left corner pixels:")
for y in range(5):
    row = []
    for x in range(5):
        row.append(img.getpixel((x, y)))
    print(row)

print("\nCenter pixel:")
print(img.getpixel((width//2, height//2)))
