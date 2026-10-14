#!/usr/bin/env python3
"""
Make the web copies the modeling page shows, from original photos and clips.

    python3 tools/modeling_media.py <original> [<original> ...]

Example:
    python3 tools/modeling_media.py media/modeling-media/renacio-1.jpg

For a photo it writes two files into modeling/media/, turned upright and
stripped of camera and location data:
    renacio-1.jpg      900 px wide, what the page shows
    renacio-1-lg.jpg   2000 px on the long side, what the viewer opens
(A photo already smaller than that just gets the one copy.)

For a clip (.mp4 or .mov) it writes a silent 540-wide H.264 copy, which every
browser plays, plus the poster shown before it starts:
    sean-val-bts-1.mp4
    sean-val-bts-1.jpg

Each one prints the line to paste into a collection's `items` in
modeling/modeling.js, with the size the page needs to lay it out.
"""
import os
import subprocess
import sys

from PIL import Image, ImageOps

OUT = "modeling/media"
PAGE_W, FULL_LONG, CLIP_W = 900, 2000, 540


def photo(src, name):
    im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")

    def save(img, path):
        # no exif= argument, so nothing from the camera is written back out
        img.save(path, "JPEG", quality=82, optimize=True, progressive=True)

    page = im.copy()
    if page.width > PAGE_W:
        page = page.resize((PAGE_W, round(im.height * PAGE_W / im.width)), Image.LANCZOS)
    save(page, f"{OUT}/{name}.jpg")
    line = f'{{ src: "media/{name}.jpg", '
    if max(im.size) > max(page.size):
        full = im.copy()
        full.thumbnail((FULL_LONG, FULL_LONG), Image.LANCZOS)
        save(full, f"{OUT}/{name}-lg.jpg")
        line += f'full: "media/{name}-lg.jpg", '
    return line + f"w: {page.width}, h: {page.height} }},"


def clip(src, name):
    out = f"{OUT}/{name}.mp4"
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", src, "-an",
                    "-vf", f"scale={CLIP_W}:-2:flags=lanczos,format=yuv420p",
                    "-c:v", "libx264", "-profile:v", "high", "-preset", "slow", "-crf", "28",
                    "-movflags", "+faststart", out], check=True)
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-ss", "0.5", "-i", out,
                    "-frames:v", "1", "-q:v", "4", f"{OUT}/{name}.jpg"], check=True)
    w, h = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0",
                           "-show_entries", "stream=width,height", "-of", "csv=p=0", out],
                          check=True, capture_output=True, text=True).stdout.strip().split(",")
    return f'{{ src: "media/{name}.mp4", poster: "media/{name}.jpg", w: {w}, h: {h} }},'


def main(paths):
    if not paths:
        sys.exit(__doc__)
    os.makedirs(OUT, exist_ok=True)
    for src in paths:
        name, ext = os.path.splitext(os.path.basename(src))
        line = clip(src, name) if ext.lower() in (".mp4", ".mov", ".m4v") else photo(src, name)
        print(line)


if __name__ == "__main__":
    main(sys.argv[1:])
