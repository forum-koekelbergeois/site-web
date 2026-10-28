"""Build the web logo and icons from src/assets-source/Logo_Forum_K_2023.png.

Requires Python 3 with Pillow, NumPy and SciPy (not needed by the site build).
Usage: python3 scripts/process_logo.py
"""
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "src/assets-source/Logo_Forum_K_2023.png"
OUT = ROOT / "src/assets"

STRONG_INK = 40      # pixels darker than this belong to the drawing
FAINT_INK = 8        # below this, a pixel is considered pure background
MIN_COMPONENT = 50   # smaller strong blobs are specks, not drawing
HALO = 4             # antialiasing margin kept around the drawing (px)
SOLID_INK = 150      # pixels at least this dark stay fully opaque


def clean_rgba(rgb):
    ink = 255 - rgb.min(axis=2)
    labels, n = ndimage.label(ink > STRONG_INK, structure=np.ones((3, 3)))
    sizes = ndimage.sum(np.ones_like(labels), labels, range(1, n + 1))
    keep_ids = [i + 1 for i, s in enumerate(sizes) if s >= MIN_COMPONENT]
    core = np.isin(labels, keep_ids)
    mask = ndimage.binary_dilation(core, iterations=HALO) & (ink > FAINT_INK)

    # Un-mix the white background so edges stay smooth on any light colour,
    # while solid strokes keep their original colour untouched.
    alpha = np.clip(ink / SOLID_INK, 0, 1) * mask
    safe = np.where(alpha > 0, alpha, 1)[..., None]
    colour = np.clip(255 - (255 - rgb) / safe, 0, 255)
    rgba = np.dstack([colour, alpha * 255]).round().astype(np.uint8)
    return rgba, labels, keep_ids


def crop_to_content(rgba):
    ys, xs = np.nonzero(rgba[..., 3])
    return rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1]


def square(img, size, padding_ratio, background=None):
    side = round(max(img.size) * (1 + 2 * padding_ratio))
    canvas = Image.new("RGBA", (side, side), background or (0, 0, 0, 0))
    canvas.alpha_composite(img, ((side - img.width) // 2, (side - img.height) // 2))
    return canvas.resize((size, size), Image.LANCZOS)


def main():
    rgb = np.asarray(Image.open(SOURCE).convert("RGB")).astype(float)
    rgba, labels, keep_ids = clean_rgba(rgb)

    logo = Image.fromarray(crop_to_content(rgba), "RGBA")
    height = round(logo.height * 480 / logo.width)
    logo = logo.resize((480, height), Image.LANCZOS)
    logo.save(OUT / "logo-forum-koekelbergeois.webp", "WEBP", quality=90, method=6)

    # The pictogram (head + puzzle) is everything drawn above the lettering.
    objects = ndimage.find_objects(labels)
    text_top = min(objects[i - 1][0].start for i in keep_ids
                   if objects[i - 1][0].start > 600)
    picto = rgba.copy()
    picto[text_top - 5:] = 0
    picto = Image.fromarray(crop_to_content(picto), "RGBA")

    white = (255, 255, 255, 255)
    square(picto, 32, 0.04).save(OUT / "favicon.ico", sizes=[(32, 32)])
    square(picto, 180, 0.12, white).convert("RGB").save(OUT / "apple-touch-icon.png", optimize=True)
    square(picto, 512, 0.12, white).convert("RGB").save(OUT / "og-image.png", optimize=True)


if __name__ == "__main__":
    main()
