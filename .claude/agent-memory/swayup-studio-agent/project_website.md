---
name: SwayUp Studio website build
description: Complete website built — 13 HTML pages, CSS, JS. Tech stack, file paths, and key design decisions.
type: project
---

Complete website built in PUBLIC/ folder (April 2025).

**Files created:**
- `css/style.css` — 1200+ lines, complete design system
- `js/main.js` — GSAP + IntersectionObserver animations, FAQ, forms, navbar, filters
- `index.html` — Homepage (hero, banderole, services, kit, FAQ, reviews, CTA)
- `kit-gratuit.html` — Kit page with 5-step timeline + 10-field form
- `contact.html` — Contact form (POST to webhook placeholder)
- `galerie.html` — Portfolio page (Sanity injection via js/sanity.js)
- `blog.html` — Blog page (Sanity injection)
- `referencement-geo.html` — KEY PAGE: GEO service, rich GEO content
- `referencement-seo.html`, `site-vitrine.html`, `site-dynamique.html`, `site-ecommerce.html`
- `graphisme.html`, `logo.html`, `support-catalogue.html`

**Why:** First full build from scratch per user brief. No CMS framework — vanilla HTML/CSS/JS.

**How to apply:** When editing any page, always maintain the blueprint-bg grid aesthetic, use the existing CSS custom properties (--orange, --noir, --fond), and keep the reveal/IntersectionObserver pattern for scroll animations. GSAP is loaded from local js/gsap.min.js. Sanity auto-loads on pages with #portfolio-grid or #blog-grid.

**Key design decisions:**
- Blueprint grid done in CSS (background-image repeating linear-gradient) + canvas animation in JS
- Navbar dropdown uses CSS opacity/visibility transitions + JS class toggle
- Form submission uses fetch with mode:no-cors to webhook placeholder URLs
- Reveal animations: CSS transitions + IntersectionObserver (GSAP ScrollTrigger not assumed available in local gsap.min.js)
- Sanity content replaces placeholder cards when loaded
