# Home Organizers Long Island

Marketing website for **Home Organizers Long Island** — a judgment-free home organizing & decluttering service for busy homeowners across Long Island, NYC & beyond.

🔗 **Live site:** [homeorganizersli.com](https://homeorganizersli.com/)

> Calm, organized homes without the judgment. From overflowing closets to chaotic garages, we turn chaos into calm.

---

## Overview

A fast, lightweight, SEO-optimized static marketing site built with plain **HTML, CSS, and JavaScript** — no build step, no framework, no dependencies to install. It ships self-hosted fonts and lazy-loaded imagery, and uses [GSAP](https://gsap.com/) (via CDN) for scroll-triggered animations and the hero stat counters.

## Tech stack

- **HTML5** — semantic, accessible markup
- **CSS3** — custom properties, responsive layout, no framework (`styles.css`, `contact-form.css`)
- **Vanilla JavaScript** — no bundler (`script.js`, `contact-form.js`, `location-autocomplete.js`, `analytics.js`)
- **GSAP + ScrollTrigger** — scroll reveals and animated counters (loaded from CDN)
- **Self-hosted fonts** — Sora & Overpass (`.woff2`)
- **Images** — WebP for every photo in use (EXIF rotation baked in), 1200×630 JPEGs for Open Graph
- **SEO** — per-page meta tags, Open Graph / Twitter cards, JSON-LD (`ProfessionalService`, `Service`, `BreadcrumbList`, `FAQPage`), `sitemap.xml`, `robots.txt`, IndexNow
- **Hosting & forms** — Netlify (static deploy via CLI, Netlify Forms)
- **Analytics** — GA4 + Microsoft Clarity behind a consent banner

Marketing context — what was changed and why, the measurement setup, Instagram strategy and next steps — lives in [`docs/growth-playbook.md`](docs/growth-playbook.md). Search Console keyword data: [`keywords.md`](keywords.md).

## Interactive features

`script.js`
- Mobile nav overlay with keyboard (Esc) and resize handling
- Before/after gallery carousel; drag-to-compare handle on phones, also used on service pages
- Eased in-page anchor scrolling (ignores trackpad inertia for 350 ms, re-measures the target at the end)
- GSAP hero entrance, stat counters and scroll reveals; anything already on screen is revealed on load / hashchange (arriving on `#contact` from another page)
- Respects `prefers-reduced-motion`

`contact-form.js` — the contact form (home `#contact` section and the `#contactModal` dialog on service/area pages)
- 3-step quiz: space → town/ZIP + timeline → name, preferred contact (Text / Call / Email), up to 3 photos, message
- Progressive enhancement: without JS the whole form shows on one page and posts to `thank-you.html`
- Any link with `data-open-contact="<need>"` opens the modal with that space preselected
- Posts to Netlify Forms as multipart; each photo goes in its own field (`photo`, `photo2`, `photo3`) because Netlify keeps one file per input

`location-autocomplete.js` — town/ZIP suggestions for all of New York State from `assets/data/ny-places.v1.json` (GeoNames, CC BY 4.0 — credited on `privacy.html`). Long Island first, then NYC, then upstate; free text always accepted; ARIA combobox.

`analytics.js` — consent banner, GA4 (`G-E7NLV3QNG0`, Consent Mode v2) and Clarity (`z4kt20itio`, only after consent). `window.hoTrack(name, params, done)` sends an event to GA4 and mirrors it into Clarity as a smart event + tags. Events: `cta_click`, `view_contact_form`, `form_start`, `form_step`, `contact_modal_open`, `generate_lead`, `contact_phone`, `contact_email`, `instagram_click`. Never send names, emails, phones or towns. Add `?debug=1` to any URL to log events.

## Project structure

```
.
├── index.html                              # Home page
├── home-organizer-nassau-county.html       # Area: Nassau County (+ Hempstead / Massapequa)
├── home-organizer-suffolk-county.html      # Area: Suffolk County
├── home-organizer-hamptons.html            # Area: the Hamptons (summer homes)
├── closet-organizing-long-island.html      # Service: closets
├── decluttering-long-island.html           # Service: decluttering & downsizing
├── space-optimization-long-island.html     # Service: space optimization
├── room-resets-long-island.html            # Service: room resets
├── privacy.html                            # Privacy policy
├── thank-you.html                          # No-JS form confirmation (noindex)
├── digital-workspace-section.html          # Preview harness (noindex, disallowed)
├── styles.css · script.js                  # Site styles and interactions
├── contact-form.css · contact-form.js      # Contact quiz + modal
├── location-autocomplete.js                # Town / ZIP suggestions
├── analytics.js                            # Consent, GA4, Clarity, event tracking
├── netlify.toml                            # Redirects, headers, caching
├── sitemap.xml · robots.txt                # Crawler files
├── <32 hex>.txt                            # IndexNow key (must stay public)
├── keywords.md                             # GSC keyword map (404 on the live site)
├── docs/                                   # Marketing docs (404 on the live site)
├── scripts/indexnow.sh                     # Notify IndexNow engines (404 on the live site)
└── assets/
    ├── images/                             # WebP photos, OG images, logos (camera originals kept)
    ├── data/ny-places.v1.json              # NY towns and ZIPs for the autocomplete
    └── fonts/                              # Self-hosted Sora & Overpass (.woff2)
```

## Local development

No build step is required. Serve the folder locally to keep relative paths and SEO files working:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`. Note that GA4 is configured on localhost too — test with `?debug=1` and stub `window.gtag` / `window.clarity` if you don't want test events in the real properties.

## Deployment

Netlify, deployed from this folder with the CLI (the site is not connected to GitHub):

```bash
netlify deploy --prod --dir .
```

- **Cache busting:** CSS/JS are cached for an hour without content hashes. When you change one, bump its `?v=` in every HTML page that loads it.
- **Forms:** Netlify detects the `contact` form at deploy time from the static HTML; new fields must exist in the markup. Notifications go to the addresses set in Netlify → Forms.
- **After adding or changing pages:** run `scripts/indexnow.sh` (Bing and other IndexNow engines; submits every URL in `sitemap.xml`, or only the URLs you pass) and request indexing in Google Search Console (Google does not use IndexNow).
- **iCloud duplicates:** the folder lives in Documents and iCloud sometimes leaves `file 2.ext` copies. Stage files by name rather than `git add -A`.

## License

All rights reserved. © Home Organizers Long Island.
