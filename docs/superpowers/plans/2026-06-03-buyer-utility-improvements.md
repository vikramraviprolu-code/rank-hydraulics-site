# Buyer Utility Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved trust-led buyer utility pass for Rank Hydraulics, improving buyer trust, enquiry conversion, and search visibility without inventing client claims.

**Architecture:** Keep the site as a static HTML/CSS/JS project with no build step. Add reusable visual patterns in `styles.css`, page-level content modules in existing HTML files, category-specific WhatsApp/form routing, visible FAQ content, JSON-LD FAQ schema where visible FAQs exist, and a small Node QA script to protect links, assets, sitemap entries, and WhatsApp messages.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, Node.js standard library for QA, GitHub Pages hosting.

---

## Source Spec

Implement from: `docs/superpowers/specs/2026-06-03-peer-benchmark-buyer-utility-design.md`

## Scope Check

The spec is one coherent static-site improvement pass. It does not need to be split into separate plans because all work touches the same public site, shared styling, shared conversion paths, and sitemap/SEO metadata.

## File Structure

Create:

- `tools/site-qa.mjs` - local static QA script for asset references, internal links, sitemap coverage, forms, and WhatsApp messages.

Modify:

- `package.json` - add `test:site` script.
- `styles.css` - add trust anchor, product finder, FAQ, proof helper, and responsive rules.
- `index.html` - add homepage trust anchor and requirement router; adjust CTAs and customer proof copy.
- `products.html` - add product finder/routing section and strengthen buyer-question content.
- `hydraulic-hose-assemblies.html` - category-specific WhatsApp, quote helper enrichment, FAQ section, FAQ schema.
- `stauff-hydraulic-components.html` - category-specific WhatsApp, quote helper enrichment, FAQ section, FAQ schema.
- `power-transmission-belts.html` - category-specific WhatsApp, quote helper enrichment, FAQ section, FAQ schema.
- `groz-tools.html` - category-specific WhatsApp, quote helper enrichment, FAQ section, FAQ schema.
- `veedol-lubricants.html` - category-specific WhatsApp, quote helper enrichment, FAQ section, FAQ schema.
- `industrial-coatings-welding.html` - category-specific WhatsApp, quote helper enrichment, FAQ section, FAQ schema.
- `project-vmi-supply.html` - category-specific WhatsApp, quote helper enrichment, FAQ section, FAQ schema.
- `landing.html` - align quote form requirement choices with the product finder.
- `thanks.html` - make post-submit follow-up clearer and add WhatsApp follow-up CTA.
- `sitemap.xml` - update `lastmod` after content changes.
- `source-notes.md` - document buyer utility pass and guardrails.

Do not create a framework, build pipeline, CMS, backend form handler, or downloadable catalogue in this pass.

---

### Task 1: Add Static QA Script

**Files:**
- Create: `tools/site-qa.mjs`
- Modify: `package.json`

- [ ] **Step 1: Create the `tools` directory**

Run:

```bash
mkdir -p tools
```

Expected: command exits with code 0.

- [ ] **Step 2: Add `tools/site-qa.mjs`**

Create `tools/site-qa.mjs` with this complete content:

```js
#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";

const root = process.cwd();
const ignoredHtmlFiles = new Set(["brand-concepts.html"]);
const htmlFiles = readdirSync(root)
  .filter((file) => file.endsWith(".html") && !ignoredHtmlFiles.has(file))
  .sort();
const failures = [];

const localSchemes = /^(#|mailto:|tel:|https:\/\/wa\.me\/|https:\/\/formsubmit\.co\/|https:\/\/rankhydraulics\.com\/|https?:\/\/)/;
const assetExtensions = new Set([".css", ".js", ".png", ".jpg", ".jpeg", ".webp", ".svg", ".ico", ".ttf"]);

function fail(message) {
  failures.push(message);
}

function read(file) {
  return readFileSync(join(root, file), "utf8");
}

function localPathFromUrl(value) {
  if (value.startsWith("https://rankhydraulics.com/")) {
    return value.replace("https://rankhydraulics.com/", "");
  }
  return value.split("#")[0].split("?")[0];
}

for (const file of htmlFiles) {
  const html = read(file);
  const editorialMarkers = ["T" + "BD", "TO" + "DO", "lorem ipsum"];

  if (editorialMarkers.some((marker) => html.includes(marker))) {
    fail(`${file}: contains unfinished editorial marker`);
  }

  for (const match of html.matchAll(/\b(?:src|href)=["']([^"']+)["']/g)) {
    const value = match[1];
    const localPath = localPathFromUrl(value);

    if (value.startsWith("https://wa.me/")) {
      const url = new URL(value);
      if (!url.pathname.includes("919849021685")) fail(`${file}: WhatsApp link missing expected phone number`);
      if (!url.searchParams.get("text")) fail(`${file}: WhatsApp link missing prefilled text`);
      continue;
    }

    if (value.startsWith("mailto:") || value.startsWith("tel:") || value.startsWith("https://formsubmit.co/")) {
      continue;
    }

    if (value.startsWith("http://") || value.startsWith("https://")) {
      continue;
    }

    if (value.startsWith("#")) {
      continue;
    }

    if (localPath.endsWith(".html")) {
      if (!existsSync(join(root, localPath))) fail(`${file}: linked HTML missing: ${value}`);
      continue;
    }

    if (assetExtensions.has(extname(localPath))) {
      if (!existsSync(join(root, localPath))) fail(`${file}: referenced asset missing: ${value}`);
    }
  }

  const formsubmitForms = [...html.matchAll(/<form\b[^>]*action=["']https:\/\/formsubmit\.co\/[^"']+["'][^>]*>/g)];
  for (const formMatch of formsubmitForms) {
    const formStart = formMatch.index || 0;
    const formEnd = html.indexOf("</form>", formStart);
    const formHtml = html.slice(formStart, formEnd > formStart ? formEnd : html.length);
    if (!formHtml.includes('name="_next"')) fail(`${file}: FormSubmit form missing _next hidden field`);
    if (!formHtml.includes('name="_subject"')) fail(`${file}: FormSubmit form missing _subject hidden field`);
  }
}

const sitemap = read("sitemap.xml");
for (const file of htmlFiles) {
  const loc = file === "index.html" ? "https://rankhydraulics.com/" : `https://rankhydraulics.com/${file}`;
  if (file !== "thanks.html" && !sitemap.includes(loc)) fail(`sitemap.xml: missing ${loc}`);
}

