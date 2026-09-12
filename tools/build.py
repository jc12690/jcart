#!/usr/bin/env python3
"""
Builds index.html from content/site.json.

    python3 tools/build.py

Nothing else needs editing to change the site's words, links, or images --
it all lives in content/site.json. See EDITING.md.
"""
import json, os, re, sys, html, shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

# ---------------------------------------------------------------- helpers
def esc(s):
    """Escape HTML, then push non-ASCII to numeric entities so the page is
    charset-proof no matter how it gets served."""
    s = html.escape(str(s), quote=False)
    return ''.join(c if ord(c) < 128 else '&#%d;' % ord(c) for c in s)

def md(s):
    """The tiny bit of markdown allowed in site.json: **bold** and _italic_."""
    s = esc(s)
    s = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', s)
    s = re.sub(r'_(.+?)_', r'<em>\1</em>', s)
    return s

def plate(key, caption, alt=None, cls=''):
    """A dithered image that develops into colour on hover and opens a lightbox."""
    if not key:
        return ''
    return (f'<figure class="plate {cls}" tabindex="0">'
            f'<img class="col" src="assets/img/{key}.jpg" alt="" loading="lazy">'
            f'<img class="dith" src="assets/img/{key}.png" alt="{esc(alt or caption or "")}" loading="lazy">'
            f'<figcaption><span>{esc(caption or "")}</span>'
            f'<b>HOVER TO DEVELOP</b></figcaption></figure>')

def pills(tags, limit=None):
    t = tags[:limit] if limit else tags
    return ''.join(f'<span class="pill hot">{esc(x)}</span>' for x in t)

HAIR = '''<a class="homelink" id="homeLink" href="#top" aria-label="Back to the top"><svg class="mark" viewBox="0 0 24 30" role="img" aria-label="Jarred Carter">
      <mask id="jcHair">
        <rect width="24" height="30" fill="#000"/>
        <g fill="#fff">
          <circle cx="12" cy="4.4" r="3.6"/><circle cx="7.3" cy="5.5" r="3.2"/>
          <circle cx="16.7" cy="5.5" r="3.2"/><circle cx="4.2" cy="8.6" r="3.0"/>
          <circle cx="19.8" cy="8.6" r="3.0"/><circle cx="3.1" cy="12.2" r="2.9"/>
          <circle cx="20.9" cy="12.2" r="2.9"/><circle cx="2.9" cy="15.8" r="2.8"/>
          <circle cx="21.1" cy="15.8" r="2.8"/><circle cx="3.4" cy="19.3" r="2.7"/>
          <circle cx="20.6" cy="19.3" r="2.7"/><circle cx="4.4" cy="22.6" r="2.5"/>
          <circle cx="19.6" cy="22.6" r="2.5"/><circle cx="6.0" cy="25.4" r="2.2"/>
          <circle cx="18.0" cy="25.4" r="2.2"/><circle cx="8.1" cy="27.6" r="1.8"/>
          <circle cx="15.9" cy="27.6" r="1.8"/><circle cx="12" cy="9.8" r="6.1"/>
        </g>
        <ellipse cx="12" cy="12.8" rx="3.6" ry="4.6" fill="#000"/>
      </mask>
      <rect width="24" height="30" fill="currentColor" mask="url(#jcHair)"/>
    </svg></a>'''

# ---------------------------------------------------------------- load
S = json.load(open('content/site.json', encoding='utf-8'))
entries  = S['entries']
projects = [e for e in entries if e['kind'] == 'project']
roles    = [e for e in entries if e['kind'] == 'role']

missing = [f'assets/img/{e["image"]}.{x}' for e in entries if e.get('image')
           for x in ('png','jpg') if not os.path.exists(f'assets/img/{e["image"]}.{x}')]
for k in ('resume','pilates'):
    for x in ('png','jpg'):
        p = f'assets/img/{S[k]["image"]}.{x}'
        if not os.path.exists(p): missing.append(p)
if missing:
    sys.exit('MISSING IMAGES:\n  ' + '\n  '.join(missing) +
             '\n\nAdd the photo with:  python3 tools/dither.py <photo> <name>')

# ---------------------------------------------------------------- rows
def row(e, i):
    s = e['summary']
    blurb = (s[:210].rsplit(' ', 1)[0] + '&hellip;') if len(s) > 210 else esc(s)
    if len(s) > 210: blurb = esc(s[:210].rsplit(' ', 1)[0]) + '&hellip;'
    return (f'<a class="item" href="#/{e["slug"]}">'
            f'<span class="head"><span class="idx">{i:02d}</span>'
            f'<h3>{esc(e["title"])}</h3><span class="org">{esc(e["org"])}</span>'
            f'<span class="when">{esc(e["when"])}</span><span class="arw">&rarr;</span></span>'
            f'<p>{blurb}</p><span class="tags">{pills(e["tags"], 3)}</span></a>')

