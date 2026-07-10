#!/usr/bin/env node
/**
 * One-time documentation snapshot.
 *
 * Fetches the live documentation from the (still-running) TaktX backend and
 * bakes it into static assets so the site no longer needs the API:
 *
 *   src/assets/docs/tree.json           full nested section tree
 *   src/assets/docs/content/<id>.json   { sectionId, content } (HTML, image URLs rewritten)
 *   src/assets/docs/search-index.json   flat list with plain text for client-side search
 *   src/assets/docs/images/<file>       every referenced upload image
 *
 * Run this ONCE, while https://taktx.io is still online:
 *
 *   node tools/snapshot-docs.mjs
 *
 * Then commit the generated files. After that the backend can be shut down.
 *
 * Override the source with:  BASE_URL=https://taktx.io node tools/snapshot-docs.mjs
 */
import { writeFile, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = (process.env.BASE_URL || 'https://taktx.io').replace(/\/+$/, '');
const API = `${BASE}/api/documentation`;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '..', 'src', 'assets', 'docs');
const CONTENT_DIR = path.join(OUT, 'content');
const IMAGES_DIR = path.join(OUT, 'images');

async function getJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`GET ${url} -> ${r.status}`);
  return r.json();
}

function collectIds(nodes, acc = []) {
  for (const n of nodes) {
    acc.push(n);
    if (Array.isArray(n.subsections) && n.subsections.length) collectIds(n.subsections, acc);
  }
  return acc;
}

function stripHtml(html) {
  return (html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

// Rewrite any reference to /api/documentation/uploads/<file> (with any number
// of leading ../ segments) to the local, bundled image path.
function rewriteImageUrls(html, downloaded) {
  if (!html) return html;
  const re = /((?:\.\.\/)*)(?:\/)?api\/documentation\/uploads\/([^"')\s]+)/g;
  return html.replace(re, (_m, _dots, file) => {
    downloaded.add(file);
    return `assets/docs/images/${file}`;
  });
}

async function downloadImage(file) {
  const url = `${API}/uploads/${file}`;
  const r = await fetch(url);
  if (!r.ok) { console.warn(`  ! image ${file} -> ${r.status}`); return false; }
  const buf = Buffer.from(await r.arrayBuffer());
  await writeFile(path.join(IMAGES_DIR, file), buf);
  return true;
}

async function main() {
  console.log(`Snapshotting docs from ${API}`);
  // fresh output dirs
  if (existsSync(CONTENT_DIR)) await rm(CONTENT_DIR, { recursive: true, force: true });
  if (existsSync(IMAGES_DIR)) await rm(IMAGES_DIR, { recursive: true, force: true });
  await mkdir(CONTENT_DIR, { recursive: true });
  await mkdir(IMAGES_DIR, { recursive: true });

  // 1) tree
  const tree = await getJSON(`${API}/sections`);
  await writeFile(path.join(OUT, 'tree.json'), JSON.stringify(tree, null, 2));
  const nodes = collectIds(tree);
  console.log(`  ${nodes.length} sections`);

  // 2) content + 3) search index
  const images = new Set();
  const searchIndex = [];
  for (const n of nodes) {
    let content = '';
    try {
      const c = await getJSON(`${API}/sections/${n.id}/content`);
      content = rewriteImageUrls(c?.content || '', images);
    } catch (e) {
      console.warn(`  ! content ${n.id}: ${e.message}`);
    }
    await writeFile(
      path.join(CONTENT_DIR, `${n.id}.json`),
      JSON.stringify({ sectionId: n.id, content }, null, 2)
    );
    searchIndex.push({
      sectionId: n.id,
      title: n.title,
      description: n.description,
      slug: n.slug,
      parentSectionId: n.parentSectionId ?? null,
      isActive: n.isActive !== false,
      order: n.order ?? 0,
      icon: n.icon || '',
      text: stripHtml(content)
    });
  }
  await writeFile(path.join(OUT, 'search-index.json'), JSON.stringify(searchIndex, null, 2));
  console.log(`  wrote ${nodes.length} content files + search-index.json`);

  // 4) images
  console.log(`  downloading ${images.size} images...`);
  let ok = 0;
  for (const file of images) { if (await downloadImage(file)) ok++; }
  console.log(`  downloaded ${ok}/${images.size} images`);

  console.log('Done. Review & commit src/assets/docs/.');
}

main().catch(e => { console.error(e); process.exit(1); });