if (!sitemap.includes("<lastmod>2026-06-03</lastmod>")) {
  fail("sitemap.xml: expected updated lastmod date 2026-06-03");
}

if (failures.length) {
  console.error("Static site QA failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Static site QA passed for ${htmlFiles.length} HTML files.`);
```

- [ ] **Step 3: Add the npm script**

Modify `package.json` so the `scripts` object is exactly:

```json
"scripts": {
  "serve": "python3 -m http.server 4173",
  "test:site": "node tools/site-qa.mjs"
}
```

- [ ] **Step 4: Run QA to verify the current baseline**

Run:

```bash
npm run test:site
```

Expected at this point: the command may fail because the current sitemap date and some form details have not been updated yet. Record the failing messages in your working notes. Do not weaken the script to make the baseline pass.

- [ ] **Step 5: Commit QA scaffold**

Run:

```bash
git add package.json tools/site-qa.mjs
git commit -m "Add static site QA script"
```

Expected: commit succeeds.

---

### Task 2: Add Shared Buyer Utility Styles

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Add shared component CSS**

Append this CSS before the existing `@media` blocks near the end of `styles.css`:

```css
.trust-anchor {
  background: var(--color-green-950);
  color: var(--color-cream);
  padding: clamp(2.5rem, 5vw, 5rem) 0;
}

.trust-anchor-grid {
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(280px, 1.05fr);
  gap: clamp(1.5rem, 4vw, 4rem);
  align-items: start;
}

.trust-anchor h2,
.trust-anchor p {
  color: inherit;
}

.trust-proof-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-3);
  margin: 0;
  padding: 0;
  list-style: none;
}

.trust-proof-list li {
  min-height: 8rem;
  border: 1px solid oklch(92% 0.02 110 / 0.22);
  border-radius: var(--radius-card);
  padding: var(--space-4);
  background: oklch(100% 0 0 / 0.06);
}

.trust-proof-list strong {
  display: block;
  margin-bottom: var(--space-2);
  font-family: var(--font-display);
  font-size: clamp(1.35rem, 2vw, 1.9rem);
  line-height: 0.95;
}

.requirement-router {
  padding: clamp(2.5rem, 5vw, 5rem) 0;
  background: var(--color-cream);
}

.router-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-3);
}

.router-card {
  display: grid;
  gap: var(--space-3);
  min-height: 100%;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  padding: var(--space-4);
  background: var(--color-surface);
}

.router-card h3 {
  margin: 0;
  font-size: clamp(1.55rem, 2.4vw, 2.25rem);
  line-height: 0.95;
}

.router-card p {
  margin: 0;
}

.router-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: center;
  margin-top: auto;
}

.router-actions .inline-link {
  margin: 0;
}

.category-faq-section {
  background: var(--color-surface);
}

.faq-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-3);
}

.faq-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  padding: var(--space-4);
  background: var(--color-cream);
}

.faq-card h3 {
  margin: 0 0 var(--space-2);
  font-size: clamp(1.25rem, 1.8vw, 1.65rem);
  line-height: 1;
}

.faq-card p {
  margin: 0;
}

.customer-proof-note {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-3);
  padding: 0;
  list-style: none;
}

.customer-proof-note li {
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 0.45rem 0.75rem;
  color: var(--color-green-800);
  background: var(--color-surface);
  font-weight: 600;
}
```

- [ ] **Step 2: Add responsive rules**

Inside the existing tablet/mobile media area, add:

```css
@media (max-width: 900px) {
  .trust-anchor-grid,
  .router-grid,
  .faq-grid {
    grid-template-columns: 1fr;
  }

  .trust-proof-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .router-card,
  .faq-card,
  .trust-proof-list li {
    padding: var(--space-3);
  }

  .router-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .router-actions .button,
  .router-actions .inline-link {
    width: 100%;
    justify-content: center;
  }
}
```

- [ ] **Step 3: Check CSS syntax by running QA**

Run:

```bash
npm run test:site
```

Expected: same content-related failures as Task 1; no new missing asset or HTML link failures.

- [ ] **Step 4: Commit shared styles**

Run:

```bash
git add styles.css
git commit -m "Add buyer utility component styles"
```

Expected: commit succeeds.

---

### Task 3: Add Homepage Trust Anchor And Requirement Router

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Insert homepage trust anchor**

In `index.html`, insert this section immediately after the closing `</section>` of `.hero-home` and before `<section class="capability-rail"`:

```html
      <section class="trust-anchor" aria-labelledby="trust-anchor-title">
        <div class="container trust-anchor-grid">
          <div>
            <p class="eyebrow">Buyer utility</p>
            <h2 id="trust-anchor-title">Industrial supply support built around uptime, product fit and repeat requirements.</h2>
            <p>
              Rank Hydraulics gives maintenance and project teams one practical desk for hydraulic,
              transmission, lubrication, tools, coatings, welding and industrial consumable enquiries.
              The focus is simple: identify the requirement clearly, route it to the right product line
              and reduce procurement back-and-forth.
            </p>
          </div>
          <ul class="trust-proof-list" aria-label="Rank Hydraulics buyer proof points">
            <li>
              <strong>Since 1994</strong>
              <span>30+ years serving industrial buyers from Visakhapatnam.</span>
            </li>
            <li>
              <strong>Multi-line supply</strong>
              <span>Hoses, fittings, belts, tools, lubricants, coatings, welding and VMI support.</span>
            </li>
            <li>
              <strong>Supplier depth</strong>
              <span>Manufacturer and supplier lines kept visible with product context.</span>
            </li>
            <li>
              <strong>Quote clarity</strong>
              <span>Category-specific checklists help buyers send usable photos, sizes and site details.</span>
            </li>
          </ul>
        </div>
      </section>
