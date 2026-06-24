# Home Organizers Long Island

Marketing website for **Home Organizers Long Island** — a judgment-free home organizing & decluttering service for busy homeowners across Nassau & Suffolk Counties.

🔗 **Live site:** [homeorganizersli.com](https://homeorganizersli.com/)

> Calm, organized homes without the judgment. From overflowing closets to chaotic garages, we turn chaos into calm.

---

## Overview

A fast, lightweight, SEO-optimized static marketing site built with plain **HTML, CSS, and JavaScript** — no build step, no framework, no dependencies to install. It ships self-hosted fonts and lazy-loaded imagery, and uses [GSAP](https://gsap.com/) (via CDN) for scroll-triggered animations and the hero stat counters.

## Tech stack

- **HTML5** — semantic, accessible markup
- **CSS3** — custom properties, responsive layout, no framework (`styles.css`)
- **Vanilla JavaScript** — interactive components, no bundler (`script.js`)
- **GSAP + ScrollTrigger** — scroll reveals and animated counters (loaded from CDN)
- **Self-hosted fonts** — Sora & Overpass (`.woff2`)
- **SEO** — per-page meta tags, Open Graph / Twitter cards, JSON-LD `LocalBusiness` structured data, `sitemap.xml`, and `robots.txt`

## Interactive features (`script.js`)

- Mobile nav toggle with keyboard (Esc) and resize handling
- Auto-playing testimonial carousel with dots + prev/next controls
- Draggable before/after image comparison sliders (pointer + touch)
- Animated hero stat counters and on-scroll reveal animations
- Respects `prefers-reduced-motion`

## Project structure

```
.
├── index.html                              # Home page
├── home-organizer-nassau-county.html       # Nassau County landing page
├── home-organizer-suffolk-county.html      # Suffolk County landing page
├── decluttering-long-island.html           # Service: decluttering
├── space-optimization-long-island.html     # Service: space optimization
├── room-resets-long-island.html            # Service: room resets
├── privacy.html                            # Privacy policy
├── thank-you.html                          # Form submission confirmation
├── styles.css                              # Site styles
├── script.js                               # Site interactions
├── sitemap.xml                             # SEO sitemap
├── robots.txt                              # Crawler directives
└── assets/
    ├── images/                             # Photos, gallery, before/after, logos
    └── fonts/                              # Self-hosted Sora & Overpass (.woff2)
```

## Pages

| Page | Purpose |
| --- | --- |
| `index.html` | Home — hero, services, gallery, testimonials, contact |
| `home-organizer-nassau-county.html` | Local SEO landing page for Nassau County |
| `home-organizer-suffolk-county.html` | Local SEO landing page for Suffolk County |
| `decluttering-long-island.html` | Decluttering service detail |
| `space-optimization-long-island.html` | Space optimization service detail |
| `room-resets-long-island.html` | Room reset service detail |
| `privacy.html` | Privacy policy |
| `thank-you.html` | Post-form thank-you page |

## Local development

No build step is required. Either open `index.html` directly in a browser, or serve the folder locally to keep relative paths and SEO files working as expected:

```bash
# Python 3
python3 -m http.server 8000

# or Node
npx serve .
```

Then visit `http://localhost:8000`.

## Deployment

The site is fully static, so it can be deployed to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3, etc.). Just publish the repository root. The canonical domain is [homeorganizersli.com](https://homeorganizersli.com/); remember to keep `sitemap.xml` and `robots.txt` pointed at the production domain.

## License

All rights reserved. © Home Organizers Long Island.
