# Editing jarredmcarter.com

Plain HTML, CSS, and JavaScript. **No React, no npm, no `node_modules`.**
The only "build" is one small Python script that stamps your content into `index.html`.

The rule to remember:

> **Never edit `index.html` by hand.** It gets overwritten.
> Edit `content/site.json`, then run the build.

```bash
python3 tools/build.py
```

---

## The 30-second version

| I want to… | Edit this | Then |
|---|---|---|
| Change any words on the page | `content/site.json` | run the build |
| Add a project or job | `content/site.json` → `entries` | run the build |
| Add a photo | `python3 tools/dither.py <photo> <name>` | reference `<name>`, run the build |
| Change colors, spacing, fonts | `assets/css/site.css` | nothing — refresh |
| Change how something behaves | `assets/js/site.js` | nothing — refresh |
| Publish | `git add -A && git commit && git push` | GitHub Pages does the rest |

---

## Where everything lives

```
~/Websites/jcart/
├── index.html              ← GENERATED. Do not edit.
├── content/
│   └── site.json           ← ★ every word, link, and image choice
├── assets/
│   ├── css/site.css        ← all styling
│   ├── js/site.js          ← all behaviour
│   └── img/                ← .png = dithered, .jpg = colour (pairs!)
├── tools/
│   ├── build.py            ← content/site.json → index.html
│   └── dither.py           ← photo → the .png/.jpg pair
├── media/                  ← your original photo library (untouched)
├── files/                  ← résumé + PDFs
├── legacy-index.html       ← the previous homepage, kept for reference
└── experience/ projects/ fitness/ modeling/ quickbio/
                            ← old pages, still live at their URLs
```

### Why images come in pairs

Every image is **two files with the same name**:

* `assets/img/bobst.png` — the 1-bit Atkinson dither. What you see first.
* `assets/img/bobst.jpg` — full colour, high-res. What it develops into.

In `site.json` you only ever write the shared name: `"image": "bobst"`.
The build finds both. If one is missing, the build **stops and tells you** — it
won't ship a broken image.

---

## Recipe 1 — change some words

Open `content/site.json`, find the text, change it, save, build.

```json
"resume": {
  "headline": "Secure systems that protect what matters.",
  "lede": "Penetration testing, vulnerability management, ... **translate it into risk language executives can act on**."
}
```

Two bits of formatting work inside any text:

* `**bold**` → **bold**
* `_italic_` → *italic*

Everything else is literal. You do **not** need to escape `&`, `<`, quotes, or
accented characters — the build handles that.

---

## Recipe 2 — add a project

In `content/site.json`, find `"entries"` and copy an existing block. Order in
the file is the order on the page.

```json
{
  "slug": "my-new-project",
  "kind": "project",
  "title": "My New Project",
  "org": "Client or School",
  "when": "2026",
  "summary": "One or two sentences. This shows on the list AND at the top of the detail page.",
  "tags": ["Threat Intelligence", "Bot Detection"],
  "image": "my-new-project",
  "image_caption": "WHAT THE PICTURE SHOWS",
  "problem":  ["A paragraph.", "Another paragraph."],
  "included": ["A bullet.", "Another bullet."],
  "impact":   ["What changed because of the work."],
  "stack":    ["Python: what you used it for", "Burp Suite: what you used it for"],
  "link": "https://github.com/jc12690/thing",
  "link_label": "View project"
}
```

Field notes:

* **`slug`** — the URL. This becomes `jarredmcarter.com/#/my-new-project`.
  Lowercase, hyphens, no spaces. Once you share a link, don't change it.
* **`kind`** — `"project"` puts it under *Selected Work*; `"role"` puts it under
  *Experience* on the résumé.
* **`when`** — free text. Roles use things like `"Jun–Sep 2024 · Internship"`.
* **`image`** — optional. Leave it out and the detail page simply has no photo.
* **`link` / `link_label`** — optional, both or neither. External links open in
  a new tab automatically.
* **`image2` / `image2_caption`** — optional second photo (see
  `offensive-security` for an example).

Prev/next navigation, the command palette, and the list row are all generated.
You don't touch them.

---

## Recipe 3 — add a photo

```bash
python3 tools/dither.py media/whatever.jpg my-new-project
```

That writes both files into `assets/img/`. Then set
`"image": "my-new-project"` and build.

Useful flags:

```bash
# crop first: left,top,right,bottom as fractions of the original
python3 tools/dither.py media/photo.jpg headshot --crop 0.2,0.22,1,1

# screenshots want less contrast than photos
python3 tools/dither.py media/terminal.png term --contrast 1.05
```

**Tuning tip.** If the dither looks like mud, raise `--contrast`. If it looks
like a photocopy with no midtones, lower it. Photos usually land around `1.3`,
screenshots around `1.05`. Just re-run — it overwrites.

---

## Recipe 4 — when the Pilates site is ready

In `content/site.json`:

```json
"roles": [
  ...
  { "title": "Pilates Instructor", "href": "https://your-pilates-site.com",
    "enabled": true }          ← was false
]
```

and

```json
"pilates": {
  "button_href": "https://your-pilates-site.com",   ← was null
  "button_note": null                               ← removes "SITE IN PROGRESS"
}
```

Build. The card on the opening screen becomes clickable and the teal
**Learn more** button starts working. No HTML changes.

---

## Recipe 5 — preview before you publish

```bash
python3 -m http.server 8900
```

Then open <http://localhost:8900>. Ctrl-C to stop.

Open it this way rather than double-clicking `index.html` — some things
(hash links, fonts) behave differently over `file://`.

---

## Publishing

```bash
git add -A
git commit -m "Describe what changed"
git push
```

GitHub Pages rebuilds in a minute or two. `CNAME` points the repo at
`jarredmcarter.com` — don't delete that file.

⚠️ **Your SSH private key (`jc12690`) lives in this folder** and is listed in
`.gitignore` so it never gets committed. Don't remove those lines.

---

## Design notes (for when you tweak CSS)

Everything is driven by variables at the top of `assets/css/site.css`:

```css
--sec:  #83fa40;   /* security green — CRT phosphor */
--slt:  #00a7d3;   /* SLT's real brand teal */
--ink:  #f4f4f2;   /* text */
--void: #080809;   /* background */
```

Change `--sec` in one place and every eyebrow, pill, hover, button, and metric
across the whole site follows. Each section sets `--accent` to one of these,
which is how the Pilates section goes teal without any duplicated rules.

The site is **deliberately dark-only**. It's a CRT, not a document.

---

## If something breaks

**The build refuses to run and lists missing images.** That's on purpose — a
name in `site.json` has no matching pair in `assets/img/`. Either run
`dither.py` for it or fix the spelling.

**A change didn't appear.** You almost certainly edited `index.html` instead of
`content/site.json`, or forgot to run the build. Re-run it — your edit to
`index.html` is already gone, so redo it in `site.json`.

**`json.decoder.JSONDecodeError`.** A typo in `site.json` — usually a missing
comma between blocks, or a trailing comma after the last one. The error message
gives a line number. Paste the file into <https://jsonlint.com> if you get stuck.

**Everything looks unstyled.** You opened `index.html` from the file system
instead of through `python3 -m http.server`.
