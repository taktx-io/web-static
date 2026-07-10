# TaktX — Static Site

A fully static build of [taktx.io](https://taktx.io), designed for **free hosting on GitHub Pages**.

This is a standalone snapshot of the original TaktX web app. Everything that
required a running server (Keycloak authentication, the Quarkus backend, the
Discourse forum, the maintenance flag) has been removed, and the previously
dynamic documentation is baked into static JSON files so no database or API is
needed at runtime.

It is still an Angular app — that keeps the exact look, styling and page
structure of the original — but the production build is 100% static files.

---

## What changed vs. the original

| Area | Original | Static build |
|------|----------|--------------|
| Documentation | Fetched live from `/api/documentation/*`, editable by admins | Pre-baked JSON in `src/assets/docs/`, read-only |
| Search | Server endpoint | Client-side over a bundled search index |
| Auth / Login / Profile / Admin | Keycloak | Removed |
| Forum | Discourse behind Keycloak | Removed (link dropped) |
| Blog | — | Redirects to Medium (unchanged) |
| Contact form | `POST /api/contact/messages` | Opens a pre-filled `mailto:` to eric.hendriks@taktx.io |
| Maintenance flag | `/api/maintenance` | Removed (site always live) |
| Hosting | DigitalOcean (~€50/mo) | GitHub Pages (free) |

---

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
npm run build      # outputs to dist/taktx-web/browser
```

---

## Deploying to GitHub Pages

A workflow at `.github/workflows/deploy.yml` builds the app and publishes it to
GitHub Pages on every push to `main`.

1. Create a new GitHub repository and push this folder to it (`main` branch).
2. In the repo: **Settings → Pages → Build and deployment → Source = GitHub Actions**.
3. Push to `main` (or run the workflow manually). The action builds the site,
   adds a `404.html` SPA fallback, and deploys.

### Custom domain (taktx.io)

A `CNAME` file (`public/CNAME`) already pins the domain to `taktx.io`, so it is
copied into every build.

1. In **Settings → Pages → Custom domain**, enter `taktx.io` and save.
2. At your DNS provider, point the apex domain at GitHub Pages:
   - `A` records → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `AAAA` records → `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
   - (Optional) a `www` `CNAME` → `<your-user>.github.io`
3. Enable **Enforce HTTPS** once the certificate is issued.

> Using the default `<user>.github.io/<repo>` URL instead of a custom domain?
> Remove `public/CNAME` and set `baseHref` in `angular.json` to `/<repo>/`.

---

## Project layout

```
src/app/features/documentation   read-only docs (static JSON backed)
src/assets/docs                  baked documentation content + images
tools/snapshot-docs.mjs          one-time content capture script
.github/workflows/deploy.yml     build + deploy to GitHub Pages
public/CNAME                     custom domain (taktx.io)
```
