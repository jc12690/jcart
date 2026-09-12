#!/usr/bin/env python3
"""
Turn any photo into the two files the site needs.

    python3 tools/dither.py <source-image> <name> [options]

Example:
    python3 tools/dither.py media/new-headshot.jpg headshot

Writes:
    assets/img/headshot.png   1-bit Atkinson dither  (what you see first)
    assets/img/headshot.jpg   full colour            (what it develops into)

Then use "headshot" as an "image" value in content/site.json.

Options:
    --crop L,T,R,B   Crop before resizing, as fractions 0-1 of the original.
                     Default 0,0,1,1 (no crop).  e.g. --crop 0.2,0.22,1,1
                     keeps the right 80% and drops the top 22%.
    --contrast N     Push contrast before dithering. Default 1.25.
                     Photos like ~1.3; screenshots like ~1.05.
    --dither-width N  Default 620. Bigger = finer dots.
    --color-width N   Default 1100. The high-res version for the lightbox.
"""
import sys, os, argparse
try:
    from PIL import Image, ImageEnhance, ImageOps
except ImportError:
    sys.exit("Pillow is missing.  Install it with:  python3 -m pip install Pillow")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def atkinson(img):
    """Bill Atkinson's dither, from the original Macintosh.

    Only 6/8 of each pixel's quantisation error is pushed into its neighbours
    (the other 2/8 is simply discarded). Losing that error is exactly why the
    result looks crisp and high-contrast instead of muddy the way
    Floyd-Steinberg can -- and it is what makes the dots read as dots.
    """
    w, h = img.size
    try:
        px = [float(v) for v in img.convert('L').get_flattened_data()]
    except AttributeError:                      # older Pillow
        px = [float(v) for v in img.convert('L').getdata()]
    out = Image.new('1', (w, h))
    op = out.load()
    offsets = ((1, 0), (2, 0), (-1, 1), (0, 1), (1, 1), (0, 2))
    for y in range(h):
        base = y * w
        for x in range(w):
            i = base + x
            old = px[i]
            new = 255.0 if old >= 128.0 else 0.0
            op[x, y] = 1 if new > 0 else 0
            err = (old - new) / 8.0
            for dx, dy in offsets:
                nx, ny = x + dx, y + dy
                if 0 <= nx < w and 0 <= ny < h:
                    px[ny * w + nx] += err
    return out


def main():
    ap = argparse.ArgumentParser(add_help=False)
    ap.add_argument('source')
    ap.add_argument('name')
    ap.add_argument('--crop', default='0,0,1,1')
    ap.add_argument('--contrast', type=float, default=1.25)
    ap.add_argument('--dither-width', type=int, default=620)
    ap.add_argument('--color-width', type=int, default=1100)
    ap.add_argument('-h', '--help', action='store_true')
    a = ap.parse_args()
    if a.help:
        print(__doc__); return

    src = a.source if os.path.isabs(a.source) else os.path.join(ROOT, a.source)
    if not os.path.exists(src):
        sys.exit(f"Can't find: {src}")

    im = Image.open(src).convert('RGB')
    W, H = im.size
    try:
        l, t, r, b = [float(x) for x in a.crop.split(',')]
    except ValueError:
        sys.exit("--crop needs four numbers, e.g. --crop 0.2,0.22,1,1")
    im = im.crop((int(W * l), int(H * t), int(W * r), int(H * b)))

    outdir = os.path.join(ROOT, 'assets', 'img')
    os.makedirs(outdir, exist_ok=True)

    # colour version (high-res, for the lightbox)
    w, h = im.size
    cw = min(a.color_width, w)
    col = im.resize((cw, max(1, round(h * cw / w))), Image.LANCZOS)
    cp = os.path.join(outdir, a.name + '.jpg')
    col.save(cp, quality=76, optimize=True, progressive=True)

    # dithered version (deliberately smaller -- you want chunky dots)
    dw = min(a.dither_width, w)
    small = im.resize((dw, max(1, round(h * dw / w))), Image.LANCZOS)
    g = ImageOps.autocontrast(small.convert('L'), cutoff=1)
    g = ImageEnhance.Contrast(g).enhance(a.contrast)
    dp = os.path.join(outdir, a.name + '.png')
    atkinson(g).save(dp, optimize=True)

    print(f"  {os.path.relpath(dp, ROOT)}   {small.size}  {os.path.getsize(dp)//1024} KB")
    print(f"  {os.path.relpath(cp, ROOT)}   {col.size}  {os.path.getsize(cp)//1024} KB")
    print(f'\nNow use "image": "{a.name}" in content/site.json, then: python3 tools/build.py')


if __name__ == '__main__':
    main()