project_rows = ''.join(row(e, i+1) for i, e in enumerate(projects))
role_rows    = ''.join(row(e, i+1) for i, e in enumerate(roles))

# ---------------------------------------------------------------- details
def detail(e, n):
    prev, nxt = entries[n-1], entries[(n+1) % len(entries)]
    back = 'projects' if e['kind'] == 'project' else 'experience'
    anchor = '#projects' if e['kind'] == 'project' else '#resume'
    link = ''
    if e.get('link') and e.get('link_label'):
        ext = ' target="_blank" rel="noopener noreferrer"' if str(e['link']).startswith('http') else ''
        link = (f'<p style="margin:0"><a class="btn" href="{esc(e["link"])}"{ext}>'
                f'{esc(e["link_label"])} <span>&rarr;</span></a></p>')
    blocks = ''
    if e.get('problem'):
        blocks += ('<div class="block"><h4>The Problem</h4>' +
                   ''.join(f'<p>{md(p)}</p>' for p in e['problem']) + '</div>')
    if e.get('included'):
        blocks += ('<div class="block"><h4>What&rsquo;s Included</h4><ul class="inc">' +
                   ''.join(f'<li>{esc(x)}</li>' for x in e['included']) + '</ul></div>')
    if e.get('impact'):
        blocks += ('<div class="block"><h4>Impact</h4><div class="impact">' +
                   ''.join(f'<p>{md(p)}</p>' for p in e['impact']) + '</div></div>')
    stack = ''
    if e.get('stack'):
        stack = ('<div><p class="kicker sh">$ cat stack.txt</p><div class="chips">' +
                 ''.join(f'<span class="chip">{esc(x)}</span>' for x in e['stack']) + '</div></div>')
    return f'''
<article class="detail" data-slug="{e['slug']}">
  <div class="dtop"><a class="back" href="{anchor}">$ cd ../{back}</a></div>
  <div class="dhead">
    <p class="kicker">{'Selected work' if e['kind']=='project' else 'Experience'}</p>
    <h1>{esc(e['title'])}</h1>
    <div class="dmeta"><span class="org">{esc(e['org'])}</span>
      <span class="when">{esc(e['when'])}</span></div>
    <div class="item"><span class="tags">{pills(e['tags'])}</span></div>
  </div>
  <div class="dbody">
    <p class="lede">{md(e['summary'])}</p>
    <div class="dgrid">
      <div>{blocks}{link}</div>
      <div class="sticky">
        {plate(e.get('image'), e.get('image_caption'))}
        {plate(e.get('image2'), e.get('image2_caption'))}
        {stack}
      </div>
    </div>
  </div>
  <div class="dnav">
    <a href="#/{prev['slug']}"><span class="lbl">&larr; PREVIOUS</span>{esc(prev['title'])}</a>
    <a href="#/{nxt['slug']}" style="text-align:right"><span class="lbl">NEXT &rarr;</span>{esc(nxt['title'])}</a>
  </div>
</article>'''

details = ''.join(detail(e, n) for n, e in enumerate(entries))

# ---------------------------------------------------------------- palette
palette = [{'t': e['title'], 'k': (' '.join(e['tags']) + ' ' + e['org']).lower(),
            'tag': '02' if e['kind'] == 'project' else '01',
            'c': 'var(--sec)', 'h': '#/' + e['slug']} for e in entries]
palette += [
 {'t': 'Résumé (PDF)', 'k': 'resume cv pdf hire', 'tag': 'FILE', 'c': 'var(--sec)', 'h': '#resume'},
 {'t': 'Capabilities', 'k': 'skills stack tools', 'tag': '02', 'c': 'var(--sec)', 'h': '#projects'},
 {'t': 'Pilates — SLT New York', 'k': 'pilates fitness slt megaformer teaching',
  'tag': '03', 'c': 'var(--slt)', 'h': '#pilates'},
 {'t': 'Email me', 'k': 'contact email reach hire connect mail', 'tag': 'MAIL',
  'c': 'var(--ink)', 'h': '#connect'},
 {'t': 'LinkedIn', 'k': 'linkedin connect', 'tag': 'LINK', 'c': 'var(--ink)', 'h': '#connect'},
]

# ---------------------------------------------------------------- pieces
R, P, CN, CO = S['resume'], S['pilates'], S['connect'], S['colophon']