```

- [ ] **Step 2: Insert homepage requirement router**

In `index.html`, insert this section after the `.product-section` and before `.operations-section`:

```html
      <section class="requirement-router" id="requirement-router" aria-labelledby="router-title">
        <div class="container split-heading">
          <p class="eyebrow">Find the right line</p>
          <h2 id="router-title">Route the enquiry by requirement, not by brochure category.</h2>
        </div>
        <div class="container router-grid" data-reveal-group>
          <article class="router-card" data-reveal>
            <p class="eyebrow">Hose burst or fluid-power replacement</p>
            <h3>Hydraulic hose, fittings and STAUFF components</h3>
            <p>Send hose photos, pressure rating, media, end fitting type, machine context, quantity and urgency.</p>
            <div class="router-actions">
              <a class="inline-link" href="hydraulic-hose-assemblies.html">Open hose page</a>
              <a class="button button-whatsapp" href="https://wa.me/919849021685?text=Hello%20Rank%20Hydraulics%2C%20I%20need%20help%20with%20a%20hydraulic%20hose%20or%20fluid-power%20requirement.%20I%20can%20share%20photos%2C%20size%2C%20pressure%20and%20urgency." target="_blank" rel="noopener">WhatsApp hose details</a>
            </div>
          </article>
          <article class="router-card" data-reveal>
            <p class="eyebrow">Transmission maintenance</p>
            <h3>Belts, couplings, pulleys and industrial chains</h3>
            <p>Send belt code, pulley or coupling type, machine details, quantity, operating context and urgency.</p>
            <div class="router-actions">
              <a class="inline-link" href="power-transmission-belts.html">Open transmission page</a>
              <a class="button button-whatsapp" href="https://wa.me/919849021685?text=Hello%20Rank%20Hydraulics%2C%20I%20need%20help%20with%20belts%2C%20couplings%2C%20pulleys%20or%20industrial%20chains.%20I%20can%20share%20part%20details%2C%20quantity%20and%20urgency." target="_blank" rel="noopener">WhatsApp transmission details</a>
            </div>
          </article>
          <article class="router-card" data-reveal>
            <p class="eyebrow">Tools and lubrication</p>
            <h3>Groz tools, grease pumps and Veedol lubricants</h3>
            <p>Send tool type, pump details, lubricant grade, application, machine, volume, quantity and repeat stock needs.</p>
            <div class="router-actions">
              <a class="inline-link" href="groz-tools.html">Open Groz page</a>
              <a class="inline-link" href="veedol-lubricants.html">Open Veedol page</a>
              <a class="button button-whatsapp" href="https://wa.me/919849021685?text=Hello%20Rank%20Hydraulics%2C%20I%20need%20help%20with%20tools%2C%20grease%20pumps%20or%20Veedol%20lubricants.%20I%20can%20share%20application%2C%20grade%2C%20quantity%20and%20urgency." target="_blank" rel="noopener">WhatsApp tool or oil details</a>
            </div>
          </article>
          <article class="router-card" data-reveal>
            <p class="eyebrow">Coatings and welding</p>
            <h3>Paints, floor coatings and welding consumables</h3>
            <p>Send substrate, coating or welding requirement, area or quantity, finish, environment and delivery urgency.</p>
            <div class="router-actions">
              <a class="inline-link" href="industrial-coatings-welding.html">Open coatings page</a>
              <a class="button button-whatsapp" href="https://wa.me/919849021685?text=Hello%20Rank%20Hydraulics%2C%20I%20need%20help%20with%20coatings%2C%20paints%20or%20welding%20consumables.%20I%20can%20share%20application%2C%20quantity%20and%20urgency." target="_blank" rel="noopener">WhatsApp coating details</a>
            </div>
          </article>
          <article class="router-card" data-reveal>
            <p class="eyebrow">Project or VMI support</p>
            <h3>Multi-line procurement for site and repeat stock</h3>
            <p>Send site location, equipment list, recurring parts, expected consumption, delivery window and contact person.</p>
            <div class="router-actions">
              <a class="inline-link" href="project-vmi-supply.html">Open project supply page</a>
              <a class="button button-whatsapp" href="https://wa.me/919849021685?text=Hello%20Rank%20Hydraulics%2C%20I%20need%20help%20with%20project%20supply%20or%20repeat%20stock%20planning.%20I%20can%20share%20site%2C%20equipment%20list%20and%20required%20items." target="_blank" rel="noopener">WhatsApp project details</a>
            </div>
          </article>
          <article class="router-card" data-reveal>
            <p class="eyebrow">Not sure where it fits?</p>
            <h3>Send a photo, label or part reference</h3>
            <p>Rank can route mixed requirements across hose, fittings, belts, tools, oils, coatings and consumables.</p>
            <div class="router-actions">
              <a class="inline-link" href="landing.html">Prepare enquiry</a>
              <a class="button button-whatsapp" href="https://wa.me/919849021685?text=Hello%20Rank%20Hydraulics%2C%20I%20am%20not%20sure%20which%20product%20line%20my%20requirement%20fits.%20I%20can%20share%20photos%2C%20labels%20or%20part%20references." target="_blank" rel="noopener">WhatsApp general details</a>
            </div>
          </article>
        </div>
      </section>
```

- [ ] **Step 3: Add sector proof chips to the customer ribbon**

In `index.html`, inside `.customer-ribbon-copy` after the paragraph under `#customer-ribbon-title`, add:

```html
            <ul class="customer-proof-note" aria-label="Customer sectors represented">
              <li>Paper</li>
              <li>Steel</li>
              <li>Energy</li>
              <li>Ports</li>
              <li>Construction</li>
              <li>Process plants</li>
            </ul>
```

- [ ] **Step 4: Run local QA**

Run:

```bash
npm run test:site
```

Expected: no new missing asset or missing page failures. Form and sitemap failures may remain until later tasks.

- [ ] **Step 5: Commit homepage utility modules**

Run:

```bash
git add index.html styles.css
git commit -m "Add homepage buyer utility modules"
```

Expected: commit succeeds.

---

### Task 4: Strengthen Products Page Routing

**Files:**
- Modify: `products.html`

- [ ] **Step 1: Add products page router intro**

In `products.html`, after the `.products-hero` section and before the existing catalogue section, insert:

