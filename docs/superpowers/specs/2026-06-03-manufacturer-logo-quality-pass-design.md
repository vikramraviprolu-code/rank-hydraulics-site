# Manufacturer Logo Quality Pass Design

## Context

Rank Hydraulics currently uses manufacturer and supplier logos from `assets/2026-brand-logos/` across the home page, landing page, products hub, and project/VMI page. These logos came from the client deck and original source material. The recent customer-logo pass improved readability by using a balanced method: official or vector assets where they clearly improved quality, and approved client assets where they were more accurate or more readable.

This manufacturer-logo pass applies the same balanced principle to the manufacturer/supplier logos without changing the supplier copy, product positioning, or page structure.

## Approved Approach

Use the balanced approach:

- Replace a manufacturer logo only when the current asset is visibly blurry, clipped, low contrast, unevenly padded, or hard to read at the smallest size where it appears.
- Prefer official manufacturer assets when they are readable in the website's logo tiles.
- Use Wikimedia/vector assets only when they are credible and materially improve clarity.
- Keep the deck/client logo when it better preserves Rank's supplier material, slogan, combined lockup, or readable presentation.
- Avoid official web assets that are technically correct but visually wrong for the site, such as white header logos on pale logo tiles.

## Logo Set In Scope

The pass covers the current public manufacturer and supplier lines:

- Parker
- Gates
- JK Fenner
- Stauff
- Groz
- Veedol
- Stanvac / Superon
- Diamond Chains
- JSW-Dulux / AkzoNobel
- Growel
- The combined manufacturer line strip, if it remains visibly softer than the individual logo system

## Affected Website Areas

The clean manufacturer assets should be applied anywhere the current `assets/2026-brand-logos/` logos appear:

- Home page first-section capability logo chips
- Home page `OEM and supplier lines` manufacturer logo wall
- Home page supplier detail cards
- Landing page `Current supplier lines` mini-list
- Products hub category cards and supplier logo rows
- Project/VMI page supplier logo row
- The combined `manufacturer-line-strip.png`, if replaced or rebuilt

## Asset Strategy

Create a separate clean asset layer, expected as `assets/2026-brand-logos-clean/`, so original deck assets remain available.

For each logo, choose the final asset using this order:

1. Official manufacturer media, brand, or site asset if it is readable in Rank's tile system.
2. Credible Wikimedia/vector source if official source is unavailable and the asset is clearly usable.
3. Cleaned or cropped deck asset when it is the most accurate or readable option.

Retain the original files in `assets/2026-brand-logos/`. The clean folder becomes the public reference set after review.

## Visual Rules

- Keep subtle light tiles behind logos for readability.
- Preserve full lockups and slogans where they matter, especially Groz `tools to trust`, Growel `since 1957`, Stauff lockup, and JSW-Dulux/AkzoNobel combination.
- Avoid clipping or over-scaling logos to fit a tile.
- Normalize logo sizing through cleaned crops first, then minimal CSS scale rules only where necessary.
- Long wordmarks must remain readable rather than merely fitting the box.
- White or pale logos need either a darker readable asset or a tile treatment that preserves contrast.

## Verification

The implementation should pass these checks before deployment:

- Every referenced logo file exists.
- Every image has width and height attributes.
- Logo wall, supplier cards, landing mini-list, category logo rows, and VMI supplier row render correctly at mobile and desktop widths.
- No logo is clipped, overflowing, or unreadably small.
- Official/vector replacements are documented in `source-notes.md`.
- `git diff --check` passes.
- GitHub Pages build succeeds after deployment.

## Out Of Scope

- Rewriting supplier/product copy
- Changing the supplier section architecture
- Adding or removing manufacturer lines
- Treating logos as proof of formal authorization
- Redesigning the overall website layout

## Completion Criteria

The pass is complete when the manufacturer logos are visually consistent with the improved customer-logo ribbon: readable, evenly sized, source-documented, and verified on the pages where they appear.