role_cards = ''
for r in S['roles']:
    c = f'var(--{r["color"]})'
    if r.get('enabled') and r.get('href'):
        role_cards += (f'<li><a class="role" href="{esc(r["href"])}" style="--c:{c}">'
                       f'<span class="top"><span class="sq"></span>'
                       f'<span class="ttl">{esc(r["title"])}</span><span class="go2">&rarr;</span></span>'
                       f'<span class="sub">{esc(r["sub"])}</span></a></li>')
    else:
        badge = f'<span class="tagsoon">{esc(r.get("badge","SOON"))}</span>'
        role_cards += (f'<li><div class="role soon" style="--c:{c}">'
                       f'<span class="top"><span class="sq"></span>'
                       f'<span class="ttl">{esc(r["title"])}</span>{badge}</span>'
                       f'<span class="sub">{esc(r["sub"])}</span></div></li>')

metrics = ''.join(f'<div class="metric"><span class="v">{esc(m["value"])}</span>'
                  f'<span class="k">{esc(m["label"])}</span></div>' for m in R['metrics'])
chips   = ''.join(f'<span class="chip">{esc(c)}</span>' for c in S['capabilities'])
specs   = ''.join(f'<dt>{esc(k)}</dt><dd>{esc(v)}</dd>' for k, v in CO['specs'])
colo_ps = ''.join(f'<p>{md(p)}</p>' for p in CO['paragraphs'])

pil_btn = (f'<a class="btn" href="{esc(P["button_href"])}">{esc(P["button_label"])} <span>&rarr;</span></a>'
           if P.get('button_href') else
           f'<span class="btn inert">{esc(P["button_label"])} <span>&rarr;</span></span>')
pil_note = (f'<span style="font-family:var(--pix);font-size:9px;color:var(--dimmer)">'
            f'{esc(P["button_note"])}</span>' if P.get('button_note') else '')

ga = ''
if S['site'].get('analytics_id'):
    gid = S['site']['analytics_id']
    ga = (f'<script async src="https://www.googletagmanager.com/gtag/js?id={gid}"></script>\n'
          f'<script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments);}}\n'
          f'gtag("js",new Date());gtag("config","{gid}");</script>')

# ---------------------------------------------------------------- assemble
page = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(S['site']['title'])}</title>
<meta name="description" content="{esc(R['headline'])} Security engineer and Pilates instructor in New York.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Pacifico&family=Space+Grotesk:wght@400;500;700&family=Geist+Mono:wght@400;500&family=Silkscreen:wght@400;700&display=swap">
<link rel="stylesheet" href="assets/css/site.css">
{ga}
</head>
<body>
<div class="crt"></div><div class="vig"></div>

<nav class="menubar" id="menubar">
  {HAIR}
  <a href="#resume">R&eacute;sum&eacute;</a>
  <a href="#projects">Projects</a>
  <a href="#pilates">Pilates</a>
  <a href="#connect" class="hide-sm">Connect</a>
  <span class="mb-right">
    <span class="clockwrap" id="clockWrap" tabindex="0" role="button" aria-label="Show full date and time">
      <span class="mb-clock" id="clock">--:-- NY</span>
      <span class="clockpop">
        <span class="cp-date" id="cpDate">&mdash;</span>
        <span class="cp-time" id="cpTime">--:--:--<i>.000</i></span>
        <span class="cp-rows">
          <span><b>ZONE</b><span>America/New_York</span></span>
          <span><b>OFFSET</b><span id="cpUtc">&mdash;</span></span>
          <span><b>EPOCH</b><span id="cpEpoch">&mdash;</span></span>
        </span>
      </span>
    </span>
    <span class="kbd" id="palOpen">&#8984;K</span>
  </span>
</nav>

<div id="wrap">
  <div id="stage"><div class="stageInner">
    <div class="heroBlock" id="heroBlock">
      <span class="scriptWrap">
        <p class="script">{esc(S['hero']['script'])}</p>
        <span class="nib" aria-hidden="true"></span>
      </span>
      <p class="whoami">{esc(S['hero']['name'])}</p>
    </div>
    <div class="gate" id="gate" aria-hidden="true">
      <p class="gate-lead" id="gateLead">{esc(S['hero']['gate_lead'])}</p>
      <ul class="roles" id="roles">{role_cards}</ul>
    </div>
    <div class="cue" id="cue">&#9663; SCROLL</div>
  </div></div>
</div>

