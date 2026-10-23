# TaktX — Static Site

The TaktX company site and the TaktX Flow product site, built as **one static deployment on GitHub Pages** (taktx.io).

```
/            company home, Dutch (default)           ← site/ (plain HTML, no framework)
/en/         company home, English                   ← site/
/flow/       TaktX Flow — the BPMN engine site       ← src/ (Angular 19, docs + search baked in)
/404.html    redirects old engine URLs to /flow/… and acts as the SPA fallback for /flow deep links
```

## Layout

| Path | What |
|------|------|
| `site/template.html` | the company home page, one template for both languages |
| `site/i18n/nl.json`, `site/i18n/en.json` | all copy — edit text here, not in the template |
| `site/site.css` | the company site's stylesheet (IBM Plex, self-hosted from `site/assets/fonts`) |
| `site/assets/` | images and fonts for the company site |
| `site/public/` | root-level files: `CNAME`, `robots.txt`, `sitemap.xml`, `favicon.png` |
| `site/build.mjs` | renders the template → `dist/site/` |
| `src/` | the Angular product site, served under `/flow/` (`baseHref` in `angular.json`) |
| `tools/compose-dist.mjs` | assembles `dist/pages/` = company site + `/flow/` + `404.html` |
| `.github/workflows/deploy.yml` | builds and publishes `dist/pages/` on every push to `main` |

## Build

```bash
npm install
npm run build          # site + flow + compose → dist/pages/
npm run build:site     # company home only (fast)
npm start              # ng serve — the Angular product site at http://localhost:4200/flow/
```

To preview `dist/pages/` the way GitHub Pages serves it, any static server that returns `404.html` for unknown paths will do.

## Editing the company home

Change text in `site/i18n/*.json` (both languages), run `npm run build:site`, check `dist/site/index.html`.
Structure and layout live in `site/template.html` and `site/site.css`. Design decisions, palette and type are in the
project notes; the short version: IBM Plex Sans/Mono, ground `#f7f7f5`, ink `#16191d`, links `#0a6d8c`, logo cyan
`#00CFFF` only in the mark and on dark surfaces.

## TaktX Flow (the Angular site)

Everything below is about the product site under `/flow/`. Flow is one open-source product under Apache 2.0 — there is
no commercial tier, pricing page or beta programme anymore; the old `/pricing`, `/beta` and `/qr` URLs redirect to `/flow/`.

## One-time step: snapshot the documentation

The documentation content lives in the production database. Capture it into the
repo **once, while https://taktx.io is still online**:

```bash
npm install
npm run snapshot:docs
```

This fetches the section tree, every section's HTML, and all uploaded images,
writing them to `src/assets/docs/` (tree.json, `content/<id>.json`,
`search-index.json`, and `images/`). Image URLs in the content are rewritten to
the local bundled paths automatically.

Review the generated files and commit them. After this the old backend can be
shut down for good.

> To point the snapshot at a different origin: `BASE_URL=https://taktx.io npm run snapshot:docs`

### Editing documentation later

Docs are now just files. Edit the HTML in `src/assets/docs/content/<id>.json`,
adjust structure/titles in `src/assets/docs/tree.json`, keep
`search-index.json` in sync (its `text` field is plain-text used for search),
then commit and push — the deploy workflow rebuilds automatically.

---

## Local development

```bash
npm install
npm start          # http://localhost:4200
```

## Production build

```bash
npm run build:flow # outputs to dist/flow/browser
```

---

## Deploying to GitHub Pages

A workflow at `.github/workflows/deploy.yml` runs `npm run build` and publishes
`dist/pages/` to GitHub Pages on every push to `main`.

1. Create a new GitHub repository and push this folder to it (`main` branch).
2. In the repo: **Settings → Pages → Build and deployment → Source = GitHub Actions**.
3. Push to `main` (or run the workflow manually). The action builds the site,
   adds a `404.html` SPA fallback, and deploys.

### Custom domain (taktx.io)

A `CNAME` file (`site/public/CNAME`) already pins the domain to `taktx.io`, so it is
copied into every build.

1. In **Settings → Pages → Custom domain**, enter `taktx.io` and save.
2. At your DNS provider, point the apex domain at GitHub Pages:
   - `A` records → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `AAAA` records → `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
   - (Optional) a `www` `CNAME` → `<your-user>.github.io`
3. Enable **Enforce HTTPS** once the certificate is issued.

> Using the default `<user>.github.io/<repo>` URL instead of a custom domain?
> Remove `site/public/CNAME` and prefix every absolute path (`/flow/`, `/assets/`, `/site.css`) with `/<repo>`.

---

## Project layout

```
site/                            company home (template, strings, css, assets, build script)
src/app/features/documentation   read-only docs (static JSON backed)
src/assets/docs                  baked documentation content + images
tools/compose-dist.mjs           assembles dist/pages/ for deployment
tools/snapshot-docs.mjs          one-time content capture script
.github/workflows/deploy.yml     build + deploy to GitHub Pages
site/public/CNAME                custom domain (taktx.io)
```
