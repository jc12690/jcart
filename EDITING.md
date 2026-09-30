# Editing Jarredmcarter.com

Plain HTML, CSS, and JavaScript. **No React, no npm, no `node_modules`.**
The only "build" is one small Python script that stamps your content into `index.html`.

The rule to remember:

> **Never edit `index.html` by hand.** It gets overwritten.
> Edit `content/site.json`, then run the build.

```bash
python3 tools/build.py
```

---

## The 30-Second Version

| I want to… | Edit this | Then |
|---|---|---|
| Change any words on the page | `content/site.json` | run the build |
| Add a project or job | `content/site.json` → `entries` | run the build |
| Add a photo | `python3 tools/dither.py <photo> <name>` | reference `<name>`, run the build |
| Change colors, spacing, fonts | `assets/css/site.css` | nothing — refresh |
| Change how something behaves | `assets/js/site.js` | nothing — refresh |
| Publish | `git add -A && git commit && git push` | GitHub Pages does the rest |

---

## Where Everything Lives

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
├── fitness/                ← the fitness site (edited by hand; see Recipe 7)
└── experience/ projects/ quickbio/
                            ← redirect stubs, plus the link-in-bio page
```

### Why Images Come in Pairs

Every image is **two files with the same name**:

* `assets/img/bobst.png` — the 1-bit Atkinson dither. What you see first.
* `assets/img/bobst.jpg` — full colour, high-res. What it develops into.

In `site.json` you only ever write the shared name: `"image": "bobst"`.
The build finds both. If one is missing, the build **stops and tells you** — it
won't ship a broken image.

---

## Recipe 1: Change Some Words

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

## Recipe 2: Add a Project

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

## Recipe 3: Add a Photo

```bash
python3 tools/dither.py media/whatever.jpg my-new-project
```

That writes both files into `assets/img/`. Then set
`"image": "my-new-project"` and build.

Useful flags:

```bash
# Crop First: Left,top,right,bottom as Fractions of the Original
python3 tools/dither.py media/photo.jpg headshot --crop 0.2,0.22,1,1

