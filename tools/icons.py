#!/usr/bin/env python3
"""
Builds the site's icons from the hair mark, the same one in the top bar of
every page: the browser-tab favicon and the home-screen icon. Every page
links them from the site root.

    python3 tools/icons.py

Writes, at the repo root (white, for jarredmcarter.com and its other pages):
    favicon.svg            the tab icon, for every current browser
    favicon.ico            16, 32, and 48px, for older browsers and anything
                           that asks for /favicon.ico on its own
    apple-touch-icon.png   180px, for a page saved to an iPhone home screen
and the same three files in fitness/, with the hair in the Pilates site's blue.

The mark is white on the site's dark panel color, so it reads in both a light
tab bar (the dark square stands out) and a dark one (the white hair does).
Its geometry is copied from the top bar's SVG: circles for the curls, with an
ellipse cut out for the face.
"""
import os
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# The hair mark, in its own 24 x 30 coordinate box (cx, cy, r)
CURLS = [
    (12, 4.4, 3.6), (7.3, 5.5, 3.2), (16.7, 5.5, 3.2), (4.2, 8.6, 3), (19.8, 8.6, 3),
    (3.1, 12.2, 2.9), (20.9, 12.2, 2.9), (2.9, 15.8, 2.8), (21.1, 15.8, 2.8),
    (3.4, 19.3, 2.7), (20.6, 19.3, 2.7), (4.4, 22.6, 2.5), (19.6, 22.6, 2.5),
    (6, 25.4, 2.2), (18, 25.4, 2.2), (8.1, 27.6, 1.8), (15.9, 27.6, 1.8), (12, 9.8, 6.1),
]
FACE = (12, 12.8, 3.6, 4.6)   # cx, cy, rx, ry
MARK_W, MARK_H = 24, 30

# jarredmcarter.com's own colors
INK = '#f4f4f2'     # --ink
TILE = '#0e0e10'    # --panel
EDGE = '#2e3037'    # --rule-hi
TEAL = '#00a7d3'    # the Pilates site's blue (fitness.css --teal)

# Where each set goes, and the color of its hair. Same design, colors only.
SETS = [('', INK), ('fitness', TEAL)]

# The mark fills this share of the icon's height, centered.
FILL = 0.80


def mark_box(size):
    """Scale and top-left corner that center the mark in a size x size icon."""
    k = size * FILL / MARK_H
    return k, (size - MARK_W * k) / 2, (size - MARK_H * k) / 2


def png(size, rounded=True, ink=INK):
    """Drawn 8x large and scaled down, so curves and corners stay smooth.
    The home-screen icon is square: iOS rounds it."""
    s = 8
    big = Image.new('RGBA', (size * s, size * s), (0, 0, 0, 0))
    d = ImageDraw.Draw(big)
    if rounded:
        r = round(size * 416 / 2048 * s)
        d.rounded_rectangle([0, 0, size * s - 1, size * s - 1], r, fill=TILE)
        if size >= 32:  # the edge ring is a smudge at 16px
            w = s
            d.rounded_rectangle([w // 2, w // 2, size * s - 1 - w // 2, size * s - 1 - w // 2],
                                r - w // 2, outline=EDGE, width=w)
    else:
        d.rectangle([0, 0, size * s, size * s], fill=TILE)
    k, x0, y0 = mark_box(size)
    k, x0, y0 = k * s, x0 * s, y0 * s
    hair = Image.new('L', big.size, 0)
    h = ImageDraw.Draw(hair)
    for cx, cy, r in CURLS:
        h.ellipse([x0 + (cx - r) * k, y0 + (cy - r) * k, x0 + (cx + r) * k, y0 + (cy + r) * k], fill=255)
    fx, fy, rx, ry = FACE
    h.ellipse([x0 + (fx - rx) * k, y0 + (fy - ry) * k, x0 + (fx + rx) * k, y0 + (fy + ry) * k], fill=0)
    big.paste(Image.new('RGBA', big.size, ink), (0, 0), hair)
    return big.resize((size, size), Image.LANCZOS)


def svg(ink=INK):
    k, x0, y0 = mark_box(32)
    curls = ''.join(f'<circle cx="{cx}" cy="{cy}" r="{r}"/>' for cx, cy, r in CURLS)
    fx, fy, rx, ry = FACE
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">'
            '<title>Jarred Carter</title>'
            f'<rect width="32" height="32" rx="6.5" fill="{TILE}"/>'
            f'<rect x=".5" y=".5" width="31" height="31" rx="6" fill="none" stroke="{EDGE}"/>'
            f'<mask id="hair"><g transform="translate({x0:.3f} {y0:.3f}) scale({k:.4f})">'
            f'<rect width="{MARK_W}" height="{MARK_H}" fill="#000"/><g fill="#fff">{curls}</g>'
            f'<ellipse cx="{fx}" cy="{fy}" rx="{rx}" ry="{ry}" fill="#000"/></g></mask>'
            f'<rect width="32" height="32" fill="{ink}" mask="url(#hair)"/></svg>\n')


def main():
    for folder, ink in SETS:
        out = lambda name: os.path.join(ROOT, folder, name)
        open(out('favicon.svg'), 'w').write(svg(ink))
        sizes = [16, 32, 48]
        frames = [png(s, ink=ink) for s in sizes]
        frames[-1].save(out('favicon.ico'), sizes=[(s, s) for s in sizes], append_images=frames[:-1])
        png(180, rounded=False, ink=ink).convert('RGB').save(out('apple-touch-icon.png'), optimize=True)
        for name in ('favicon.svg', 'favicon.ico', 'apple-touch-icon.png'):
            print(f'{os.path.join(folder, name):30} {os.path.getsize(out(name)):>6} bytes')


if __name__ == '__main__':
    main()
