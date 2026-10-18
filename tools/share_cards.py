#!/usr/bin/env python3
"""
Builds the link-preview pictures: what iMessage, LinkedIn, Slack, and the
rest show when someone pastes one of these addresses. 1200 x 630 each.

    python3 tools/share_cards.py            # every card
    python3 tools/share_cards.py home       # just one

    home      -> assets/share.jpg     jarredmcarter.com
    quickbio  -> quickbio/share.jpg   jarredmcarter.com/quickbio/

The fitness and modeling pages keep their own share.jpg in their media/
folders; this script doesn't touch those.

Each card is a small web page that headless Google Chrome draws, so the type
is the site's real fonts. The homepage card takes its words from
content/site.json, so rerun this after changing the hero, the roles, or the
résumé photo, then run tools/build.py. The quickbio card's words are below,
because quickbio/index.html is edited by hand.

Needs Google Chrome, Pillow, and an internet connection (the fonts come from
Google Fonts, like on the live site). Link previews are cached for days to
weeks; LinkedIn's Post Inspector (linkedin.com/post-inspector) refreshes theirs.
"""
import json, os, subprocess, sys, tempfile, html
from PIL import Image, ImageEnhance, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
from dither import atkinson  # noqa: E402  the same dither the site uses

W, H = 1200, 630
CHROME = os.environ.get('CHROME', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
FONTS = ('https://fonts.googleapis.com/css2?family=Pacifico&family=Space+Grotesk:wght@500;700'
         '&family=Silkscreen:wght@400;700&family=Geist+Mono:wght@400&family=Big+Shoulders+Display:wght@800'
         '&family=Instrument+Serif:ital@1&display=block')
CRT = 'repeating-linear-gradient(90deg,rgba(255,255,255,.026) 0 1px,transparent 1px 3px)'
VIG = 'radial-gradient(125% 105% at 50% 45%,transparent 48%,rgba(0,0,0,.5) 100%)'

esc = lambda s: html.escape(str(s))


def fit(im, w, h, focus_x=0.5, focus_y=0.5):
    """Crop to w:h around a focus point, without scaling."""
    iw, ih = im.size
    if iw / ih > w / h:
        cw, ch = round(ih * w / h), ih
    else:
        cw, ch = iw, round(iw * h / w)
    x = min(max(round(iw * focus_x - cw / 2), 0), iw - cw)
    y = min(max(round(ih * focus_y - ch / 2), 0), ih - ch)
    return im.crop((x, y, x + cw, y + ch))


# ---------------------------------------------------------------- home
def home(tmp):
    S = json.load(open(os.path.join(ROOT, 'content/site.json'), encoding='utf-8'))
    R = S['resume']
    # The résumé photo as the site shows it first: Atkinson-dithered, with
    # 2px dots so they survive the preview being shrunk.
    pw, ph = 380, 502
    src = Image.open(os.path.join(ROOT, f"assets/img/{R['image']}.jpg")).convert('RGB')
    small = fit(src, pw, ph).resize((pw // 2, ph // 2), Image.LANCZOS)
    g = ImageEnhance.Contrast(ImageOps.autocontrast(small.convert('L'), cutoff=1)).enhance(1.25)
    dots = atkinson(g).convert('L').resize((pw, ph), Image.NEAREST)
    ImageOps.colorize(dots, '#0e0e10', '#f4f4f2').save(os.path.join(tmp, 'photo.png'))

    colors = {'sec': '#83fa40', 'slt': '#00a7d3'}
    roles = ''.join(
        f'<div class="role" style="--c:{colors.get(r.get("color"), "#f4f4f2")}">'
        f'<b><i></i>{esc(r["title"])}</b><span>{esc(r["sub"])}</span></div>'
        for r in S['roles'] if r.get('enabled'))
    return f'''
<style>
  body{{background:#080809; color:#f4f4f2; font-family:"Space Grotesk",sans-serif}}
  .text{{position:absolute; left:72px; top:64px; bottom:64px; width:640px; display:flex; flex-direction:column}}
  .eyebrow{{font-family:Silkscreen; font-size:17px; letter-spacing:.12em; color:#90929a}}
  .script{{font-family:Pacifico; font-size:100px; line-height:1.2; margin:44px 0 0 -4px;
    text-shadow:0 0 38px rgba(244,244,242,.15)}}
  .name{{font-weight:700; font-size:40px; margin-top:4px; letter-spacing:-.01em}}
  .roles{{margin-top:auto; display:flex; gap:16px}}
  .role{{flex:1; border:1px solid #2e3037; background:linear-gradient(180deg,#101013,#0b0b0d); padding:18px 20px}}
  .role b{{display:flex; align-items:center; gap:12px; font-size:25px; font-weight:500; letter-spacing:-.02em}}
  .role b i{{width:12px; height:12px; background:var(--c); box-shadow:0 0 14px var(--c); flex:none}}
  .role span{{display:block; margin-top:10px; font-family:"Geist Mono"; font-size:14px; line-height:1.45;
    letter-spacing:.06em; color:#90929a; text-transform:uppercase}}
  .plate{{position:absolute; right:72px; top:64px; width:{pw}px; height:{ph}px; margin:0;
    border:1px solid #1e1f23; background:#0e0e10; box-shadow:0 30px 62px -32px #000}}
  .plate img{{display:block; width:100%; height:100%}}
  .plate figcaption{{position:absolute; left:0; right:0; bottom:0; padding:12px 14px;
    font-family:Silkscreen; font-size:13px; letter-spacing:.08em; color:#90929a;
    background:rgba(8,8,9,.92); border-top:1px solid #1e1f23}}
</style>
<div class="text">
  <div class="eyebrow">JARREDMCARTER.COM &middot; NEW YORK</div>
  <div class="script">{esc(S['hero']['script'])}</div>
  <div class="name">{esc(S['hero']['name'])}</div>
  <div class="roles">{roles}</div>
</div>
<figure class="plate"><img src="photo.png" alt=""><figcaption>{esc(R['image_caption'])}</figcaption></figure>
'''


# ---------------------------------------------------------------- quickbio
def quickbio(tmp):
    # The headshot from the top of quickbio, pixelated the way the page shows
    # it before it sharpens, as a full-height panel on the right.
    pw, block = 470, 14
    src = Image.open(os.path.join(ROOT, 'fitness/media/headshot-lg.jpg')).convert('RGB')
    crop = fit(src, pw, H, focus_x=0.52)
    coarse = crop.resize((pw // block + 1, H // block + 1), Image.BOX)
    coarse.resize(((pw // block + 1) * block, (H // block + 1) * block), Image.NEAREST) \
          .crop((0, 0, pw, H)).save(os.path.join(tmp, 'photo.png'))
    return f'''
<style>
  body{{background:#0b0c0c; color:#eef1f0}}
  .photo{{position:absolute; right:0; top:0; width:{pw}px; height:{H}px}}
  .photo img{{display:block; width:100%; height:100%}}
  .photo{{border-left:1px solid #232728}}
  .text{{position:absolute; left:64px; top:72px; bottom:56px; display:flex; flex-direction:column}}
  .eyebrow{{font-family:Silkscreen; font-size:17px; letter-spacing:.12em; color:#8b9396}}
  .eyebrow b{{color:#00a7d3; font-weight:400; margin-right:12px}}
  .name{{margin:38px 0 0; font-family:"Big Shoulders Display"; font-weight:800; font-size:176px;
    line-height:.86; letter-spacing:-.005em; text-transform:uppercase}}
  .name em{{display:block; font-family:"Instrument Serif"; font-style:italic; font-weight:400;
    text-transform:none; color:#00a7d3; font-size:168px; line-height:.9; margin-top:4px}}
  .foot{{margin-top:auto; font-family:Silkscreen; font-size:17px; letter-spacing:.12em; color:#8b9396}}
  .foot b{{color:#eef1f0; font-weight:400; margin-right:22px}}
</style>
<div class="photo"><img src="photo.png" alt=""></div>
<div class="text">
  <div class="eyebrow"><b>[01]</b>PILATES INSTRUCTOR &middot; SECURITY ENGINEER</div>
  <h1 class="name">Jarred <em>Carter</em></h1>
  <div class="foot"><b>@J__CART</b>JARREDMCARTER.COM/QUICKBIO</div>
</div>
'''


CARDS = {'home': (home, 'assets/share.jpg'), 'quickbio': (quickbio, 'quickbio/share.jpg')}


def render(name):
    build, out = CARDS[name]
    with tempfile.TemporaryDirectory() as tmp:
        body = build(tmp)
        page = (f'<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="{FONTS}">'
                f'<style>html,body{{margin:0; width:{W}px; height:{H}px; overflow:hidden}}'
                f'body{{position:relative}}'
                f'.crt,.vig{{position:absolute; inset:0; pointer-events:none; z-index:10}}'
                f'.crt{{background:{CRT}}} .vig{{background:{VIG}}}</style></head>'
                f'<body>{body}<div class="vig"></div><div class="crt"></div></body></html>')
        card = os.path.join(tmp, 'card.html')
        open(card, 'w', encoding='utf-8').write(page)
        shot = os.path.join(tmp, 'card.png')
        # A throwaway profile, so this never touches your own Chrome.
        subprocess.run([CHROME, '--headless=new', f'--user-data-dir={tmp}/profile', '--no-first-run',
                        '--no-default-browser-check', '--disable-gpu', '--hide-scrollbars',
                        '--force-device-scale-factor=1', f'--window-size={W},{H}',
                        '--virtual-time-budget=10000', f'--screenshot={shot}', 'file://' + card],
                       check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        im = Image.open(shot).convert('RGB')
        if im.size != (W, H):
            sys.exit(f'{name}: Chrome drew {im.size[0]} x {im.size[1]}, not {W} x {H}')
        dest = os.path.join(ROOT, out)
        # 4:4:4 keeps colored type crisp; Pillow writes no EXIF unless asked.
        im.save(dest, quality=88, optimize=True, progressive=True, subsampling=0)
        print(f'{out:22} {os.path.getsize(dest) // 1024} KB')


def main():
    names = sys.argv[1:] or list(CARDS)
    for n in names:
        if n not in CARDS:
            sys.exit(f'No card called "{n}". Cards: {", ".join(CARDS)}')
        render(n)


if __name__ == '__main__':
    main()
