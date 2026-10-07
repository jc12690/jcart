#!/usr/bin/env python3
"""
Builds index.html from content/site.json.

    python3 tools/build.py
    python3 tools/build.py --drafts   # also include entries marked "draft": true

Nothing else needs editing to change the site's words, links, or images --
it all lives in content/site.json. See EDITING.md.

--drafts is for previewing locally. The pre-commit hook always rebuilds
without it, so a draft can't be published by accident.
"""
import json, os, re, sys, html, shutil
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
DRAFTS = '--drafts' in sys.argv[1:]

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

_SIZE_CACHE = {}
def imgsize(path):
    """Real pixel dimensions, so the browser can reserve the space before the
    image loads. Without this, lazy images grow the page after layout and any
    scroll-to-section computed beforehand lands in the wrong place."""
    if path not in _SIZE_CACHE:
        try:
            from PIL import Image
            with Image.open(path) as im:
                _SIZE_CACHE[path] = im.size
        except Exception:
            _SIZE_CACHE[path] = None
    return _SIZE_CACHE[path]


def _dim(path):
    wh = imgsize(path)
    return f' width="{wh[0]}" height="{wh[1]}"' if wh else ''


def plate(key, caption, alt=None, cls=''):
    """A dithered image that develops into colour on hover and opens a lightbox."""
    if not key:
        return ''
    jpg, png = f'assets/img/{key}.jpg', f'assets/img/{key}.png'
    return (f'<figure class="plate {cls}" tabindex="0">'
            f'<img class="col" src="{jpg}" alt=""{_dim(jpg)} loading="lazy" decoding="async">'
            f'<img class="dith" src="{png}" alt="{esc(alt or caption or "")}"{_dim(png)} loading="lazy" decoding="async">'
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

ANALYTICS = """<script>
(function(){
  /* Google Analytics ran on this site until September 2026 and left _ga cookies
     in returning visitors' browsers, plus a jc-consent record from the banner
     that gated it. Nothing reads either any more, so expire them. This block can
     be deleted after the end of 2028, by which point the cookies would have
     expired on their own. */
  try{
    var parts=location.hostname.split("."),domains=[""];
    for(var i=0;i<parts.length-1;i++)domains.push("."+parts.slice(i).join("."));
    document.cookie.split(";").forEach(function(pair){
      var n=pair.split("=")[0].trim();
      if(n==="_ga"||n.indexOf("_ga_")===0||n==="_gid"||n.indexOf("_gat")===0){
        domains.forEach(function(d){
          document.cookie=n+"=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/"+(d?"; domain="+d:"");
        });
      }
    });
    localStorage.removeItem("jc-consent");
  }catch(e){}

  /* Cloudflare Web Analytics. It sets no cookies and stores nothing on the
     visitor's device, so this site needs no consent banner. Gated to the
     production hostname so local development and forks never reach the real
     dashboard. The token is public by design and visible in the page source. */
  var h=location.hostname;
  if(h==="{DOMAIN}"||h==="www.{DOMAIN}"){
    var b=document.createElement("script");
    b.type="module";
    b.src="https://static.cloudflareinsights.com/beacon.min.js";
    b.setAttribute("data-cf-beacon",'{"token": "{TOKEN}"}');
    document.head.appendChild(b);
  }
})();
</script>"""

# ---------------------------------------------------------------- load
S = json.load(open('content/site.json', encoding='utf-8'))
entry_drafts = [e for e in S['entries'] if e.get('draft')]
entries  = [e for e in S['entries'] if DRAFTS or not e.get('draft')]
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

# ---------------------------------------------------------------- lab logs
# An entry can point at a log file ("lab_log": "content/htb.json"). The build
# reads it, does the counting, and renders the machine and module lists, so
# logging a box is one block in that file and nothing else. EDITING.md, Recipe 9.
OWNED = ('user', 'root')
lab_warnings = []

def load_lab_log(e):
    path = e['lab_log']
    try:
        L = json.load(open(path, encoding='utf-8'))
    except FileNotFoundError:
        sys.exit(f'LAB LOG NOT FOUND: {path} (named by "{e["slug"]}" in content/site.json)')
    except json.JSONDecodeError as err:
        sys.exit(f'LAB LOG IS NOT VALID JSON: {path}\n  {err}\n\n'
                 'Usually a missing comma between blocks, or a trailing comma after the last one.')
    problems = []
    for kind, need in (('machines', ('name', 'os', 'difficulty', 'date', 'owned')),
                       ('modules',  ('name', 'date'))):
        for i, m in enumerate(L.get(kind, []), 1):
            label = f'{kind} #{i} ({m.get("name") or "no name"})'
            problems += [f'{label}: missing "{k}"' for k in need if not m.get(k)]
            if m.get('date'):
                try:
                    if not re.fullmatch(r'\d{4}-\d{2}-\d{2}', m['date']): raise ValueError
                    date.fromisoformat(m['date'])
                except ValueError:
                    problems.append(f'{label}: "date" must look like 2026-10-04')
            if kind == 'machines' and m.get('owned') and m['owned'] not in OWNED:
                problems.append(f'{label}: "owned" must be "user" or "root"')
    if problems:
        sys.exit(f'LAB LOG PROBLEMS in {path}:\n  ' + '\n  '.join(problems))
    return L

# Checked even while the entry is a draft, so a typo shows up the day you log the box.
LOGS = {e['slug']: load_lab_log(e) for e in S['entries'] if e.get('lab_log')}

def lab_progress(L):
    """The numbers, counted from the log rather than typed in, so they can't drift."""
    machines, modules = L.get('machines', []), L.get('modules', [])
    rooted = [m for m in machines if m['owned'] == 'root']
    user_only = len(machines) - len(rooted)
    lin = sum(1 for m in rooted if m['os'].lower() == 'linux')
    win = sum(1 for m in rooted if m['os'].lower() == 'windows')
    other = len(rooted) - lin - win
    dates = [x['date'] for x in machines + modules]
    tiles = [
        (len(rooted), 'Machines rooted' + (f', plus {user_only} user-only' if user_only else '')),
        (f'{lin} / {win}' + (f' / {other}' if other else ''),
         'Linux / Windows' + (' / Other' if other else '')),
        (len(modules), 'Academy modules completed'),
        (date.fromisoformat(max(dates)).strftime('%b %Y') if dates else 'None yet', 'Last activity'),
    ]
    return ('<div><p class="kicker sh">$ cat progress.txt</p><div class="metrics">' +
            ''.join(f'<div class="metric"><span class="v">{esc(v)}</span>'
                    f'<span class="k">{esc(k)}</span></div>' for v, k in tiles) +
            '</div></div>')

def lab_blocks(L, H):
    """Machine and module lists, newest first. An empty list says so plainly."""
    empty = '<p class="ll-empty">total 0</p>'
    def machine(m):
        meta = ''.join(f'<span class="pill{" hot" if k == "owned" else ""}">{esc(m[k])}</span>'
                       for k in ('os', 'difficulty', 'owned'))
        # Hack The Box forbids publishing solutions to active machines, so the
        # technique line and any writeup link only ship once a box is retired.
        note = link = ''
        if m.get('retired'):
            if m.get('technique'):
                note = f'<span class="ll-note">{esc(m["technique"])}</span>'
            if m.get('writeup'):
                ext = ' target="_blank" rel="noopener noreferrer"' if str(m['writeup']).startswith('http') else ''
                link = f'<a class="ll-link" href="{esc(m["writeup"])}"{ext}>Writeup &rarr;</a>'
        elif m.get('technique') or m.get('writeup'):
            lab_warnings.append(f'{m["name"]} is active, so its technique and writeup stay off '
                                f'the page until you mark it "retired": true')
        return (f'<li><span class="ll-name">{esc(m["name"])}</span>'
                f'<span class="ll-date">{esc(m["date"])}</span>'
                f'<span class="ll-meta">{meta}</span>{note}{link}</li>')
    def module(d):
        return (f'<li><span class="ll-name">{esc(d["name"])}</span>'
                f'<span class="ll-date">{esc(d["date"])}</span></li>')
    out = ''
    for key, fn in (('machines', machine), ('modules', module)):
        items = sorted(L.get(key, []), key=lambda x: x['date'], reverse=True)
        body = f'<ol class="lablog">{"".join(fn(x) for x in items)}</ol>' if items else empty
        out += f'<div class="block"><h4>{H[key]}</h4>{body}</div>'
    return out

def lab_tools(L):
    """Every tool named in the log, most-used first, for stack.txt."""
    counts = {}
    for m in sorted(L.get('machines', []), key=lambda x: x['date']):
        for t in m.get('tools', []):
            counts[t] = counts.get(t, 0) + 1
    return sorted(counts, key=lambda t: -counts[t])

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
HEADINGS = {'problem': 'The Problem', 'included': 'What&rsquo;s Included', 'impact': 'Impact',
            'machines': 'Machine Log', 'modules': 'Academy Modules'}

def detail(e, n):
    prev, nxt = entries[n-1], entries[(n+1) % len(entries)]
    back = 'projects' if e['kind'] == 'project' else 'experience'
    anchor = '#projects' if e['kind'] == 'project' else '#resume'
    link = ''
    if e.get('link') and e.get('link_label'):
        ext = ' target="_blank" rel="noopener noreferrer"' if str(e['link']).startswith('http') else ''
        note = (f'<p class="linknote">{md(e["link_note"])}</p>' if e.get('link_note') else '')
        link = (f'<p style="margin:0"><a class="btn" href="{esc(e["link"])}"{ext}>'
                f'{esc(e["link_label"])} <span>&rarr;</span></a></p>{note}')
    # Section headings can be renamed per entry: "headings": {"problem": "Why"}
    H = dict(HEADINGS)
    H.update({k: esc(v) for k, v in (e.get('headings') or {}).items()})
    L = LOGS.get(e['slug'])
    blocks = ''
    if e.get('problem'):
        blocks += (f'<div class="block"><h4>{H["problem"]}</h4>' +
                   ''.join(f'<p>{md(p)}</p>' for p in e['problem']) + '</div>')
    if e.get('included'):
        blocks += (f'<div class="block"><h4>{H["included"]}</h4><ul class="inc">' +
                   ''.join(f'<li>{esc(x)}</li>' for x in e['included']) + '</ul></div>')
    if L:
        blocks += lab_blocks(L, H)
    if e.get('impact'):
        blocks += (f'<div class="block"><h4>{H["impact"]}</h4><div class="impact">' +
                   ''.join(f'<p>{md(p)}</p>' for p in e['impact']) + '</div></div>')
    progress = lab_progress(L) if L else ''
    stack_items = list(e.get('stack') or [])
    if L:
        have = {s.split(':')[0].strip().lower() for s in stack_items}
        stack_items += [t for t in lab_tools(L) if t.lower() not in have]
    stack = ''
    if stack_items:
        stack = ('<div><p class="kicker sh">$ cat stack.txt</p><div class="chips">' +
                 ''.join(f'<span class="chip">{esc(x)}</span>' for x in stack_items) + '</div></div>')
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
        {progress}{plate(e.get('image'), e.get('image_caption'))}
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

# ---------------------------------------------------------------- publications
PUB = S.get('publications') or {}
pub_items = [p for p in PUB.get('items', []) if not p.get('draft')]
pub_drafts = [p for p in PUB.get('items', []) if p.get('draft')]

pubs_html = ''
if pub_items:
    rows = ''
    for i, p in enumerate(pub_items, 1):
        meta = ' &middot; '.join(esc(x) for x in
               [p.get('venue'), p.get('year'), p.get('role')] if x)
        body = f'<p>{md(p["summary"])}</p>' if p.get('summary') else ''
        if p.get('note'):
            body += f'<p class="linknote">{md(p["note"])}</p>'
        # title, then its meta directly beneath it and aligned with it --
        # the number sits in its own column so nothing tucks under it
        inner = (f'<span class="idx">{i:02d}</span>'
                 f'<span class="pubbody">'
                 f'<span class="pubhead"><h3>{esc(p["title"])}</h3>'
                 f'{"<span class=\"arw\">&rarr;</span>" if p.get("link") else ""}</span>'
                 f'<span class="when">{meta}</span>{body}</span>')
        if p.get('link'):
            ext = ' target="_blank" rel="noopener noreferrer"' if str(p['link']).startswith('http') else ''
            rows += f'<a class="item pub" href="{esc(p["link"])}"{ext}>{inner}</a>'
        else:
            rows += f'<div class="item pub">{inner}</div>'
    pubs_html = f'''
  <section class="sec" id="publications">
    <div class="eyebrow"><span class="n">03</span><span>{esc(PUB.get("eyebrow","Published work"))}</span><span class="bar"></span></div>
    <h2 style="max-width:18ch">{esc(PUB.get("headline","Writing and research."))}</h2>
    <div class="rows">{rows}</div>
  </section>'''

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
if S['site'].get('analytics_token'):
    ga = ANALYTICS.replace('{DOMAIN}', S['site'].get('domain', '')) \
                  .replace('{TOKEN}', S['site']['analytics_token'])

# ---------------------------------------------------------------- assemble
page = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script>try{{if(localStorage.getItem("jc-theme")==="light")document.documentElement.setAttribute("data-theme","light")}}catch(e){{}}</script>
<title>{esc(S['site']['title'])}</title>
<meta name="description" content="{esc(R['headline'])} Security engineer and Pilates instructor in New York.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Pacifico&family=Space+Grotesk:wght@400;500;700&family=Geist+Mono:wght@400;500&family=Silkscreen:wght@400;700&display=swap">
<link rel="stylesheet" href="assets/css/site.css">
<link rel="stylesheet" href="assets/css/cursors.css">
{ga}
</head>
<body>
<div class="crt"></div><div class="vig"></div>

<nav class="menubar" id="menubar">
  {HAIR}
  <a href="#resume">R&eacute;sum&eacute;</a>
  <a href="#projects">Projects</a>
  {'<a href="#publications">Published</a>' if pub_items else ''}
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
    <button class="themetog" id="themeTog" type="button" aria-pressed="false"
            aria-label="Switch to light mode" title="Switch to light mode"><span class="sw" aria-hidden="true"></span>THEME</button>
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

{pubs_html}
  <div class="secwrap pilates" id="pilates">
    <div class="ghostword" aria-hidden="true">PILATES PILATES</div>
    <section class="sec">
      <div class="eyebrow"><span class="n">{'04' if pub_items else '03'}</span><span>{esc(P['eyebrow'])}</span><span class="bar"></span></div>
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
if pub_drafts:
    print(f'\n  NOTE: {len(pub_drafts)} publication(s) still marked "draft": true and were skipped:')
    for p in pub_drafts:
        print(f'        - {p.get("title","(untitled)")}')
    print('        Fill them in in content/site.json and set "draft": false to publish them.')
if entry_drafts:
    verb = 'INCLUDED for preview (--drafts)' if DRAFTS else 'skipped'
    print(f'\n  NOTE: {len(entry_drafts)} entr{"y" if len(entry_drafts) == 1 else "ies"} '
          f'marked "draft": true {verb}:')
    for e in entry_drafts:
        print(f'        - {e["title"]}')
    if DRAFTS:
        print('        Preview only. The pre-commit hook rebuilds without drafts.')
    else:
        print('        Preview with:  python3 tools/build.py --drafts')
for w in lab_warnings:
    print(f'\n  WARNING: {w}')
raw = [c for c in page if ord(c) > 127]
print(f'  raw non-ASCII in output: {len(raw)}')
