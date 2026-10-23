#!/usr/bin/env node
// Composes the deployable site in dist/pages/:
//   /            the static company site (dist/site)
//   /flow/       the Angular product site (dist/flow/browser)
//   /404.html    redirects old engine URLs to /flow/… and acts as the SPA fallback under /flow/
// Run after `build:site` and `build:flow`.

import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const site = join(root, 'dist', 'site');
const flow = join(root, 'dist', 'flow', 'browser');
const out = join(root, 'dist', 'pages');

for (const dir of [site, flow]) {
  if (!existsSync(dir)) {
    console.error(`compose-dist: missing ${dir} — run build:site and build:flow first`);
    process.exit(1);
  }
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(site, out, { recursive: true });
cpSync(join(root, 'site', 'public'), out, { recursive: true });
cpSync(flow, join(out, 'flow'), { recursive: true });
writeFileSync(join(out, '.nojekyll'), '');

// 404.html: GitHub Pages serves this (with status 404) for every unknown path.
// 1. Old engine URLs (pre-/flow) → their new home under /flow/.
// 2. Anything under /flow/ → bounce to /flow/?p=<path>; src/index.html restores the path before Angular boots
//    (the usual GitHub Pages SPA pattern), so deep links into the product site keep working.
// 3. Anything else → this page itself: a small company-site 404.
const notFound = `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>404 — TaktX</title>
<script>
(function () {
  var p = location.pathname, s = location.search, h = location.hash;
  var moved = ['/features','/documentation','/decisions','/about','/contact','/why-taktx','/case-studies','/privacy','/terms','/cookies','/license','/blog'];
  var retired = ['/pricing','/beta','/qr'];
  for (var i = 0; i < retired.length; i++) {
    if (p === retired[i] || p.indexOf(retired[i] + '/') === 0) { location.replace('/flow/'); return; }
  }
  for (var j = 0; j < moved.length; j++) {
    if (p === moved[j] || p.indexOf(moved[j] + '/') === 0) { p = '/flow' + p; break; }
  }
  if (p === '/flow' || p.indexOf('/flow/') === 0) {
    location.replace('/flow/?p=' + encodeURIComponent(p + s) + h);
  }
})();
</script>
<link rel="icon" href="/favicon.png">
<link rel="stylesheet" href="/site.css">
</head>
<body>
<main class="wrap" style="max-width:560px;padding-top:20vh;padding-bottom:20vh">
  <p class="kicker mono">404</p>
  <h1 style="font-size:34px">Deze pagina bestaat niet (meer).</h1>
  <p class="lead" style="margin-top:16px">This page does not exist.</p>
  <p style="margin-top:28px;display:flex;gap:28px"><a href="/">taktx.io</a><a href="/flow/">TaktX Flow</a></p>
</main>
</body>
</html>
`;
writeFileSync(join(out, '404.html'), notFound);

console.log(`compose-dist: ${out}`);