# Screenshots Want Less Contrast Than Photos
python3 tools/dither.py media/terminal.png term --contrast 1.05
```

**Tuning tip.** If the dither looks like mud, raise `--contrast`. If it looks
like a photocopy with no midtones, lower it. Photos usually land around `1.3`,
screenshots around `1.05`. Just re-run — it overwrites.

---

## Recipe 4: Publishing the IEEE / NASA / CNCF Work

The **Published work** section is built and wired, but it stays hidden until you
fill it in. In `content/site.json` under `"publications"` there are three
entries, each marked `"draft": true`. The build skips drafts and tells you:

```
NOTE: 3 publication(s) still marked "draft": true and were skipped
```

Fill in the real values and flip the flag:

```json
{
  "draft": false,
  "title": "The actual title of the paper",
  "venue": "IEEE Transactions on ...",
  "year": "2020",
  "role": "Co-author",
  "summary": "One or two sentences on what it argues or demonstrates.",
  "link": "https://doi.org/...",
  "link_label": "Read the paper"
}
```

The moment at least one entry is not a draft, the section appears, a
**Published** link is added to the menu bar, and the Pilates section renumbers
itself from 03 to 04. Delete any entry you don't need.

Notes on what I could and couldn't find in the repo:

* **IEEE** — `files/ieee-paper.pdf` is already here (431 KB, October 2020), so
  `"link": "/files/ieee-paper.pdf"` works today. The PDF carries no title or
  author metadata, so you'll need to supply the title, venue, and your role —
  plus an IEEE Xplore DOI if it has one, which is a stronger link than the PDF.
* **NASA** — nothing in the repo. The only trace is a commented-out experience
  row in your old homepage (`Propulsion Systems Analyst, 05/2021–09/2021`),
  which is a job rather than a publication. Send the title and link.
* **CNCF** — nothing at all in the repo. Send the title and link.

The `"_note"` field in each draft is a reminder to you; the build ignores it,
so delete it once you've filled the entry in.

---

## Recipe 5: The Pilates Door on the Homepage

The **Pilates Instructor** card on the opening screen links to `fitness/`. It is
set in `content/site.json` under `roles`.

The **Learn More** button in the homepage's Pilates section still goes to your
SLT instructor page (`pilates.button_href`). Point it at `fitness/` if you would
rather it lead to your own site.

---

## Recipe 6: Analytics

The site uses **Cloudflare Web Analytics**. It sets no cookies and stores
nothing on the visitor's device, so there is **no consent banner** and nothing
for anyone to click. Cloudflare's own documentation is the basis for that:
it "does not use any client-side state, such as cookies or localStorage, to
collect usage metrics," and it does not fingerprint people by IP or User Agent.
No storage on the device means ePrivacy Art. 5(3) is never triggered.

Google Analytics was removed in September 2026. It needed a consent gate
precisely because it wrote a persistent `_ga` identifier, so swapping the tool
deleted the problem rather than managing it.

The token lives in `content/site.json`:

```json
"site": { "analytics_token": "baeb040b9418422b9a4543f89163988a" }
```

Change it there and rebuild. Three pages are not generated (`privacy.html`,
`quickbio/index.html`, and `fitness/index.html`), so the same token is pasted
into each and has to be changed by hand.

Two deliberate details in the snippet:

* **It only runs on `jarredmcarter.com`.** Local development, previews, and
  forks never reach the real dashboard, so your own testing does not pollute
  the numbers.
* **It deletes leftover `_ga` cookies and the old `jc-consent` record** on every
  load, because returning visitors still carry them. That block can be deleted
  after the end of 2028, when those cookies would have expired on their own.

The token is public by design and visible in the page source. It identifies the
site; it is not a secret.

---

## Recipe 7: The Fitness Site

It lives in `fitness/`: `index.html`, `fitness.css`, `fitness.js`, `weekly.js`,
and `media/`. Unlike the homepage it is **not generated**. You edit these files
directly, and the two lists you touch every week are the only things in
`weekly.js`. Quickbio reads its playlists from the same file.

**Add this week's playlist.** Append to `JC_PLAYLISTS`, newest last, move
`latest: true` onto it, and delete it from last week's entry:

```js
{w:27, name:"SLT #27", url:"https://music.apple.com/us/playlist/...", latest:true},
```

The rail, the hero's Latest Playlist button, and quickbio all read from this list.
`fav: true` marks a clients' favorite. Skipped weeks show as gaps on the rail.

**Dates are automatic.** Week 15 was the week of Monday 07/13/26 and each number
after it is one week later, so the rail labels itself in MM/DD/YY. If a
playlist lands on a different week than its number says, give that entry its
own `date: "2026-07-20"`. The starting point is `JC_PLAYLIST_WEEK_ONE`, just
above the list.

**The player is automatic too.** Each week's Apple Music player is built from
its `url`, so there is no embed code to paste, and it follows the site's theme:
dark in dark mode, light in light mode. It loads as visitors scroll to it.
Apple's player sets its own cookie and analytics ID when it loads, and the
privacy page says so; if you ever change how the player works, keep that
paragraph in step with it.

**Add a Mega Move Monday.** Append to `JC_MEGA_MOVES`, newest last:

```js
{ date: "2026-10-05", move: "Spider Kick", url: "https://www.instagram.com/reel/..." },
```

Placeholders date themselves with the coming Mondays and give way as entries
arrive, and one "Coming Monday" card always stays at the end. An entry with a
`move` and `date` but no `url` shows as a named teaser.

**Let visitors see you doing the move.** Add `clip` to the entry and the card
autoplays a short, silent loop of you, the way the old modeling page did;
tapping it opens the full post on Instagram:

```js
{ date: "2026-10-05", move: "Spider Kick", url: "https://www.instagram.com/reel/...",
  clip: "media/mmm-2026-10-05.mp4" },
