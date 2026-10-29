"""Convert the funder logos to WebP for the site.

Sources live outside the repository, in ~/Projets/assets-source/logos/.
Logos are displayed at most 64 px high, so files are 128 px high (2x), never
enlarged beyond the original. COCOF and Commune logos are too small to be
resized: they are only converted until larger versions arrive (task 3.12).
White backgrounds are kept; no metadata is written.

Requires Python 3 with Pillow (not needed by the site build).
Usage: python3 scripts/process_logos.py
"""
from io import BytesIO
from pathlib import Path

from PIL import Image

SOURCE = Path.home() / "Projets/assets-source/logos"
OUT = Path(__file__).resolve().parent.parent / "src/assets/logos"
TARGET_HEIGHT = 128

LOGOS = {
    "cocof": ("Logo_cocof.png", False),
    "fwb": ("FWB_VERTI_RVB.jpg", True),
    "urban-brussels": ("1663771215urbanlogomhorizontalnoirzwart.jpg", True),
    "perspective-brussels": ("perspectivelogopos_web.png", True),
    "commune-koekelberg": ("logo_Koekeleberg.png", False),
    "one": ("Logo_ONE_haut.jpg", True),
}


def encode(image):
    """Return the smaller of a lossless and a high-quality lossy WebP."""
    candidates = []
    for options in ({"lossless": True}, {"quality": 90}):
        buffer = BytesIO()
        image.save(buffer, "WEBP", method=6, **options)
        candidates.append(buffer.getvalue())
    return min(candidates, key=len)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for name, (filename, resize) in LOGOS.items():
        with Image.open(SOURCE / filename) as source:
            image = source.convert("RGB")
        if resize and image.height > TARGET_HEIGHT:
            width = round(image.width * TARGET_HEIGHT / image.height)
            image = image.resize((width, TARGET_HEIGHT), Image.LANCZOS)
        data = encode(image)
        (OUT / f"{name}.webp").write_bytes(data)
        print(f"{name}.webp  {image.width}x{image.height}  {len(data)} bytes")


if __name__ == "__main__":
    main()
