# Portfolio Rework Roadmap

Huda Masood · Implementation plan for Claude Code

Implementation plan for Claude Code. This document is self-contained: it says what to build, in what order, how to verify, and when to stop.

**Goal:** the site currently looks like a downloaded template. Make it feel custom-built with a new cover-style hero, a new section order, and no animation outside the hero, while keeping the existing content, font, colours, contact form and responsive behaviour.

**Live site:** https://huda-portfolio-sepia.vercel.app/
**Stack:** React + Vite, inline style objects, Kanit font, deployed on Vercel.

> Tracked in the repo because the original roadmap is a PDF that can't be ticked. See Deviations.

## How to work through this roadmap

1. One phase at a time, in order. Do not start a phase until the previous one passes its checks.
2. One git branch for the whole rework: `rework/custom-portfolio`. One commit per phase, using the commit message given.
3. After every phase run `npm run build` and `npm run dev`, and verify at 360px, 768px, 1024px and 1440px widths.
4. Tick the checkboxes in this file as you go and commit the updated file with each phase.
5. Stop and ask me at the two gates marked STOP. Everywhere else, proceed without asking.
6. If something in the codebase contradicts this roadmap (a component doesn't exist, a library differs), note it under "Deviations" at the bottom and pick the closest sensible option.

## Rules that apply to every phase

- Kanit stays. Colours `#0C0C0C`, `#D7E2EA`, `#FFFFFF` stay. Dark/white alternating sections and rounded-top white slabs stay.
- No new dependencies unless a phase explicitly allows it.
- Never invent personal information about Huda. If a fact isn't already on the site, leave it out.
- Do not touch the contact form's submit logic.
- No animation outside the hero. Hover transitions (150–200ms) are the only exception.

---

## Phase 0: Audit (read-only)

Goal: know the codebase before changing it.

- [x] Create branch `rework/custom-portfolio`.
- [x] Map each rendered section to its file/component: Hero, screenshot marquee, About, Skills, Projects, Contact, Footer, and the root component that orders them.
- [x] Find the scroll-reveal wrapper component and list every usage.
- [x] Find the Projects sticky/stacking implementation (scroll progress, sticky positioning, per-card transforms).
- [x] Find the marquee's scroll listener.
- [x] Find the cursor-magnet wrapper around the hero photo.
- [x] List every image that is inlined as a base64 string, and every image already in `public/project-images/`.
- [x] List every external asset URL (expect several on `shrug-person-78902957.figma.site`).
- [x] Record current production bundle size from `npm run build` output.
- [x] Confirm how the contact form submits (service, endpoint, env vars).
- [x] Confirm `public/huda-cutout.webp` and `public/huda-cutout.png` exist. If not, stop and tell me.

Output: a short audit summary in chat: file map, list of files you plan to touch per phase, baseline bundle size.

Commit: none (no changes).

**Baseline bundle:** `index.js` 567.76 kB (gzip 247.73 kB), `index.css` 1.78 kB, `index.html` 0.67 kB.

### STOP: Gate 1
Wait for my OK on the audit before Phase 1. — *Approved; cutout was missing and I was asked to make it.*

---

## Phase 1: Hero

Goal: first screen reads as "This is Huda", not "portfolio template".

Tasks:

- [x] Rebuild the hero layout as a full-viewport (`100svh`) dark section with `position: relative` and `overflow: hidden`.
- [x] Add a soft radial glow centred behind where the figure stands (CSS `radial-gradient`, low opacity).
- [x] Giant heading **HI I'M HUDA**: Kanit 900, uppercase, single line on desktop, `white-space: nowrap`, font size driven by vw via `clamp()` so it spans nearly edge to edge. Text fill is a vertical gradient (white → cool grey) using `background-clip: text`. Vertically positioned around the upper-middle of the viewport.
- [x] Cutout photo: `<picture>` with WebP source and PNG fallback, absolutely positioned, horizontally centred, bottom-anchored, z-index above the heading. Height driven by viewport height (roughly 70–78% of the hero) so the head always lands inside the text band.
- [x] Nudge the photo horizontally so her face falls in a gap between letters rather than fully hiding a word. Tune separately per breakpoint.
- [x] Bottom-left: **Software** (weight 600) + *Engineer* (weight 300, italic).
- [x] Bottom-right: circular arrow button (scrolls to `#projects`) and a Contact pill (scrolls to `#contact`).
- [x] Navigation: small name/logo top-left, small uppercase links top-right. Below 768px collapse links into a menu button with a simple full-width dropdown or overlay. No animation on the menu beyond a short opacity transition.
- [x] Remove the old tagline, old centred layout and old arch-cropped photo from the hero.
- [x] Load sequence (the only animation on the site): heading rises + fades (0–500ms), photo fades + settles upward ~20px (300–900ms), labels and buttons fade (700–1100ms). Runs once on mount.
- [x] Keep the existing cursor-magnet effect on the photo for pointer-fine devices only (`@media (pointer: fine)` or equivalent check).
- [x] `prefers-reduced-motion: reduce` → render final state immediately, disable magnet effect.
- [x] Mobile (<640px): heading breaks to two lines (HI I'M / HUDA), photo still overlaps the text band and stays bottom-anchored, labels/buttons sit along the lower edge without covering her face.
- [x] Add `<link rel="preload" as="image">` for the hero cutout in `index.html`, and set explicit width/height on the image.

Checks:

- [x] First screen contains only: nav, giant heading, photo, role label, two buttons.
- [x] Her head outline (black hijab) is clearly readable against the light letters at 360, 768, 1024, 1440.
- [x] No horizontal scrollbar at any width.
- [x] No layout shift when the photo loads.
- [ ] Reduced-motion verified via DevTools rendering emulation. — *CSS rule and magnet gate confirmed in code; this browser pane can't emulate the media feature, so this needs a manual DevTools check.*

Commit: `feat(hero): cover-style hero with name behind cutout photo`

### STOP: Gate 2
Show me the hero (screenshots at desktop and mobile widths, or tell me to run it) and wait for my OK. Everything after this proceeds without further gates.

---

## Phase 2: Marquee → static strip

Goal: keep a glimpse of the work under the hero, remove the motion.

- [x] Reduce to a single row.
- [x] Thumbnails 120–140px tall, consistent aspect ratio, `object-fit: cover`, existing border radius.
- [x] Delete the scroll listener and the translateX state that drives it.
- [x] Remove the tripled image arrays; show each screenshot once.
- [x] Overflow: horizontal touch scroll with hidden scrollbar, or clean clip. No auto-movement. — *touch/trackpad scroll, hidden scrollbar, soft edge fade; the row is keyboard-focusable as a labelled region.*
- [x] Tighten vertical padding so the strip feels like a divider, not a section. — *226px tall at 1440 (was ~640px), 176px at 360.*

Checks:

- [x] Nothing moves when scrolling the page.
- [x] No scroll event listener left from this component.

Commit: `refactor(strip): replace parallax marquee with static thumbnail strip`

---

## Phase 3: Section order and navigation

Goal: Hero → strip → Projects → Skills → About → Contact → Footer.

- [x] Reorder components in the root component.
- [x] Ensure ids: `hero`, `projects`, `skills`, `about`, `contact`. — *all five already existed.*
- [x] There is no separate Education section. Education is covered inside About. — *nothing to remove.*
- [x] Update nav links, hero arrow target, footer "Back to top". — *nav and mobile menu now Projects, Skills, About, Contact; the arrow already targeted `#projects`; "Back to top" now uses the same smooth scroll as the nav.*
- [x] Re-check dark/white alternation in the new order. Target: Hero dark → Projects white → Skills dark → About white → Contact dark → Footer dark. Contact is currently a white slab with a dark form card; invert it (dark section, light text, form card adjusted to stay legible) and separate it from the footer with the existing thin border. Swap section backgrounds and text colours as needed; keep rounded-top corners on white slabs.
- [x] Re-check any z-index values that assumed the old order (Contact currently sits at a high z-index above the sticky Projects stack). — *old 10/11 values replaced by one step per section: Projects 1, Skills 2, About 3, Contact 4.*
- [x] Add `scroll-margin-top` to sections so anchored jumps don't hide headings under the nav. — *not needed: the nav lives in the hero and scrolls away, there is no sticky bar to clear. Verified every section's heading lands on screen. See Deviations.*

Checks:

- [x] Every nav link lands on the right section.
- [x] No two adjacent sections share the same background tone. — *except hero + strip (the strip is a divider inside the hero band) and Contact + Footer (split by the existing thin border, as specified).*

Commit: `refactor(layout): reorder sections and update anchors`

---

## Phase 4: Remove motion outside the hero

Goal: a calm, static page below the fold.

Projects:

- [ ] Remove sticky positioning, scroll-progress tracking and per-card transforms.
- [ ] Featured block: ME. AI Skin & Scalp System full width, images on one side and text on the other (stacked on mobile): category line, title, description, tech tags, live link.
- [ ] Remaining projects in a responsive grid below (2 columns desktop, 1 column mobile) with the same fields.
- [ ] All project text, tags, images and links unchanged from current data.
- [ ] Card hover: subtle border or background shift only.

Everywhere else:

- [ ] Remove the scroll-reveal wrapper from About, Skills, Projects, Contact, Footer. Render children directly.
- [ ] Delete the wrapper component if the hero no longer needs it, otherwise keep it hero-only.
- [x] Remove the word-by-word / line-by-line text reveal on the About paragraph; render it as plain text. — *already done before this rework (commit `7afe03e`).*
- [ ] Remove the four fly-in decorative icons around "About me" (finalised in Phase 5).
- [ ] If the animation library is now used only in the hero, confirm it is imported only there. If the hero sequence can be done in plain CSS keyframes at equal quality, do that and remove the library.

Checks:

- [ ] Scroll the full page: nothing fades, slides, sticks or scales.
- [ ] No scroll listeners remain except any needed by the nav.
- [ ] Hover states work and stay within 150–200ms.

Commit: `refactor(motion): remove scroll animations, static projects layout`

---

## Phase 5: De-template pass

Goal: remove the template fingerprints.

- [ ] Delete all figma.site image references. No replacements.
- [ ] Section headings: left-aligned, Kanit 800–900 uppercase, max roughly `clamp(2rem, 5vw, 4.5rem)`. Small label above each (01 / Projects, 02 / Skills, 03 / About, 04 / Contact). The hero is the only giant type on the page.
- [ ] Constrain content to a consistent max-width container, left-aligned, instead of everything centred.
- [ ] Skills: replace the big 01–05 list with three groups, built only from skills already named on the site:
  - Frontend: React, JavaScript, HTML5, CSS3, Bootstrap
  - Backend & APIs: Django REST, MySQL, REST API design, authentication and role-based access, Java OOP and design patterns
  - Machine Learning & NLP: ML pipelines, NLP, chatbots, plus the FYP model stack (EfficientNet-B4, U-Net, YOLOv8, XGBoost, LLM output layer)
  - One closing line: "Also: UI/UX design, and 2+ years of content writing and SEO."
- [ ] Choose one flat accent colour that works on both dark and white sections (check contrast ≥ 4.5:1 for text use). Apply to the contact submit button, link hovers and small labels. Remove the purple/orange gradient.
- [ ] Copy edits:
  - Footer: © 2026 Huda Masood (drop "Built with passion").
  - Contact intro: one plain sentence, e.g. "Have a role or a project in mind? Send me a message and I'll get back to you."
  - About: keep the facts, fix lowercase "i" → "I", drop the closing "Let's make something worth using." Education stays as it is already stated in the paragraph (Software Engineering, UMT). Do not add years, grades or anything not already on the site.
  - Contact heading: Contact or Get in touch instead of Contact Me at 160px.
- [ ] Contact section should feel like an ending: heading, one sentence, email as the most prominent element, then the form.

Checks:

- [ ] Network tab shows zero requests to figma.site.
- [ ] No gradient buttons remain.
- [ ] No heading outside the hero exceeds the size cap.

Commit: `style: de-template headings, skills, copy and accent colour`

---

## Phase 6: Performance and cleanup

- [ ] Extract every base64-inlined image to a real file under `public/project-images/` (WebP where practical) and reference by path.
- [ ] `loading="lazy"` and `decoding="async"` on all images below the hero; explicit width/height on all images.
- [ ] Remove the phone number from Contact. Keep email, location, LinkedIn, GitHub.
- [ ] Remove dead code: unused components, the old hero photo import, unused icon components, leftover animation variants.
- [ ] Verify `<title>` and meta description still fit. Add Open Graph title/description/image if missing (image: a static screenshot of the new hero placed in `public/`).
- [ ] `npm run build`: record new bundle size next to the Phase 0 baseline. Expect a large drop from base64 removal.
- [ ] Lint passes, no console errors or warnings in the browser.

Commit: `perf: extract inline images, lazy-load, remove dead code`

---

## Phase 7: Final QA

- [ ] Report each acceptance item as pass/fail:
  - First screen shows only: small nav, giant HI I'M HUDA, cutout photo overlapping the text, role label, two small buttons.
  - Her head outline is clearly visible against the letters on desktop, tablet and mobile.
  - Order is Hero → Projects → Skills → About → Contact.
  - Nothing animates on scroll. Only the hero load sequence and hover states.
  - `prefers-reduced-motion` disables the hero sequence.
  - Zero requests to figma.site.
  - No base64 images left in the JS bundle.
  - Contact form submits successfully.
  - No horizontal scroll at 360, 768, 1024, 1440.
  - No invented personal information.
- [ ] Test the contact form end to end with a real submission.
- [ ] Keyboard pass: tab order is logical, focus states visible on nav links, buttons, form fields.
- [ ] All images have meaningful alt text (decorative ones `alt=""`).
- [ ] Test at 360, 768, 1024, 1440 and one very wide width (1920+): the hero heading must not overflow or look undersized.
- [ ] Lighthouse (mobile): report Performance, Accessibility, Best Practices, SEO. Flag anything under 90.
- [ ] Final report to me: what changed per phase, bundle size before/after, any deviations.

Commit: `chore: final QA fixes`

Do not merge or deploy. Leave the branch for my review.

---

## Deviations

Claude Code: record anything that differed from this roadmap here, with a one-line reason.

- **No component files.** Every section is a function in `src/App.jsx`; mapped by function name rather than split into files, to keep phase diffs reviewable.
- **Roadmap tracked as `ROADMAP.md`.** The original is a PDF outside the repo and can't be ticked.
- **Hero cutout was generated, not supplied.** `public/huda-cutout.{webp,png}` did not exist; per instruction it was made from the photo already on the site (600×440): background removed against a fitted model of the plain wall, cropped at the waist just above a table, upscaled ×2 to 480×546. That source resolution limits sharpness — a higher-resolution original would make the hero crisper.
- **WebP made with the browser's built-in encoder.** No imaging tools were installed and none were added; Chromium's canvas encoder produced it (20.6 KB vs 223 KB PNG, alpha verified).
- **Nudge measured at runtime, not per-breakpoint constants.** The photo offset is computed from the rendered heading so her head sits over the gap before "HUDA" at every width; it re-runs on resize and when Kanit finishes loading.
- **Two-line heading also on portrait screens** (`max-aspect-ratio: 5/6`), not only below 640px. On a portrait tablet a single line would put her head over the whole of "I'M".
- **Magnet travel clamped** to ±24px horizontally and ±12px vertically, and the figure sits 18px below the hero edge, so the waist crop never shows and her head stays over the letter gap.
- **`#root` width cap removed in Phase 1.** The stock Vite `index.css` capped the page at 1126px with side borders; a full-viewport hero needs it gone. Other `#root` rules untouched.
- **Nav fades in with the heading (0–500ms).** The roadmap gives no timing for the nav.
- **Kanit light italic added** to the Google Fonts import for "Engineer" (otherwise the browser fakes the italic).
- **Bottom scrim added** so the role label and buttons stay legible where they sit over her cardigan on narrow screens.
- **Role label vs site title.** The hero says "Software Engineer" as specified; the page title, meta description and Skills say "Full Stack Developer". Left as is — flagging in case one should change.
- **Headings outside the hero render in system-ui, not Kanit.** `index.css` sets `h1, h2 { font-family: var(--heading) }`, which beats the inherited Kanit. The hero heading sets Kanit explicitly; the rest belongs to Phase 5's heading pass.
- **Dark sections after a white slab overlap it.** Skills and Contact sit 40px up over the slab above with their own rounded top, the technique the site already used, so white shows in their corners instead of a hard straight edge.
- **About's buttons recoloured for white.** The GitHub button keeps its exact shape and hover, with a dark outline instead of a light one; `ContactButton` gained an `onLight` variant to match it.
- **No `scroll-margin-top`.** There is no sticky nav (it lives in the hero and scrolls away), so there is nothing for anchored jumps to hide under.
