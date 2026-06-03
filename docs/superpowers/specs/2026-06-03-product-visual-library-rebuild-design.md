# Product Visual Library Rebuild Design

Date: 2026-06-03

## Chosen Direction

Use an ambitious but controlled product visual library rebuild.

The goal is to improve the authenticity, readability and visual trust of Rank Hydraulics product imagery across the site. This should not become a generic stock-photo refresh. Every replacement or addition must be tied to a real product category, come from a reliable source, and render well in the actual page surfaces where buyers see it.

## Scope

This pass covers all product-line photos already used on the site and allows up to two additional supporting photos per product category where the category currently feels visually thin.

Covered surfaces:

- Homepage product cards and manufacturer product panels.
- Landing page product cards and supplier mini strip.
- Product hub cards.
- Product-detail hero images.
- Product-detail gallery images where current visuals are weak.
- VMI/project supply visuals if a stronger industrial supply or project-support image is available.

The pass should avoid broad copy rewrites. Copy, alt text and captions may change only when the image source or subject changes enough to make existing text inaccurate.

## Source Policy

Keep `assets/2026-product-lines/` untouched as the original fallback library.

Create a new clean product image library at:

`assets/2026-product-lines-clean/`

For each product image, choose one of three outcomes:

- Keep: the current image is authentic, readable and good enough.
- Replace: an official or catalogue-quality image is clearly stronger.
- Add: the category needs one additional support visual to improve trust or completeness.

Accepted sources:

- Current Rank Hydraulics source assets.
- The 2026 Rank Hydraulics PowerPoint deck.
- Official manufacturer pages.
- Official manufacturer catalogue pages or downloadable product PDFs.
- Manufacturer-hosted product images where the category match is clear.

Rejected sources:

- Generic stock imagery.
- Low-confidence reseller marketplace images.
- Images that look good but do not match the product category.
- Images that create a misleading impression of Rank Hydraulics stock, certification or authorization.
- Images that are too small or too compressed to survive card and hero crops.

Each replacement or addition must be documented in `source-notes.md` with the source, reason used and whether it replaced an older asset or was added as support.

## Product Categories

The rebuild should preserve the current product architecture and improve imagery within those boundaries:

- Hydraulic hose assemblies, Parker/Gates hose and fittings.
- STAUFF hydraulic components, clamps, flanges, fittings, breathers and gauges.
- JK Fenner and Gates power transmission products.
- Diamond industrial chains.
- Groz tools, grease pumps, oil handling, fluid handling, lighting, impact tools and storage.
- Veedol oils, greases, coolants and specialty lubricants.
- Stanvac/Superon welding and coating references.
- JSW-Dulux, AkzoNobel/International and Growel coatings.
- Project and VMI supply support.

## Asset Roles

The clean library should support how the same product category appears in different parts of the site.

Hero images:

- Wide or strongly composed images used on product-detail hero sections and the product hub hero.
- Must read clearly at desktop and mobile hero sizes.
- Should avoid poster-like text unless the poster is the most authentic product proof and remains readable.

Card images:

- Stable crops for homepage, landing page and product hub cards.
- Must keep the product recognizable in a fixed card area.
- Should avoid cutting off important product details.

Gallery images:

- Supporting visuals for product-detail pages.
- May include catalogue-style category images, product lineups and application visuals.
- Should add proof or specificity rather than repeat the hero image.

Mini images:

- Small crops for the landing-page supplier mini strip.
- Must remain readable in compact tiles.
- Should favor strong product silhouettes or clear lineups over dense catalogue posters.

## Visual Treatment

The visual system should feel industrial, practical and trustworthy.

Requirements:

- No stretched images.
- No key product details cut off by the crop.
- Consistent aspect ratios per placement.
- Light catalogue backgrounds are acceptable for product clarity.
- Real industrial context is acceptable where application context improves trust.
- Avoid over-polished lifestyle imagery that weakens the industrial tone.
- Keep file sizes restrained so GitHub Pages performance remains strong.
- Preserve or improve existing intrinsic width and height attributes.

The CSS and markup changes should remain tightly scoped to product-image rendering. Existing design language, typography, palette and page structure should be preserved unless a minor adjustment is necessary to prevent cropping, overflow or visual imbalance.

## Page Update Rules

Update pages only where the clean image library improves the visible experience.

The implementation must audit these pages and update the ones where the clean image library improves rendering or accuracy:

- `index.html`
- `landing.html`
- `products.html`
- `hydraulic-hose-assemblies.html`
- `stauff-hydraulic-components.html`
- `power-transmission-belts.html`
- `groz-tools.html`
- `veedol-lubricants.html`
- `industrial-coatings-welding.html`
- `project-vmi-supply.html`
- `styles.css`
- `source-notes.md`

The implementation should point public pages to `assets/2026-product-lines-clean/` for cleaned or replaced assets while retaining originals for fallback and auditability.

## QA Plan

Before committing the implementation, verify:

- All local image references resolve.
- New images have correct intrinsic dimensions in HTML.
- File sizes are reasonable for static hosting.
- Desktop and mobile screenshots cover homepage, landing page, product hub and each product-detail page touched.
- Product images do not overflow, stretch or crop important product details.
- Mini-strip images remain readable on mobile.
- Hero images remain correctly framed on mobile.
- `git diff --check` passes.
- `source-notes.md` documents all replacements and additions.

After deployment:

- Confirm GitHub Pages build succeeds.
- Confirm the live homepage and representative new image assets return HTTP 200.

## Non-Goals

- Do not rebuild the entire site layout.
- Do not create a full ecommerce catalogue.
- Do not add product SKUs, pricing or inventory claims.
- Do not claim formal manufacturer authorization beyond what source material supports.
- Do not use AI-generated product photos as replacements for real product proof.
- Do not remove the original product-line asset folder.

## Success Criteria

The pass is successful when the product imagery feels more authentic, sharper and more consistent across the site, while the site still feels like Rank Hydraulics rather than a generic industrial brochure. Buyers should be able to recognize the relevant product categories faster, and the pages should render cleanly across desktop and mobile without image overflow or awkward cropping.