<main>
<div class="index">
  <section class="sec" id="resume">
    <div class="eyebrow"><span class="n">01</span><span>{esc(R['eyebrow'])}</span><span class="bar"></span></div>
    <div class="split">
      <div>
        {plate(R['image'], R['image_caption'], R['image_alt'])}
        <div style="margin-top:22px">
          <p class="kicker">Education</p>
          <p style="margin:0;font-size:15px">{esc(R['education']['degree'])}<br>
            <span style="color:var(--dim);font-family:var(--mono);font-size:12px">{esc(R['education']['school'])}</span></p>
        </div>
      </div>
      <div>
        <h2>{esc(R['headline'])}</h2>
        <p class="lede">{md(R['lede'])}</p>
        <div class="metrics">{metrics}</div>
        <p class="kicker">Experience</p>
        <div class="rows">{role_rows}</div>
        <p style="margin-top:30px;display:flex;gap:12px;flex-wrap:wrap">
          <a class="btn" href="{esc(R['resume_pdf'])}">R&eacute;sum&eacute; (PDF) <span>&rarr;</span></a>
          <a class="btn ghost" href="#projects">See the projects <span>&rarr;</span></a>
        </p>
      </div>
    </div>
  </section>

  <section class="sec" id="projects">
    <div class="eyebrow"><span class="n">02</span><span>Selected Work</span><span class="bar"></span></div>
    <div class="rows">{project_rows}</div>
    <div style="margin-top:clamp(34px,5vh,54px)">
      <p class="kicker sh">$ ls capabilities/</p>
      <div class="chips">{chips}</div>
    </div>
  </section>

  <div class="secwrap pilates" id="pilates">
    <div class="ghostword" aria-hidden="true">PILATES PILATES</div>
    <section class="sec">
      <div class="eyebrow"><span class="n">03</span><span>{esc(P['eyebrow'])}</span><span class="bar"></span></div>
      <div class="split">
        <div>
          <h2>{esc(P['headline'])}</h2>
          <p class="lede">{md(P['lede'])}</p>
          <p style="margin-top:26px;display:flex;gap:12px;flex-wrap:wrap;align-items:center">
            {pil_btn}{pil_note}
          </p>
        </div>
        <div>{plate(P['image'], P['image_caption'], P['image_alt'])}</div>
      </div>
    </section>
  </div>

  <section class="connect" id="connect">
    <p class="hi">{esc(CN['script'])}<span class="dot">.</span></p>
    <p class="sub">{esc(CN['sub'])}</p>
    <div class="cbtns">
      <a class="btn" id="mailBtn" href="#connect"
         data-u="{esc(CN['email_user'])}" data-d="{esc(CN['email_domain'])}">Email me <span>&rarr;</span></a>
      <a class="btn ghost" href="{esc(CN['linkedin'])}" target="_blank" rel="noopener noreferrer">LinkedIn <span>&rarr;</span></a>
    </div>
    <p class="eof">$ exit 0<span class="blink">_</span></p>
  </section>

  <section class="colophon">
    <p class="kicker sh">$ cat colophon.txt</p>
    <div class="colo-grid">
      <div>{colo_ps}</div>
      <dl class="specs">{specs}</dl>
    </div>
  </section>

  <footer>
    <span>{esc(CO['footer_left'])}</span>
    <span>{esc(CO['footer_right'])}</span>
  </footer>
</div>
{details}
</main>

<div class="lb" id="lb" role="dialog" aria-modal="true" aria-label="Image viewer">
  <button class="lb-x" id="lbX" aria-label="Close image">&times;</button>
  <figure class="lb-fig" id="lbFig">
    <span class="lb-stack">
      <img class="lb-col" id="lbCol" src="" alt="">
      <img class="lb-dith" id="lbDith" src="" alt="">
    </span>
    <figcaption><span id="lbCap">&mdash;</span><b id="lbState">$ developing...</b></figcaption>
  </figure>
</div>

<div class="pal" id="pal" role="dialog" aria-modal="true" aria-label="Command palette">
  <div class="palbox">
    <input id="palInput" type="text" placeholder="Search projects, experience, &amp; skills&hellip;" autocomplete="off">
    <ul id="palList"></ul>
    <div class="palfoot">&#8593;&#8595; NAVIGATE &nbsp; &#8629; OPEN &nbsp; ESC CLOSE</div>
  </div>
</div>

<script>window.__PALETTE__ = {json.dumps(palette, ensure_ascii=True)};</script>
<script src="assets/js/site.js"></script>
</body>
</html>
'''

open('index.html','w',encoding='utf-8').write(page)
print(f'index.html        {len(page)/1024:.0f} KB')
print(f'  projects {len(projects)}   experience {len(roles)}   detail pages {len(entries)}')
print(f'  palette  {len(palette)} entries')
raw = [c for c in page if ord(c) > 127]
print(f'  raw non-ASCII in output: {len(raw)}')
