# Hosting Rank Hydraulics

This project is static. The production entry points are:

- `index.html`
- `landing.html`

## GitHub Pages

1. Create a new GitHub repository, for example `rank-hydraulics-site`.
2. Push this folder as the repository root.
3. In GitHub, open `Settings -> Pages`.
4. Set source to `Deploy from a branch`.
5. Select branch `main` and folder `/root`.
6. Save. GitHub Pages will publish the site after the first Pages build.

Expected URL format:

```text
https://<github-user>.github.io/rank-hydraulics-site/
```

## Netlify

1. Drag this folder into Netlify Drop, or connect the new repository.
2. Build command: leave empty.
3. Publish directory: `.`.

## Vercel

1. Import the repository.
2. Framework preset: Other.
3. Build command: leave empty.
4. Output directory: `.`.