```html
      <section class="requirement-router" aria-labelledby="products-router-title">
        <div class="container split-heading">
          <p class="eyebrow">Requirement router</p>
          <h2 id="products-router-title">Start with the part, machine or site problem.</h2>
        </div>
        <div class="container router-grid" data-reveal-group>
          <article class="router-card" data-reveal>
            <p class="eyebrow">Fluid power</p>
            <h3>Hose assemblies, fittings and hydraulic components</h3>
            <p>Best for hose replacement, fitting identification, clamps, flanges, tube fittings, test gear and quick couplings.</p>
            <div class="router-actions">
              <a class="inline-link" href="hydraulic-hose-assemblies.html">Hydraulic hose</a>
              <a class="inline-link" href="stauff-hydraulic-components.html">STAUFF components</a>
            </div>
          </article>
          <article class="router-card" data-reveal>
            <p class="eyebrow">Plant maintenance</p>
            <h3>Transmission, tools and lubricants</h3>
            <p>Best for belts, couplings, chains, grease pumps, workshop tools, hydraulic oils, gear oils, coolants and specialty lubricants.</p>
            <div class="router-actions">
              <a class="inline-link" href="power-transmission-belts.html">Transmission</a>
              <a class="inline-link" href="groz-tools.html">Groz tools</a>
              <a class="inline-link" href="veedol-lubricants.html">Veedol lubricants</a>
            </div>
          </article>
          <article class="router-card" data-reveal>
            <p class="eyebrow">Site and project supply</p>
            <h3>Coatings, welding, repeat stock and VMI support</h3>
            <p>Best for paints, floor coatings, welding consumables, multi-line site requirements and recurring project procurement.</p>
            <div class="router-actions">
              <a class="inline-link" href="industrial-coatings-welding.html">Coatings and welding</a>
              <a class="inline-link" href="project-vmi-supply.html">Project and VMI</a>
            </div>
          </article>
        </div>
      </section>
```

- [ ] **Step 2: Replace products page buyer questions**

Replace the current six `.buyer-question` articles in `products.html` with:

```html
          <article class="buyer-question" data-reveal>
            <h3>What details make a product enquiry useful?</h3>
            <p>Send the product line, size or grade, clear photos, machine or site context, quantity, urgency and whether this is a one-time or repeat requirement.</p>
          </article>
          <article class="buyer-question" data-reveal>
            <h3>Can one enquiry include multiple product lines?</h3>
            <p>Yes. Rank Hydraulics can receive hose, fittings, belts, tools, lubricants, coatings, welding and VMI requirements together and route them by category.</p>
          </article>
          <article class="buyer-question" data-reveal>
            <h3>Which lubricant line is shown on the current site?</h3>
            <p>The current website uses Veedol as the public lubricant line, reflecting the client-confirmed 2026 update.</p>
          </article>
          <article class="buyer-question" data-reveal>
            <h3>What should project or VMI teams include?</h3>
            <p>Include site location, equipment list, recurring products, expected consumption, delivery window, urgency level and the site contact person.</p>
          </article>
          <article class="buyer-question" data-reveal>
            <h3>Can Rank help identify a part from a photo?</h3>
            <p>A clear photo of the failed part, hose label, fitting end, belt marking, lubricant label or machine plate can help Rank ask the right follow-up questions.</p>
          </article>
          <article class="buyer-question" data-reveal>
            <h3>Are supplier logos formal authorization proof?</h3>
            <p>The logos identify supplier and product lines referenced by Rank Hydraulics source material. Formal authorization should be confirmed line by line where required.</p>
          </article>
```

- [ ] **Step 3: Run local QA**

Run:

```bash
npm run test:site
```

Expected: no missing local links or asset failures. Sitemap/form failures may remain.

- [ ] **Step 4: Commit products page routing**

Run:

```bash
git add products.html
git commit -m "Strengthen product routing content"
```

Expected: commit succeeds.

---

### Task 5: Enrich Product Detail Pages With FAQs And Specific WhatsApp Messages

**Files:**
- Modify: `hydraulic-hose-assemblies.html`
- Modify: `stauff-hydraulic-components.html`
- Modify: `power-transmission-belts.html`
- Modify: `groz-tools.html`
- Modify: `veedol-lubricants.html`
- Modify: `industrial-coatings-welding.html`
- Modify: `project-vmi-supply.html`

- [ ] **Step 1: Update each product page WhatsApp href**

Replace the generic WhatsApp href in each listed page with the page-specific href below wherever the hero CTA and category CTA say `WhatsApp sales`.

| File | WhatsApp href |
| --- | --- |
| `hydraulic-hose-assemblies.html` | `https://wa.me/919849021685?text=Hello%20Rank%20Hydraulics%2C%20I%20need%20help%20with%20a%20hydraulic%20hose%20or%20fluid-power%20requirement.%20I%20can%20share%20photos%2C%20size%2C%20pressure%20and%20urgency.` |
| `stauff-hydraulic-components.html` | `https://wa.me/919849021685?text=Hello%20Rank%20Hydraulics%2C%20I%20need%20help%20with%20STAUFF%20hydraulic%20components.%20I%20can%20share%20component%20type%2C%20size%2C%20thread%2C%20quantity%20and%20photos.` |
| `power-transmission-belts.html` | `https://wa.me/919849021685?text=Hello%20Rank%20Hydraulics%2C%20I%20need%20help%20with%20belts%2C%20couplings%2C%20pulleys%20or%20industrial%20chains.%20I%20can%20share%20part%20details%2C%20quantity%20and%20urgency.` |
| `groz-tools.html` | `https://wa.me/919849021685?text=Hello%20Rank%20Hydraulics%2C%20I%20need%20help%20with%20Groz%20tools%2C%20grease%20pumps%20or%20oil%20handling%20equipment.%20I%20can%20share%20tool%20type%2C%20capacity%2C%20quantity%20and%20urgency.` |
| `veedol-lubricants.html` | `https://wa.me/919849021685?text=Hello%20Rank%20Hydraulics%2C%20I%20need%20help%20with%20Veedol%20lubricants.%20I%20can%20share%20application%2C%20oil%20grade%2C%20machine%2C%20volume%20and%20urgency.` |
| `industrial-coatings-welding.html` | `https://wa.me/919849021685?text=Hello%20Rank%20Hydraulics%2C%20I%20need%20help%20with%20coatings%2C%20paints%20or%20welding%20consumables.%20I%20can%20share%20application%2C%20surface%2C%20quantity%20and%20urgency.` |
| `project-vmi-supply.html` | `https://wa.me/919849021685?text=Hello%20Rank%20Hydraulics%2C%20I%20need%20help%20with%20project%20supply%20or%20repeat%20stock%20planning.%20I%20can%20share%20site%2C%20equipment%20list%20and%20required%20items.` |

