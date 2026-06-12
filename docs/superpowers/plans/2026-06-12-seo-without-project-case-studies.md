# SEO Without Project Case Studies Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve SEO using buyer-intent content while client project descriptions are unavailable.

**Architecture:** Keep the static site structure. Add reusable CSS for buyer-fit and sector-proof sections, then place those sections on the product hub and detail pages.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, Node.js QA script, GitHub Pages.

---

### Task 1: Add reusable styles

**Files:**
- Modify: `styles.css`

- [ ] Add `.fit-guide`, `.fit-guide-grid`, `.fit-card-grid`, `.fit-card`, `.sector-proof`, `.sector-proof-grid`, and `.sector-tags` styles.
- [ ] Add responsive rules for those grids under the existing mobile media block.

### Task 2: Add buyer-fit sections

**Files:**
- Modify: all product detail HTML pages listed in the design spec.

- [ ] Insert a "Best-fit requirements" section after the product scope on every product detail page.
- [ ] Keep copy specific to the category and avoid promises about availability, delivery time, authorization or project outcomes.

### Task 3: Add sector-proof sections

**Files:**
- Modify: `products.html` and all product detail HTML pages listed in the design spec.

- [ ] Insert sector relevance language above the final CTA or related-products section.
- [ ] Use approved customer sector context without claiming named projects.

### Task 4: Tighten SEO support files

**Files:**
- Modify: `index.html`, all product pages, `source-notes.md`

- [ ] Make project-reference wording safer on the homepage.
- [ ] Update meta descriptions where the new buyer-intent language improves clarity.
- [ ] Bump `styles.css` cache query to `20260612`.
- [ ] Document this pass in `source-notes.md`.

### Task 5: Verify and ship

**Files:**
- Validate: full repository

- [ ] Run `npm run test:site`.
- [ ] Run `git diff --check`.
- [ ] Preview at desktop and mobile widths.
- [ ] Commit and push to `main`.
