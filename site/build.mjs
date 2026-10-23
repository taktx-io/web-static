#!/usr/bin/env node
// Renders site/template.html with site/i18n/<lang>.json into dist/site/.
//   {{a.b}}            escaped text
//   {{{a.b}}}          raw HTML
//   {{#each a.b}}…{{/each}}   loop; inside, {{.}} is the item, {{key}} a field of it
//   {{#nl}}…{{/nl}}    only when lang === "nl" (same for any lang code)
// Deliberately tiny: no dependencies, no logic in the template beyond this.

import { readFileSync, writeFileSync, mkdirSync, cpSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '..', 'dist', 'site');
const template = readFileSync(join(here, 'template.html'), 'utf8');

const escape = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const get = (ctx, path) => {
  if (path === '.') return ctx.stack[ctx.stack.length - 1];
  for (let i = ctx.stack.length - 1; i >= 0; i--) {
    const scope = ctx.stack[i];
    if (scope && typeof scope === 'object') {
      const v = path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), scope);
      if (v !== undefined) return v;
    }
  }
  throw new Error(`Missing key: ${path}`);
};

function render(src, ctx) {
  // language blocks
  src = src.replace(/\{\{#([a-z]{2})\}\}([\s\S]*?)\{\{\/\1\}\}/g, (_, code, body) =>
    ctx.lang === code ? body : '');
  // loops
  src = src.replace(/\{\{#each ([\w.]+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (_, path, body) => {
    const list = get(ctx, path);
    return list.map((item) => render(body, { ...ctx, stack: [...ctx.stack, item] })).join('');
  });
  // raw then escaped
  src = src.replace(/\{\{\{([\w.]+)\}\}\}/g, (_, path) => String(get(ctx, path)));
  src = src.replace(/\{\{([\w.]+)\}\}/g, (_, path) => escape(get(ctx, path)));
  return src;
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'assets'), join(out, 'assets'), { recursive: true });
cpSync(join(here, 'site.css'), join(out, 'site.css'));

const year = String(new Date().getFullYear());
for (const file of readdirSync(join(here, 'i18n'))) {
  const strings = JSON.parse(readFileSync(join(here, 'i18n', file), 'utf8'));
  strings.footer.copyright = strings.footer.copyright.replace('{year}', year);
  const html = render(template, { lang: strings.lang, stack: [strings] });
  const target = join(out, strings.path.replace(/^\//, ''), 'index.html');
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, html);
  console.log(`site: ${strings.path} → ${target}`);
}