```

Make the clip from the same video you posted:

```bash
ffmpeg -i YOUR_REEL.mp4 -an -t 8 -vf "scale=540:-2,format=yuv420p" -c:v libx264 -crf 28 -movflags +faststart fitness/media/mmm-2026-10-05.mp4
```

Then its poster, with the same name ending in `.jpg`. The card finds it on its
own, and it is what visitors see if their phone blocks autoplay (an iPhone in
Low Power Mode does):

```bash
ffmpeg -ss 0.5 -i YOUR_REEL.mp4 -frames:v 1 -vf "scale=540:-2" -q:v 4 fitness/media/mmm-2026-10-05.jpg
```

Each one comes out around half a megabyte, so a year of Mondays is roughly
25 MB, well inside what GitHub Pages allows. If you ever clear out old clips,
delete the entry's `clip` line too, and the card falls back to plain type.
For a still instead of a clip, use `img: "media/your-cover.jpg"`.

Every video on the page plays only while it is on screen, and none play for
visitors who have asked their device to reduce motion.

The row links to Instagram instead of embedding posts, on purpose: an embedded
post loads Meta's tracking scripts, which would put a consent banner back on
the site.

**Swap in your own hero video.** Replace `media/hero.mp4` and
`media/hero-poster.jpg`, keeping the names. Convert it first: iPhone video is
HEVC, which Firefox cannot play and Chrome plays only on some hardware.

```bash
ffmpeg -i YOUR_CLIP.mov -an -t 6 -vf "scale=720:-2,format=yuv420p" -c:v libx264 -crf 27 -movflags +faststart fitness/media/hero.mp4
```

```bash
ffmpeg -ss 0.4 -i YOUR_CLIP.mov -frames:v 1 -vf "scale=720:-2" -q:v 4 fitness/media/hero-poster.jpg
```

That makes a silent six-second loop of roughly 1 MB. Aim for a strong
silhouette: the hero plays it through a coarse mosaic first, and shape reads
through the pixels better than detail does.

**Add a photo or clip to In Motion.** Every photo and clip on the page opens
large in the viewer when clicked: the hero monitor and each In Motion tile.
Visitors step through them with the arrows (or a swipe), and Esc closes it.
Each tile shows a small copy and opens a larger `-lg` file, so make both from
the original. These commands also turn phone photos upright and strip their
location data:

```bash
ffmpeg -i PHOTO.jpg -vf "scale='min(1200,iw)':'min(1200,ih)':force_original_aspect_ratio=decrease" -q:v 3 -map_metadata -1 fitness/media/NAME.jpg
```

```bash
ffmpeg -i PHOTO.jpg -vf "scale='min(2000,iw)':'min(2000,ih)':force_original_aspect_ratio=decrease" -q:v 3 -map_metadata -1 fitness/media/NAME-lg.jpg
```

Then copy a tile in the In Motion section of `fitness/index.html` and change
its `href` to the `-lg` file, its `data-size` to that file's width and height
(`sips -g pixelWidth -g pixelHeight fitness/media/NAME-lg.jpg` prints them),
and the image's `src`, `width`, `height`, `alt`, and caption. For a clip, the
tile plays a 540-wide copy and the viewer a 720-wide `-lg.mp4`, with
`data-lb="video"` and a `data-poster`; the Class tile shows the pattern. Tiles
are placed by class (`t1` through `t5` in `fitness.css`), so a sixth one needs
a spot there too.

Mega Move Monday is the first section after the hero, so the first scroll shows
you moving.

**Quickbio keeps itself in step.** `quickbio/` is the Instagram link page,
dressed to match. It loads `fitness/weekly.js` too, so Recent Playlists always
shows the four newest weeks (Latest goes wherever `latest: true` is) and
Clients' Favorites shows every `fav: true` week. There is nothing to edit
there. Its headshot is `fitness/media/headshot.jpg`.

**Also shared with the homepage:** the cursors in `assets/img/cursors/`, the
`jc-theme` light/dark preference, and the Cloudflare analytics token, which is
pasted by hand into `fitness/index.html` (see Recipe 6).

`media/share.jpg` is the preview card that appears when the link is shared.
The old address, `fitness/fitness-index.html`, redirects here.

---

## Recipe 8: Preview Before You Publish

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

## Design Notes (for When You Tweak CSS)

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

The site ships **dark by default with an opt-in light mode**. Dark is what a CRT
is; light is what a System 7 desktop and a MacPaint canvas actually were, so both
are honest to the homage.

Light mode lives in the `:root[data-theme="light"]` block directly under the dark
tokens. It is reached **only** by the THEME switch in the menu bar, never by
`prefers-color-scheme` - a visitor on a light-mode OS still gets dark first. The
choice is saved to `localStorage` under `jc-theme`, and a tiny inline script in
`<head>` (emitted by `tools/build.py`) applies it before the page paints so there
is no flash of the wrong theme.

Three things to know if you edit colours:

* **Never hardcode a colour.** Add a token to `:root`, give it a light value in
  the light block, and use `var(--your-token)`. A raw hex will look correct in
  dark and wrong in light.
* **`--accent` vs `--accent-ink`.** `--accent` is the neon itself and is for
  FILLS (the buttons keep their phosphor green on both themes, which is why the
  button label stays near-black). `--accent-ink` is the text/border-safe version,
  which darkens on paper so it can clear AA. Use `--accent-ink` for anything you
  read; use `--accent` only for something you fill.
* **A section that repoints `--accent` must repoint `--accent-ink` too**, the way
  `.pilates` does. Custom properties resolve where they are *defined*, so
  overriding `--accent` alone does not reach `--accent-ink`.

Two surfaces stay dark in both themes on purpose: the image **lightbox** (a
developed photograph needs a dark surround, and the dither-to-colour animation
reads on nothing else) and the **plate captions**. Photo plates get a hard black
frame and an offset shadow in light mode, which also stops the near-white
screenshots dissolving into the paper.

---

## If Something Breaks

**The build refuses to run and lists missing images.** That's on purpose — a
name in `site.json` has no matching pair in `assets/img/`. Either run
`dither.py` for it or fix the spelling.

**A change didn't appear.** You almost certainly edited `index.html` instead of
`content/site.json`, or forgot to run the build. Re-run it — your edit to
`index.html` is already gone, so redo it in `site.json`.

**`json.decoder.JSONDecodeError`.** A typo in `site.json` — usually a missing
comma between blocks, or a trailing comma after the last one. The error message
gives a line number. Paste the file into <https://jsonlint.com> if you get stuck.

**The playlists or Mega Moves vanished after an edit.** A typo in
`fitness/weekly.js`, almost always a missing comma between entries or a
missing quote. The same typo empties quickbio's playlists, since it reads the
same file. Preview the page (Recipe 8) with the browser's console open and it
names the line.

**Everything looks unstyled.** You opened `index.html` from the file system
instead of through `python3 -m http.server`.
