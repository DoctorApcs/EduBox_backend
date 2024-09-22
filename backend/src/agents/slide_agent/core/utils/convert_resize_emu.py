# utils/convert_resize_emu.py
import sys
from PIL import Image

def emu_to_inches(emu):
    return emu / 914400

def inches_to_pixels(inches, dpi=96):
    return int(inches * dpi)

def resize_image(image_path, target_width_emu, target_height_emu, output_path, dpi=96):
    # Convert EMU to inches
    target_width_inches = target_width_emu / 914400
    target_height_inches = target_height_emu / 914400

    # Convert inches to pixels
    target_width_pixels = int(target_width_inches * dpi)
    target_height_pixels = int(target_height_inches * dpi)

    with Image.open(image_path) as img:
        resized_img = img.resize((target_width_pixels, target_height_pixels))
        resized_img.save(output_path)
    print(f"Image saved to {output_path}.")

if __name__ == "__main__":

    image_path = sys.argv[1]
    target_width_emu = int(sys.argv[2])
    target_height_emu = int(sys.argv[3])
    output_path = sys.argv[4]
    dpi = int(sys.argv[5])

    resize_image(image_path, target_width_emu, target_height_emu, output_path, dpi)
    