- [ ] **Step 2: Replace quote detail lists**

Use the exact quote detail list items for each page:

| File | Quote detail list items |
| --- | --- |
| `hydraulic-hose-assemblies.html` | `hose size or sample photo`; `pressure rating and media`; `end fitting type`; `machine or site context`; `quantity and urgency`; `failed hose label or part marking if visible` |
| `stauff-hydraulic-components.html` | `component type such as clamp, fitting, flange or gauge`; `tube outside diameter, thread or port size`; `material or pressure context`; `machine or hydraulic circuit context`; `quantity and urgency`; `clear photo of the component or installation point` |
| `power-transmission-belts.html` | `belt code, profile, length or sample photo`; `pulley, coupling or chain details`; `machine, load or speed context`; `brand preference if known`; `quantity and urgency`; `whether this is a repeat maintenance item` |
| `groz-tools.html` | `tool, pump or oil-handling requirement`; `manual, pneumatic, electric or capacity preference`; `grease, oil or fluid handled`; `workshop, site or vehicle application`; `quantity and urgency`; `photo or model reference if available` |
| `veedol-lubricants.html` | `application or machine`; `current lubricant grade or label photo`; `oil type such as hydraulic, gear, engine, coolant or grease`; `volume or pack size`; `top-up, changeover or repeat stock need`; `urgency and delivery context` |
| `industrial-coatings-welding.html` | `coating, paint or welding consumable type`; `substrate or material`; `area, quantity or electrode/wire size`; `indoor, outdoor, marine, floor or plant environment`; `finish, colour or brand reference if known`; `urgency and site context` |
| `project-vmi-supply.html` | `site or project location`; `equipment list or product categories`; `recurring parts and expected consumption`; `delivery window and urgency`; `site contact person`; `whether VMI or repeat stock planning is required` |

- [ ] **Step 3: Add FAQ section to each product page**

Insert a FAQ section before the existing `<section class="category-cta"` on each product page. The section must use opening tag `<section class="category-section category-faq-section" aria-labelledby="faq-title">`, a `.split-heading` with eyebrow `Buyer questions`, heading `Questions that help prepare a useful enquiry.`, a `.faq-grid`, the three exact `faq-card` articles from the table below, then the closing `.faq-grid` div and section tags.

Use these exact `faq-card` articles:

| File | FAQ cards |
| --- | --- |
| `hydraulic-hose-assemblies.html` | `<article class="faq-card" data-reveal><h3>What details help with a hydraulic hose quote?</h3><p>Send hose size, pressure rating, media, end fitting type, machine context, quantity, urgency and clear photos of the hose or label.</p></article><article class="faq-card" data-reveal><h3>Can I send a failed hose photo?</h3><p>Yes. Photos of the failed hose, fitting ends, label markings and machine connection points help Rank ask the right follow-up questions.</p></article><article class="faq-card" data-reveal><h3>Which related lines may be relevant?</h3><p>Parker, Gates and STAUFF references may be relevant depending on hose, fitting, clamp, tube fitting, flange, gauge or coupling requirements.</p></article>` |
| `stauff-hydraulic-components.html` | `<article class="faq-card" data-reveal><h3>What details help identify STAUFF components?</h3><p>Send the component type, tube outside diameter, thread or port size, material, pressure context, quantity and installation photo.</p></article><article class="faq-card" data-reveal><h3>Which STAUFF categories are shown?</h3><p>The current material references clamps, tube fittings, flanges, valves, breathers, gauges, test equipment, diagnostics and quick-release couplings.</p></article><article class="faq-card" data-reveal><h3>Can one enquiry include hose and STAUFF items?</h3><p>Yes. Send the hose, fitting, clamp, flange and hydraulic accessory details together so Rank can route the full fluid-power requirement.</p></article>` |
| `power-transmission-belts.html` | `<article class="faq-card" data-reveal><h3>What details help identify a belt or coupling?</h3><p>Send the belt code, profile, length, pulley or coupling type, machine context, load or speed context, quantity and urgency.</p></article><article class="faq-card" data-reveal><h3>Can I send a photo of the old belt?</h3><p>Yes. A photo of the belt marking, failed part, pulley or coupling can help identify the correct replacement conversation.</p></article><article class="faq-card" data-reveal><h3>Which product lines are grouped here?</h3><p>JK Fenner, Gates and Diamond industrial chain references are grouped for plant transmission and maintenance requirements.</p></article>` |
| `groz-tools.html` | `<article class="faq-card" data-reveal><h3>What details help with Groz tool enquiries?</h3><p>Send the tool type, grease or oil-handling application, manual or powered preference, capacity, quantity, urgency and model photo if available.</p></article><article class="faq-card" data-reveal><h3>Can tool and lubricant needs be sent together?</h3><p>Yes. Maintenance teams can send Groz tool, grease pump, oil-handling and Veedol lubricant requirements in one enquiry.</p></article><article class="faq-card" data-reveal><h3>Which Groz categories are referenced?</h3><p>The current material includes hand tools, grease pumps, oil handling equipment, impact tools, work lights and storage references.</p></article>` |
| `veedol-lubricants.html` | `<article class="faq-card" data-reveal><h3>What details help with a lubricant enquiry?</h3><p>Send the application, machine, current grade or label photo, oil type, volume, pack size, urgency and whether it is top-up or repeat stock.</p></article><article class="faq-card" data-reveal><h3>Which lubricant categories are shown?</h3><p>The current site references Veedol hydraulic oils, gear oils, engine oils, greases, coolants and specialty lubricants.</p></article><article class="faq-card" data-reveal><h3>Can lubricants be part of repeat stock planning?</h3><p>Yes. Share monthly consumption, pack sizes and site delivery context if the requirement is recurring or linked to project supply.</p></article>` |
| `industrial-coatings-welding.html` | `<article class="faq-card" data-reveal><h3>What details help with coatings or welding enquiries?</h3><p>Send the product type, substrate, area or quantity, environment, finish, colour or brand reference, urgency and site context.</p></article><article class="faq-card" data-reveal><h3>Which coating and welding lines are referenced?</h3><p>The current material references JSW-Dulux, AkzoNobel/International, Growel paints and Stanvac/Superon welding consumables.</p></article><article class="faq-card" data-reveal><h3>Can coatings and industrial consumables be sent together?</h3><p>Yes. Project and maintenance teams can include paints, floor coatings, welding consumables and other industrial supply needs together.</p></article>` |
| `project-vmi-supply.html` | `<article class="faq-card" data-reveal><h3>What details help with project supply support?</h3><p>Send site location, equipment list, product categories, recurring parts, expected consumption, delivery window, urgency and contact person.</p></article><article class="faq-card" data-reveal><h3>Can one project enquiry include many product lines?</h3><p>Yes. Hydraulic, transmission, tools, lubrication, coatings, welding and consumable needs can be sent together for routing.</p></article><article class="faq-card" data-reveal><h3>What is useful for repeat stock planning?</h3><p>Share recurring SKUs or descriptions, estimated monthly consumption, preferred pack sizes, delivery location and reorder rhythm.</p></article>` |

