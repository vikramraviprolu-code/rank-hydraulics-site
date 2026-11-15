# Security model: Rank Hydraulics site

Drafted by Devin from this repository's code and documentation on 2026-11-15, as the threat model for a Devin security scan. Nothing here is owner-confirmed yet: edit it to record which assets matter most, which attackers are realistic, and what is out of scope or accepted risk, so future scans can prioritise findings against those facts.

## Components and trust boundaries

| Component       | Code                                           | Boundary                                                       |
| --------------- | ---------------------------------------------- | -------------------------------------------------------------- |
| **Static site** | `*.html`, `script.js`, `styles.css`, `assets/` | Static marketing pages and quote landing page on GitHub Pages. |
| **Quote form**  | `landing.html`, `thanks.html`                  | Posts to FormSubmit.co; honeypot field against spam.           |

## Entry points and who reaches them

- Public internet: every page and the quote form.

## Assets (inferred sensitivity)

- Medium: integrity of the published site (defacement, malicious script) and the quote form's destination address.
- Low: static marketing content.

## Attacker profiles (inferred)

- Spam bots abusing the quote form.
- Anyone able to change the published content or third-party scripts.

## Existing controls (from code and docs)

- No server-side code; honeypot on the form; hosting by GitHub Pages.

## Out of scope / accepted risk

- Not stated by the owner yet.

## Open questions

1. Are any third-party scripts loaded that should be pinned or removed?
