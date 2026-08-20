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

`index.html` links `styles.css?v=N` and `main.js?v=N`, and `_headers` sets both
to revalidate. Two layers, because unhashed asset names plus a CDN are easy to
get wrong.

**Bump `N` in both tags whenever styles.css or main.js changes.** Skipping this
can ship new HTML against a stale stylesheet, which looks like broken CSS.

When testing whether a cache header took effect, always append a throwaway query
string (`?x=1`). Without it you are reading Cloudflare edge cache, not the new
deploy, and will draw the wrong conclusion.