- [ ] **Step 4: Add FAQPage schema to each page JSON-LD graph**

For each product detail page, add the exact FAQPage object below to the existing JSON-LD `@graph`.

For `hydraulic-hose-assemblies.html`:

```json
{
  "@type": "FAQPage",
  "@id": "https://rankhydraulics.com/hydraulic-hose-assemblies.html#faq",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What details help with a hydraulic hose quote?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Send hose size, pressure rating, media, end fitting type, machine context, quantity, urgency and clear photos of the hose or label."
      }
    },
    {
      "@type": "Question",
      "name": "Can I send a failed hose photo?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Photos of the failed hose, fitting ends, label markings and machine connection points help Rank ask the right follow-up questions."
      }
    },
    {
      "@type": "Question",
      "name": "Which related lines may be relevant?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Parker, Gates and STAUFF references may be relevant depending on hose, fitting, clamp, tube fitting, flange, gauge or coupling requirements."
      }
    }
  ]
}
```

For `stauff-hydraulic-components.html`:

```json
{
  "@type": "FAQPage",
  "@id": "https://rankhydraulics.com/stauff-hydraulic-components.html#faq",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What details help identify STAUFF components?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Send the component type, tube outside diameter, thread or port size, material, pressure context, quantity and installation photo."
      }
    },
    {
      "@type": "Question",
      "name": "Which STAUFF categories are shown?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The current material references clamps, tube fittings, flanges, valves, breathers, gauges, test equipment, diagnostics and quick-release couplings."
      }
    },
    {
      "@type": "Question",
      "name": "Can one enquiry include hose and STAUFF items?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Send the hose, fitting, clamp, flange and hydraulic accessory details together so Rank can route the full fluid-power requirement."
      }
    }
  ]
}
```

For `power-transmission-belts.html`:

```json
{
  "@type": "FAQPage",
  "@id": "https://rankhydraulics.com/power-transmission-belts.html#faq",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What details help identify a belt or coupling?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Send the belt code, profile, length, pulley or coupling type, machine context, load or speed context, quantity and urgency."
      }
    },
    {
      "@type": "Question",
      "name": "Can I send a photo of the old belt?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. A photo of the belt marking, failed part, pulley or coupling can help identify the correct replacement conversation."
      }
    },
    {
      "@type": "Question",
      "name": "Which product lines are grouped here?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "JK Fenner, Gates and Diamond industrial chain references are grouped for plant transmission and maintenance requirements."
      }
    }
  ]
}
```

For `groz-tools.html`:

```json
{
  "@type": "FAQPage",
  "@id": "https://rankhydraulics.com/groz-tools.html#faq",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What details help with Groz tool enquiries?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Send the tool type, grease or oil-handling application, manual or powered preference, capacity, quantity, urgency and model photo if available."
      }
    },
    {
      "@type": "Question",
      "name": "Can tool and lubricant needs be sent together?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Maintenance teams can send Groz tool, grease pump, oil-handling and Veedol lubricant requirements in one enquiry."
      }
    },
    {
      "@type": "Question",
      "name": "Which Groz categories are referenced?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The current material includes hand tools, grease pumps, oil handling equipment, impact tools, work lights and storage references."
      }
    }
  ]
}
```

For `veedol-lubricants.html`:

```json
{
  "@type": "FAQPage",
  "@id": "https://rankhydraulics.com/veedol-lubricants.html#faq",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What details help with a lubricant enquiry?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Send the application, machine, current grade or label photo, oil type, volume, pack size, urgency and whether it is top-up or repeat stock."
      }
    },
    {
      "@type": "Question",
      "name": "Which lubricant categories are shown?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The current site references Veedol hydraulic oils, gear oils, engine oils, greases, coolants and specialty lubricants."
      }
    },
    {
      "@type": "Question",
      "name": "Can lubricants be part of repeat stock planning?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Share monthly consumption, pack sizes and site delivery context if the requirement is recurring or linked to project supply."
      }
    }
  ]
}
```

For `industrial-coatings-welding.html`:

```json
{
  "@type": "FAQPage",
  "@id": "https://rankhydraulics.com/industrial-coatings-welding.html#faq",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What details help with coatings or welding enquiries?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Send the product type, substrate, area or quantity, environment, finish, colour or brand reference, urgency and site context."
      }
    },
    {
      "@type": "Question",
      "name": "Which coating and welding lines are referenced?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The current material references JSW-Dulux, AkzoNobel/International, Growel paints and Stanvac/Superon welding consumables."
      }
    },
    {
      "@type": "Question",
      "name": "Can coatings and industrial consumables be sent together?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Project and maintenance teams can include paints, floor coatings, welding consumables and other industrial supply needs together."
      }
    }
  ]
}
```

For `project-vmi-supply.html`:

