"""Optimise source assets from dekorfix_assets/ into apps/web/public/images/.

Packshots are trimmed to their visible pixels, padded evenly and saved as WebP
(with transparency); photos are resized and saved as WebP.
Requires Pillow and NumPy:  python3 -m pip install pillow numpy
Usage:            python3 scripts/prepare_images.py
"""

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "dekorfix_assets"
OUT = ROOT / "apps/web/public/images"

# slug -> source file. Packshots of real Dekorfix products (dekorfix.net).
PACKSHOTS = {
    "confix": "Confix_6.png",
    "confix-white": "Confix_Bardh.png",
    "niveler": "Niveler_7.png",
    "gletex": "Gletex_5.png",
    "fasader": "Fasader1mm_4.png",
    "styrofix": "Styrofix_1.png",
    "styrofiber": "syrtyropfiber_bardh_1.png",
    "sipofix": "Sipofix_6.png",
    "thermofix": "Thermofix_13.png",
    "cerafix": "Certafix_1.png",
    "cerafix-white": "Cerafix_bardh_6.png",
    "megafix": "Megafix_6.png",
    "hidrofix": "hidrofix_1.png",
    "beton-kontakt": "Betonkontakt_2.png",
    "baza": "Baze_1.png",
    "fasadex": "Fasadex_1.png",
    "economic": "economic_1.png",
    "medium": "medium_1.png",
    "premium": "premium_1.png",
}

# Real photographs of the Dekorfix plant in Shirokë.
PHOTOS = {
    "plant-loading": "instagram1.jpg",
    "plant-forklift": "instagram2.jpg",
    "plant-dispatch": "instagram3.jpg",
}


def packshot(src: Path, dest: Path, max_side: int = 1000) -> None:
    image = Image.open(src).convert("RGBA")
    bbox = image.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox()
    if bbox:
        image = image.crop(bbox)
    pad = round(max(image.size) * 0.04)
    canvas = Image.new("RGBA", (image.width + 2 * pad, image.height + 2 * pad), (0, 0, 0, 0))
    canvas.paste(image, (pad, pad))
    canvas.thumbnail((max_side, max_side), Image.Resampling.LANCZOS)
    canvas.save(dest, "WEBP", quality=86, method=6)


def photo(src: Path, dest: Path, max_width: int = 1600) -> None:
    image = Image.open(src).convert("RGB")
    image.thumbnail((max_width, max_width), Image.Resampling.LANCZOS)
    image.save(dest, "WEBP", quality=82, method=6)


# --- 3D hero textures (Styrofiber sack) ---------------------------------------

STYROFIBER_SOURCE = "syrtyropfiber_bardh.png"
# Corners of the front face in the 1600x1400 packshot: TL, TR, BR, BL.
STYROFIBER_FRONT_QUAD = [(478, 190), (966, 121), (964, 1288), (478, 1208)]
SACK_RED = (216, 30, 31)  # sampled from the packshot front
SIDE_FONT = "/System/Library/Fonts/Supplemental/Impact.ttf"


def _perspective_coeffs(dst: list[tuple[int, int]], src: list[tuple[int, int]]) -> list[float]:
    rows, rhs = [], []
    for (x, y), (u, v) in zip(dst, src, strict=True):
        rows.append([x, y, 1, 0, 0, 0, -u * x, -u * y])
        rhs.append(u)
        rows.append([0, 0, 0, x, y, 1, -v * x, -v * y])
        rhs.append(v)
    return np.linalg.solve(np.array(rows, float), np.array(rhs, float)).tolist()


def styrofiber_front(dest: Path, size: tuple[int, int] = (600, 1100)) -> None:
    """Flattens the front face of the packshot into a rectangular texture."""
    source = Image.open(SRC / STYROFIBER_SOURCE).convert("RGBA")
    w, h = size
    coeffs = _perspective_coeffs([(0, 0), (w, 0), (w, h), (0, h)], STYROFIBER_FRONT_QUAD)
    face = source.transform(size, Image.Transform.PERSPECTIVE, coeffs, Image.Resampling.BICUBIC)
    # Fill the rounded-corner gaps with the panel colours so the texture is opaque.
    base = Image.new("RGBA", size, (0, 0, 0, 255))
    base.alpha_composite(face)
    base.convert("RGB").save(dest, "WEBP", quality=90, method=6)


def styrofiber_side(dest: Path, size: tuple[int, int] = (240, 1320)) -> None:
    """Draws the gusset panel: red with the vertical STYRO / FIBER mark, black 25 KG band."""
    w, h = size
    side = Image.new("RGB", size, SACK_RED)
    draw = ImageDraw.Draw(side)
    band = round(h * 0.145)
    draw.rectangle([0, h - band, w, h], fill=(0, 0, 0))
    draw.rectangle([0, h - band - 5, w, h - band - 1], fill=(230, 230, 230))

    # Lettering is drawn horizontally on a strip, then rotated to read bottom-to-top.
    font = ImageFont.truetype(SIDE_FONT, round(w * 0.46))
    strip = Image.new("RGBA", (round(h * 0.62), w), (0, 0, 0, 0))
    sd = ImageDraw.Draw(strip)
    styro_w = sd.textlength("STYRO", font=font)
    pad = round(w * 0.12)
    box = [0, round(w * 0.2), styro_w + 2 * pad, round(w * 0.8)]
    sd.rounded_rectangle(box, radius=round(w * 0.06), fill=(245, 245, 245))
    cy = w / 2
    sd.text((pad, cy), "STYRO", font=font, fill=SACK_RED, anchor="lm")
    sd.text((box[2] + pad, cy), "FIBER", font=font, fill=(255, 255, 255), anchor="lm")
    strip = strip.rotate(90, expand=True)
    side.paste(strip, ((w - strip.width) // 2, round(h * 0.12)), strip)

    small = ImageFont.truetype(SIDE_FONT, round(w * 0.24))
    label = Image.new("RGBA", (round(band * 0.9), w), (0, 0, 0, 0))
    ImageDraw.Draw(label).text((label.width / 2, w / 2), "25 KG", font=small, fill=(255, 255, 255), anchor="mm")
    label = label.rotate(90, expand=True)
    side.paste(label, ((w - label.width) // 2, h - band + (band - label.height) // 2), label)
    side.save(dest, "WEBP", quality=90, method=6)


def main() -> None:
    (OUT / "products").mkdir(parents=True, exist_ok=True)
    (OUT / "photos").mkdir(parents=True, exist_ok=True)
    for slug, name in PACKSHOTS.items():
        packshot(SRC / name, OUT / "products" / f"{slug}.webp")
    for slug, name in PHOTOS.items():
        photo(SRC / name, OUT / "photos" / f"{slug}.webp")
    (OUT / "3d").mkdir(parents=True, exist_ok=True)
    styrofiber_front(OUT / "3d" / "styrofiber-front.webp")
    styrofiber_side(OUT / "3d" / "styrofiber-side.webp")
    for path in sorted(OUT.rglob("*.webp")):
        with Image.open(path) as image:
            print(f"{path.relative_to(OUT)}  {image.width}x{image.height}  {path.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
