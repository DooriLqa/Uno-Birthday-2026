#!/usr/bin/env python3
"""Convert a baked neutral checkerboard around one isolated sprite to alpha."""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter


def strip_background(path: Path) -> None:
    image = Image.open(path).convert("RGB")
    pixels = np.asarray(image, dtype=np.int16)
    chroma = pixels.max(axis=2) - pixels.min(axis=2)
    luminance = pixels.mean(axis=2)

    background_candidate = (chroma <= 24) & (luminance >= 80)
    # `.copy()` is required because Pillow may expose `fromarray` storage as read-only,
    # in which case `floodfill` silently leaves large generated images unchanged.
    flood_map = Image.fromarray(np.where(background_candidate, 0, 255).astype(np.uint8)).copy()
    width, height = image.size
    for corner in ((0, 0), (width - 1, 0), (0, height - 1), (width - 1, height - 1)):
        if flood_map.getpixel(corner) == 0:
            ImageDraw.floodfill(flood_map, corner, 128, thresh=0)

    flooded = np.asarray(flood_map)
    alpha = Image.fromarray(np.where(flooded == 128, 0, 255).astype(np.uint8))
    alpha = alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.45))

    result = image.convert("RGBA")
    result.putalpha(alpha)
    temporary = path.with_suffix(".alpha-tmp.png")
    result.save(temporary, optimize=True)
    temporary.replace(path)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("images", nargs="+", type=Path)
    args = parser.parse_args()

    for image_path in args.images:
        strip_background(image_path)


if __name__ == "__main__":
    main()
