# Where things stand

Last updated: 2026-08-20

## Live

The site is launched and serving real traffic.

| Thing | Where | State |
|---|---|---|
| Site | https://jbthepm.com | Live |
| www | https://www.jbthepm.com | Live |
| Code | github.com/jbthepm/jbthepm.com | `main` |
| Hosting | Cloudflare Pages, project `jbthepm` | Auto-deploys on every push to `main` |
| Domain | Cloudflare Registrar + Cloudflare DNS | Verified |

## Working

- **Contact form** — posts to `/api/contact`, sends through Resend, lands in
  `jbthepm@gmail.com`. Sender is `website@jbthepm.com` on the verified domain.
  Replies go to the person who filled out the form, not to the sender address.
  Tested end to end against production.
- **Google Search Console** — domain ownership verified through Cloudflare,
  `https://jbthepm.com/sitemap.xml` submitted. Indexing takes days to weeks;
  nothing to do but check back.
- **Mobile menu** — below 720px the header CTA becomes a hamburger that opens a
  right-to-left sheet with all nav options plus both CTAs. Closes on the X,
  the backdrop, Escape, or any link tap.

## Done this round

- Re-cropped the headshot wider from the original photo (head and chest, not
  just head). Source stays local, gitignored, not published.
- Real logo in the header and as the browser tab icon.
- Calendly and LinkedIn URLs wired up; no `REPLACE-ME` placeholders left.
- Contact address changed everywhere to `jbthepm@gmail.com`.
- Em dashes removed from all visible copy and `llms.txt`, rewritten sentence by
  sentence rather than swapped for hyphens.
- Copy moved to first person where it reads as JB speaking. "JB the PM" stays
  as the brand name in the title, footer, and structured data.
- DoorCheck reframed as a national point solution, not Texas-only.
- Skill pills rebuilt as a set of 10, synced into the `knowsAbout` schema.
- Lucide icons on the four service cards.
- Cache handling reworked: `styles.css` and `main.js` carry a `?v=` query string,
  and `/assets/*` dropped from a one-year `immutable` cache to a week after a
  cached 404 broke the share card.

## To do

### Recommended: case studies

The three project cards are one paragraph each. That is enough to prove the
work exists, not enough to win a deal. A buyer deciding between JB and an
agency wants to see how the thinking went.

Worth building a real page per project (`/work/schoolcheck`, `/work/doorcheck`,
`/work/yelloball`), each covering:

- the problem the client actually had, in their words
- what was considered and what was ruled out, and why
- what shipped, with screenshots
- what changed as a result

This is also the highest-leverage move for Answer Search Optimization. One page
per project gives AI assistants and search engines something specific to quote
when someone asks about K-12 safety compliance software or door audit tracking.
The single-page site currently gives them one paragraph.

If all three is too much at once, SchoolCheck first: it is the current product
and the strongest story.

Each new page needs a `<url>` block added to `sitemap.xml`.

### Smaller items

- [ ] Add LinkedIn to the `sameAs` field in the Person JSON-LD. The footer links
      to it, but the structured data does not, so search engines are not
      connecting the profile to the person.
- [ ] `assets/jb-headshot@1x.jpg` exists but nothing references it. Either wire
      it up as a `srcset` for small screens or delete it.
- [ ] Check Search Console in a week or two to confirm the site is indexed.

## Gotchas worth remembering

- **Cache** - `styles.css` and `main.js` are pinned by Pages to a 4-hour browser
  cache; `_headers` cannot lower it (tested: directory wildcards like
  `/assets/*` are honoured, exact paths and extension globs are not). The `?v=N`
  query string in `index.html` is what actually busts it - bump it whenever
  either file changes. If a change looks like it did not deploy, hard refresh
  (Ctrl+Shift+R) before assuming the code is wrong.
- **Cached 404s** - `/assets/*` had a one-year `immutable` cache, so a request
  to an asset path *before* the file was deployed cached the 404 for a year.
  That is why the share card needed a manual purge. Now capped at a week.
  Never request a new asset URL before the deploy that creates it has landed.
- **Keep three things in sync** when the offering changes: the `#faq` section in
  `index.html`, the `FAQPage` JSON-LD at the bottom of the same file, and
  `llms.txt`.
- **The profile repo** — `github.com/jbthepm/jbthepm` is a separate, special
  repo that builds the GitHub profile page. It is not this site. Left alone.
