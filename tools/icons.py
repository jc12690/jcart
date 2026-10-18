#!/usr/bin/env python3
"""
Builds the site's icons from the pixel J: the browser-tab favicon and the
home-screen icon. Every page links them from the site root.

    python3 tools/icons.py

Writes, at the repo root:
    favicon.svg            the tab icon, for every current browser
    favicon.ico            16, 32, and 48px, for older browsers and anything
                           that asks for /favicon.ico on its own
    apple-touch-icon.png   180px, for a page saved to an iPhone home screen

The mark is "J_", the cursor version of the J marks Retrac Labs' brand tool
builds (retraclabs.github.io, tools/brand-marks), drawn in Silkscreen Bold.
"J/>" doesn't fit a 32px tab legibly, which is why the tab uses this one.
The bitmap below is that font's J and underscore, one character per font
pixel, so every size here is drawn pixel for pixel and nothing is resampled.
"""
import os
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MARK = [
    '...##......',
    '...##......',
    '...##......',
    '##.##......',
    '.###.......',
    '......#####',
]
COLS, ROWS = len(MARK[0]), len(MARK)

# jarredmcarter.com's own colors, the same ones the brand tool uses
GREEN = '#83fa40'   # --sec
TILE = '#0e0e10'    # --panel
EDGE = '#2e3037'    # --rule-hi

# Each size: (pixels per font pixel, left, top). Offsets are whole pixels,
# so the mark is as centered as the grid allows.
LAYOUT = {
    16: (1, 2, 5),
    32: (2, 5, 10),
    48: (3, 7, 15),
    180: (10, 35, 60),
}


def cells():
    for y, row in enumerate(MARK):
        for x, c in enumerate(row):
            if c == '#':
                yield x, y


def tile(size, rounded=True):
    """The dark rounded square, drawn 8x large and scaled down so the corners
    are smooth. The home-screen icon is square: iOS rounds it."""
    if not rounded:
        return Image.new('RGBA', (size, size), TILE)
    s = 8
    big = Image.new('RGBA', (size * s, size * s), (0, 0, 0, 0))
    d = ImageDraw.Draw(big)
    r = round(size * 416 / 2048 * s)
    d.rounded_rectangle([0, 0, size * s - 1, size * s - 1], r, fill=TILE)
    if size >= 32:  # the edge ring is a smudge at 16px
        w = s  # one pixel
        d.rounded_rectangle([w // 2, w // 2, size * s - 1 - w // 2, size * s - 1 - w // 2],
                            r - w // 2, outline=EDGE, width=w)
    return big.resize((size, size), Image.LANCZOS)


def png(size, rounded=True):
    scale, left, top = LAYOUT[size]
    im = tile(size, rounded)
    d = ImageDraw.Draw(im)
    for x, y in cells():
        x0, y0 = left + x * scale, top + y * scale
        d.rectangle([x0, y0, x0 + scale - 1, y0 + scale - 1], fill=GREEN)
    return im


def svg():
    scale, left, top = LAYOUT[32]
    rects = ''.join(f'<rect x="{left + x * scale}" y="{top + y * scale}" width="{scale}" height="{scale}"/>'
                    for x, y in cells())
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">'
            '<title>Jarred Carter</title>'
            f'<rect width="32" height="32" rx="6.5" fill="{TILE}"/>'
            f'<rect x=".5" y=".5" width="31" height="31" rx="6" fill="none" stroke="{EDGE}"/>'
            f'<g fill="{GREEN}" shape-rendering="crispEdges">{rects}</g></svg>\n')


def main():
    out = lambda name: os.path.join(ROOT, name)
    open(out('favicon.svg'), 'w').write(svg())
    sizes = [16, 32, 48]
    frames = [png(s) for s in sizes]
    frames[-1].save(out('favicon.ico'), sizes=[(s, s) for s in sizes], append_images=frames[:-1])
    png(180, rounded=False).convert('RGB').save(out('apple-touch-icon.png'), optimize=True)
    for name in ('favicon.svg', 'favicon.ico', 'apple-touch-icon.png'):
        print(f'{name:22} {os.path.getsize(out(name)):>6} bytes')


if __name__ == '__main__':
    main()