```json
{
  "@type": "FAQPage",
  "@id": "https://rankhydraulics.com/project-vmi-supply.html#faq",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What details help with project supply support?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Send site location, equipment list, product categories, recurring parts, expected consumption, delivery window, urgency and contact person."
      }
    },
    {
      "@type": "Question",
      "name": "Can one project enquiry include many product lines?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Hydraulic, transmission, tools, lubrication, coatings, welding and consumable needs can be sent together for routing."
      }
    },
    {
      "@type": "Question",
      "name": "What is useful for repeat stock planning?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Share recurring SKUs or descriptions, estimated monthly consumption, preferred pack sizes, delivery location and reorder rhythm."
      }
    }
  ]
}
```

- [ ] **Step 5: Run local QA**

Run:

```bash
npm run test:site
```

Expected: no WhatsApp text failures and no missing asset/link failures. Sitemap/form failures may remain.

- [ ] **Step 6: Commit product page enrichment**

Run:

```bash
git add hydraulic-hose-assemblies.html stauff-hydraulic-components.html power-transmission-belts.html groz-tools.html veedol-lubricants.html industrial-coatings-welding.html project-vmi-supply.html styles.css
git commit -m "Enrich product pages for buyer enquiries"
```

Expected: commit succeeds.

---

### Task 6: Improve Landing And Thanks Conversion Flow

**Files:**
- Modify: `landing.html`
- Modify: `thanks.html`

- [ ] **Step 1: Replace landing form requirement options**

In `landing.html`, replace the options inside `<select id="quote-need" name="requirement_type" required>` with:

```html
                <option value="">Select requirement type</option>
                <option>Hydraulic hose, fittings or fluid power</option>
                <option>STAUFF hydraulic components</option>
                <option>Belts, couplings, pulleys or industrial chains</option>
                <option>Groz tools, grease pumps or oil handling</option>
                <option>Veedol lubricants, oils, greases or coolants</option>
                <option>Coatings, paints or welding consumables</option>
                <option>Project supply, repeat stock or VMI support</option>
                <option>Mixed or unsure requirement</option>
```

- [ ] **Step 2: Confirm FormSubmit hidden fields**

Ensure both forms in `index.html` and `landing.html` contain these hidden inputs:

```html
            <input type="hidden" name="_subject" value="Rank Hydraulics quote request">
            <input type="hidden" name="_captcha" value="false">
            <input type="hidden" name="_template" value="table">
            <input type="hidden" name="_next" value="https://rankhydraulics.com/thanks.html">
```

If the `index.html` form subject is currently different, keep it as `Rank Hydraulics website enquiry` and make sure `_next`, `_captcha`, and `_template` are present.

- [ ] **Step 3: Update thanks page copy**

In `thanks.html`, update the main confirmation copy to:

```html
          <p>
            Your enquiry has been sent to Rank Hydraulics. If the requirement is urgent,
            please send photos, labels, sizes or part references on WhatsApp as a follow-up
            so the team can identify the right product line faster.
          </p>
```

Ensure the WhatsApp CTA on `thanks.html` uses:

```html
https://wa.me/919849021685?text=Hello%20Rank%20Hydraulics%2C%20I%20have%20submitted%20a%20website%20enquiry%20and%20would%20like%20to%20share%20photos%2C%20labels%20or%20part%20details%20for%20faster%20routing.
```

- [ ] **Step 4: Run local QA**

Run:

```bash
npm run test:site
```

Expected: form hidden-field failures are gone. Sitemap date failure may remain.

- [ ] **Step 5: Commit conversion flow**

Run:

```bash
git add index.html landing.html thanks.html
git commit -m "Improve enquiry conversion flow"
```

Expected: commit succeeds.

---

### Task 7: Update SEO Metadata, Sitemap And Source Notes

**Files:**
- Modify: `index.html`
- Modify: `products.html`
- Modify: all product detail pages listed in Task 5
- Modify: `landing.html`
- Modify: `sitemap.xml`
- Modify: `source-notes.md`

- [ ] **Step 1: Update page titles and descriptions where needed**

Use this metadata table. Keep titles under practical display length and descriptions specific to buyer intent.

| File | Title | Description |
| --- | --- | --- |
| `index.html` | `Rank Hydraulics | Hydraulic Hose, Industrial Supply & Project Support` | `Rank Hydraulics supplies hydraulic hose assemblies, STAUFF components, belts, Groz tools, Veedol lubricants, coatings, welding consumables and project supply support from Visakhapatnam.` |
| `products.html` | `Product Finder | Rank Hydraulics Industrial Supply Pages` | `Find the right Rank Hydraulics product page for hose assemblies, STAUFF components, belts, Groz tools, Veedol lubricants, coatings, welding and project supply.` |
| `hydraulic-hose-assemblies.html` | `Hydraulic Hose Assemblies & Fluid Power | Rank Hydraulics` | `Hydraulic hose assemblies, fittings, Parker and Gates hose references, STAUFF components and quote details for heavy equipment and plant teams.` |
| `stauff-hydraulic-components.html` | `STAUFF Hydraulic Components | Rank Hydraulics` | `STAUFF clamps, tube fittings, flanges, gauges, breathers, test equipment and hydraulic component enquiry support from Rank Hydraulics.` |
| `power-transmission-belts.html` | `Belts, Couplings & Industrial Chains | Rank Hydraulics` | `JK Fenner and Gates belt references, couplings, pulleys and Diamond industrial chain enquiry support for plant maintenance teams.` |
| `groz-tools.html` | `Groz Tools, Grease Pumps & Oil Handling | Rank Hydraulics` | `Groz hand tools, grease pumps, oil handling equipment, impact tools, work lights and maintenance supply enquiry support.` |
| `veedol-lubricants.html` | `Veedol Lubricants, Oils, Greases & Coolants | Rank Hydraulics` | `Veedol hydraulic oils, gear oils, engine oils, greases, coolants and specialty lubricant enquiry support from Rank Hydraulics.` |
| `industrial-coatings-welding.html` | `Industrial Coatings, Paints & Welding Consumables | Rank Hydraulics` | `JSW-Dulux, AkzoNobel/International, Growel paints and Stanvac/Superon welding consumable references for industrial enquiries.` |
| `project-vmi-supply.html` | `Project Supply & VMI Support | Rank Hydraulics` | `Project supply and repeat stock planning for hydraulic, transmission, tools, lubricants, coatings, welding and industrial consumable requirements.` |
| `landing.html` | `Request A Quote | Rank Hydraulics` | `Send a Rank Hydraulics quote request with product line, photos, machine context, quantity and urgency for faster routing.` |

