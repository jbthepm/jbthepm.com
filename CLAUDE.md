# jbthepm.com

Personal portfolio site for JB de la Garza. Static HTML/CSS/JS, no build step.
Deployed to Cloudflare Pages. See README.md for stack and deploy details.

## How to respond to JB

1. Keep responses under 500 characters unless more is genuinely required.
2. Explain like JB is a total beginner. Plain words, no jargon.
3. Ask only ONE question per response.
4. Do not explain your reasoning or lay out options unless asked.

Answer, then ask at most one question. Cut preamble, caveats, and background.

## Cache-busting (important)

`index.html` links `styles.css?v=N` and `main.js?v=N`. Cloudflare Pages pins
static assets to a 4-hour browser cache and ignores any `Cache-Control` set in
`_headers`, so the query string is the only thing that forces browsers to pick
up changes.

**Bump `N` in both tags whenever styles.css or main.js changes.** Skipping this
ships new HTML against a stale stylesheet, which looks like broken CSS.
