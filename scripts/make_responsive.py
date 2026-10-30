"""Build the smaller versions of the site images, for srcset (task 4.7).

Sources are ONLY the validated files already in src/assets/images/ (blurs and
crops included), never the original photos. Each version keeps the crop and
the aspect ratio, is never enlarged, and is written without any metadata as
<name>-<width>w.webp next to its source. Existing versions are rebuilt.

Requires Python 3 with Pillow (not needed by the site build).
Usage: python3 scripts/make_responsive.py
"""
import re
from pathlib import Path

from PIL import Image

ASSETS = Path(__file__).resolve().parent.parent / "src/assets"
IMAGES = ASSETS / "images"
# Header logo (480 px, transparent): one 320 px version for 130-160 px display.
LOGO = ASSETS / "logo-forum-koekelbergeois.webp"
WIDTHS = (320, 480, 720, 960, 1280)
VERSION = re.compile(r"-\d+w\.webp$")
QUALITY = 76


def main():
    for old in IMAGES.glob("*w.webp"):
        if VERSION.search(old.name):
            old.unlink()
    for source in sorted(IMAGES.glob("*.webp")):
        with Image.open(source) as im:
            im = im.convert("RGB")
            made = []
            # A version only when it saves at least 10 % of the width.
            for width in WIDTHS:
                if width > im.width * 0.9:
                    continue
                height = round(im.height * width / im.width)
                out = source.with_name(f"{source.stem}-{width}w.webp")
                # No exif, icc_profile or xmp argument: Pillow writes none.
                im.resize((width, height), Image.LANCZOS).save(out, "WEBP", quality=QUALITY, method=6)
                made.append(f"{width}w {out.stat().st_size // 1024} Ko")
        print(f"{source.name:24} {im.width:>5} px  ->  {', '.join(made) or 'aucune version (déjà petite)'}")
    with Image.open(LOGO) as im:
        out = LOGO.with_name(f"{LOGO.stem}-320w.webp")
        im.resize((320, round(im.height * 320 / im.width)), Image.LANCZOS).save(out, "WEBP", quality=90, method=6)
        print(f"{LOGO.name:24} {im.width:>5} px  ->  320w {out.stat().st_size // 1024} Ko")


if __name__ == "__main__":
    main()
