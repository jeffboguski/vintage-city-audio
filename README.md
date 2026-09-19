# Vintage City Audio — Website

A simple static site: plain HTML/CSS/vanilla JS, no build step, no framework.
Same shape as your jeffboguski.com setup — this is meant to live in its own
GitHub repo and deploy via GitHub Pages.

## What's here

```
index.html          Landing page
inventory.html       Full inventory grid (filterable by category)
item.html            Gear detail page (reads ?id=... and looks it up in data/inventory.json)
about.html           About + Contact
css/style.css         All styling
js/app.js             All page logic (loads inventory.json, renders cards/detail, mobile nav)
data/inventory.json   Your gear — this is the file you edit to add/remove/update listings
assets/img/           Photos go here (referenced from inventory.json)
assets/audio/         Sound demo clips go here (referenced from inventory.json)
CNAME                 Already set to vintagecityaudio.com for GitHub Pages custom domain
.nojekyll             Tells GitHub Pages to serve files as-is
```

## Adding or editing gear (no code required)

Everything for-sale lives in `data/inventory.json` as a list of items. To add
a new piece, copy one of the existing entries and edit the fields:

```json
{
  "id": "unique-url-safe-slug",
  "title": "1968 Marshall JMP Superlead",
  "category": "Amps",
  "year": 1968,
  "make": "Marshall",
  "model": "JMP Superlead 100W",
  "price": 4500,
  "status": "For Sale",       // or "Sold" / "Pending"
  "condition": "Good — recent recap",
  "location": "Brooklyn, NY",
  "summary": "One-line teaser shown on the inventory card.",
  "description": "Longer write-up shown on the detail page. Use \\n\\n for paragraph breaks.",
  "specs": {
    "Any Label You Want": "Any value",
    "Tube Complement": "4x EL34, 3x 12AX7"
  },
  "images": ["assets/img/jmp-superlead-1.jpg"],
  "soundDemo": "assets/audio/jmp-superlead-clip.mp3",
  "externalListing": { "platform": "Reverb", "url": "https://reverb.com/..." }
}
```

- Leave `"images": []` and it'll show a simple icon placeholder instead of a broken photo.
- Leave `"soundDemo": null` and the detail page shows "no demo yet" instead of a broken player.
- `category` drives the filter buttons on the Inventory page automatically — use whatever categories you want (Amps, Guitars, Effects, etc.), no other code changes needed.
- `externalListing` is optional — use it to link out to the same item on Reverb/Facebook Marketplace/Craigslist.

The two guitars currently in the file (the Dean Korina Flying V and the
Fender Korina Offset Tele) were pulled from your for-sale tracker and their
Facebook Marketplace listings — double check the details and swap in real
photos before this goes live.

## Testing locally before you push

Opening `index.html` directly by double-clicking it won't fully work — browsers
block the `fetch()` call that loads `inventory.json` from a local file. Run a
tiny local server from inside the project folder instead:

```bash
# Python (usually already installed on Mac):
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```

## Publishing (same flow as jeffboguski.com)

1. Create a new **public** repo on GitHub — e.g. `vintage-city-audio`. Don't
   initialize it with a README (you already have one here).
2. From inside this folder:
   ```bash
   git init
   git add .
   git commit -m "Initial Vintage City Audio site"
   git branch -M main
   git remote add origin https://github.com/<your-username>/vintage-city-audio.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages** → under "Build and deployment", set
   **Source** to "Deploy from a branch", branch `main`, folder `/ (root)`. Save.
4. Still on that same Pages settings screen, under **Custom domain**, enter
   `vintagecityaudio.com` and save (the `CNAME` file already in this repo
   does this automatically too, but setting it in the UI confirms it and
   turns on the "Enforce HTTPS" option once DNS is verified).
5. At your domain registrar for vintagecityaudio.com, add these DNS records
   (standard GitHub Pages apex-domain setup):
   - Four **A** records for `@` pointing to:
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - One **CNAME** record for `www` pointing to `<your-username>.github.io`
6. DNS can take anywhere from a few minutes to ~24 hours to propagate. Once
   it resolves, go back to Settings → Pages and check "Enforce HTTPS."

From then on, updating the site is just: edit files (most often
`data/inventory.json`), then `git add . && git commit -m "..." && git push`.
GitHub Pages redeploys automatically within a minute or two.

## Contact address

`js/app.js` currently sends "Message About This Piece" and "Email VCA"
buttons to `jeffboguski@gmail.com`. If you set up a dedicated address
(e.g. `hello@vintagecityaudio.com`), update the `CONTACT_EMAIL` constant
near the top of `js/app.js` — every contact link on the site reads from
that one spot.