Update Open Graph and Twitter title/description tags to match the page title and description where those tags exist.

- [ ] **Step 2: Update sitemap dates**

In `sitemap.xml`, set every `<lastmod>` value to:

```xml
2026-06-03
```

Do not add `thanks.html` to the sitemap because it is a post-submit utility page.

- [ ] **Step 3: Add source notes entry**

Append this section to `source-notes.md`:

```markdown
## 2026-06-03 buyer utility improvement pass

- Direction approved: trust-led buyer utility pass combining buyer trust, enquiry conversion and search visibility.
- Peer benchmark patterns considered: Hydroscand hydraulic/product/service pages, PIRTEK urgent service routing, Gates catalogue/resource paths and STAUFF product catalogue grouping.
- Safe claims used: since 1994, 30+ years, approved customer logo presence, current supplier/product lines, product enquiry guidance and broad sector language.
- Deferred claims: case studies, formal authorization, delivery timelines, emergency response guarantees, certifications and project outcomes until client-supplied proof arrives.
- WhatsApp number remains `9849021685` until a dedicated number is provided.
```

- [ ] **Step 4: Run local QA**

Run:

```bash
npm run test:site
```

Expected:

```text
Static site QA passed for 11 HTML files.
```

- [ ] **Step 5: Commit SEO and source notes**

Run:

```bash
git add index.html products.html hydraulic-hose-assemblies.html stauff-hydraulic-components.html power-transmission-belts.html groz-tools.html veedol-lubricants.html industrial-coatings-welding.html project-vmi-supply.html landing.html sitemap.xml source-notes.md
git commit -m "Update SEO content for buyer utility"
```

Expected: commit succeeds.

---

### Task 8: Responsive QA, Local Preview And Deployment

**Files:**
- No planned source changes unless QA finds an issue.

- [ ] **Step 1: Run static QA**

Run:

```bash
npm run test:site
```

Expected:

```text
Static site QA passed for 11 HTML files.
```

- [ ] **Step 2: Start local preview**

Run:

```bash
npm run serve
```

Expected:

```text
Serving HTTP on :: port 4173
```

Keep the server running for visual checks.

- [ ] **Step 3: Check desktop pages in browser**

Open these URLs at desktop width:

```text
http://localhost:4173/
http://localhost:4173/products.html
http://localhost:4173/hydraulic-hose-assemblies.html
http://localhost:4173/project-vmi-supply.html
http://localhost:4173/landing.html
http://localhost:4173/thanks.html
```

Expected visual result:

- No text overlap.
- Trust anchor is readable and not oversized.
- Requirement router cards have even heights where the grid allows.
- FAQ cards stay inside their containers.
- Manufacturer and customer logos remain contained.
- WhatsApp buttons are visible and not cramped.

- [ ] **Step 4: Check mobile pages in browser**

At a mobile width around 390px, check:

```text
http://localhost:4173/
http://localhost:4173/products.html
http://localhost:4173/veedol-lubricants.html
http://localhost:4173/industrial-coatings-welding.html
http://localhost:4173/landing.html
```

Expected visual result:

- Router cards stack in one column.
- FAQ cards stack in one column.
- Buttons do not overflow.
- Long headings wrap cleanly.
- Logo marquees do not cover adjacent content.

- [ ] **Step 5: Fix any QA defects**

If a visual or static QA defect appears, make the smallest focused fix in the relevant HTML or CSS file.

Run:

```bash
npm run test:site
```

Expected:

```text
Static site QA passed for 11 HTML files.
```

Commit only if fixes were required:

```bash
git add index.html products.html hydraulic-hose-assemblies.html stauff-hydraulic-components.html power-transmission-belts.html groz-tools.html veedol-lubricants.html industrial-coatings-welding.html project-vmi-supply.html landing.html thanks.html styles.css
git commit -m "Polish buyer utility responsive layout"
```

- [ ] **Step 6: Push to GitHub Pages repository**

Run:

```bash
git status --short
git push origin main
```

Expected:

- `git status --short` prints nothing before push.
- `git push origin main` succeeds.

- [ ] **Step 7: Verify live deployment**

After GitHub Pages finishes deploying, run:

```bash
curl -I https://rankhydraulics.com/
curl -I https://rankhydraulics.com/products.html
curl -I https://rankhydraulics.com/sitemap.xml
```

Expected for each:

```text
HTTP/2 200
```

- [ ] **Step 8: Post-deploy Search Console note**

After live verification, inspect or resubmit the sitemap in Google Search Console:

```text
https://rankhydraulics.com/sitemap.xml
```

Expected: Google may show processing or queued status first; this is acceptable if the sitemap URL returns HTTP 200 in the live `curl` check.

---

## Final Acceptance Criteria

- Homepage has a visible trust anchor and requirement router.
- Products page helps buyers route by requirement.
- Every product detail page has category-specific WhatsApp text, stronger quote details, visible FAQs, and matching FAQPage schema.
- Landing form choices match the product finder categories.
- Thanks page gives a useful WhatsApp follow-up path.
- Customer proof remains client-safe and does not claim outcomes.
- Sitemap `lastmod` values are updated to `2026-06-03`.
- `npm run test:site` passes.
- Local desktop and mobile checks pass without layout overflow.
- Live `rankhydraulics.com` URLs return HTTP 200 after push.

## Self-Review Notes

- Spec coverage: Tasks 2-7 cover trust anchor, product finder, product page quote helpers/FAQs, client-safe proof, SEO metadata, conversion flow, sitemap and source notes.
- Guardrails: The plan avoids case studies, formal authorization claims, delivery timelines, emergency response guarantees and certifications.
- Scope: The plan keeps the static-site architecture and avoids backend or framework work.
- Testability: Task 1 creates a repeatable QA command before content changes, and Task 8 defines visual and live verification.
