# jbthepm.com

Landing page for JB de la Garza — digital product consulting.

**Stack:** plain HTML, CSS, and JavaScript. No build step, no framework, no
`npm install` required to edit or preview. Deployed to Cloudflare Pages, with
one Pages Function handling the contact form.

Why no framework: the whole point of this site is Answer Search Optimization —
AI assistants and search crawlers read raw HTML. Static files are the most
reliable way to guarantee that, and it means you can open `index.html` and edit
a sentence without a toolchain in the way.

---

## Files

```
jbthepm/
├── index.html              ← all page content + JSON-LD structured data
├── styles.css              ← design system + spatial UI (commented by section)
├── main.js                 ← tilt, parallax, reveal, form submit (motion only)
├── assets/
│   ├── jb-headshot.jpg     ← 900×900 square crop
│   └── jb-headshot@1x.jpg  ← 450×450 (spare, not yet wired up)
├── functions/
│   └── api/
│       └── contact.js      ← Cloudflare Pages Function → POST /api/contact
├── robots.txt              ← explicitly allows AI crawlers
├── sitemap.xml
├── llms.txt                ← plain-text summary for AI assistants
├── _headers                ← security + caching headers for Cloudflare
└── .gitignore
```

---

## Run it locally

Fastest, no dependencies:

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

That serves the static site but **not** the `/api/contact` function. To test
the form too:

```bash
npx wrangler pages dev .
# open the URL it prints (usually http://localhost:8788)
```

For local form testing, create a `.dev.vars` file (already gitignored):

```
RESEND_API_KEY=re_xxxxxxxxxxxx
CONTACT_TO=jbthepm@gmail.com
CONTACT_FROM=website@jbthepm.com
```

---

## Deploy to Cloudflare Pages

1. Push this folder to a GitHub repo.
2. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git**, pick the repo.
3. Build settings:
   - Framework preset: **None**
   - Build command: *(leave empty)*
   - Build output directory: `/`
4. Deploy. Then **Custom domains** → add `jbthepm.com`.

Every push to `main` redeploys automatically.

### Contact form setup

The form posts to `/api/contact`, which sends mail via [Resend](https://resend.com).
(Older Cloudflare tutorials point at MailChannels — its free Workers tier was
retired, which is why this uses Resend instead.)

1. Sign up at resend.com, verify the domain `jbthepm.com`.
2. Create an API key.
3. Cloudflare → Pages → your project → **Settings → Environment variables**,
   add these as **encrypted**:

   | Name             | Value                        |
   |------------------|------------------------------|
   | `RESEND_API_KEY` | `re_...`                     |
   | `CONTACT_TO`     | `jbthepm@gmail.com`             |
   | `CONTACT_FROM`   | `website@jbthepm.com`        |

4. Redeploy.

Until `RESEND_API_KEY` is set, the form returns a clean "not connected yet"
message rather than failing silently.

---

## TODO before launch

Launch checklist:

- [x] Calendly URL wired up
- [x] LinkedIn URL wired up
- [x] Contact email set to `jbthepm@gmail.com`
- [x] Resend + the three environment variables set up and tested
- [x] Google Search Console verified and `sitemap.xml` submitted

---

## Editing rules (important)

This site is built for **Answer Search Optimization** — getting quoted by
ChatGPT, Perplexity, Claude, and Google AI Overviews. Three rules keep that
working:

1. **All claims live in HTML text.** Never move copy into JavaScript, canvas,
   or an image. Crawlers see none of those.
2. **Answers first, decoration second.** Each section opens with a plain
   declarative sentence that reads correctly when quoted out of context — use
   full names ("JB de la Garza is…"), not pronouns.
3. **Keep three things in sync** when the offering changes:
   - the `#faq` section in `index.html`
   - the `FAQPage` JSON-LD at the bottom of `index.html`
   - `llms.txt`

Validate structured data after any edit:
https://search.google.com/test/rich-results

---

## Design notes

Direction: **light base, soft depth** (spatial UI).

Depth is built from four layers, all documented inline in `styles.css`:

1. **Elevation ladder** — `--e1` through `--e4`, a consistent shadow scale.
   Use a token; don't hand-write shadows.
2. **Perspective containers** — `.hero__inner`, `.grid`, `.about` set
   `perspective`; children use `translateZ` so they sit *above* the page.
3. **Ambient orbs + grain** — blurred colour fields behind everything,
   drifting on scroll. Marked `aria-hidden`, purely decorative.
4. **Pointer tilt** — `[data-tilt]` elements rotate up to 5° toward the
   cursor. `main.js` only sets `--tiltX` / `--tiltY`; the transform lives
   in CSS.

All motion is disabled under `prefers-reduced-motion: reduce`, and tilt is
skipped entirely on touch devices.

Tokens live at the top of `styles.css` under `:root` — change the accent
colour there and it propagates everywhere.
