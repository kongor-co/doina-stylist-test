import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const languages = ['en', 'de', 'ru', 'ro'];
const siteUrl = new URL(process.env.SITE_URL || 'https://kongor-co.github.io/doina-stylist-test/');
const base = siteUrl.pathname.endsWith('/') ? siteUrl.pathname : `${siteUrl.pathname}/`;
const routes = ['', 'services/', 'pj-collection/', 'about/', 'media/', 'contact/', 'privacy/', 'imprint/'];
const reference = JSON.parse(await readFile(path.join(root, 'locales/en.json'), 'utf8'));
const missing = [];
function compareKeys(expected, actual, location) {
  for (const [key, value] of Object.entries(expected)) {
    const next = `${location}.${key}`;
    if (!(key in actual)) missing.push(next);
    else if (value && typeof value === 'object' && !Array.isArray(value)) compareKeys(value, actual[key], next);
  }
}
for (const lang of languages) {
  const translation = JSON.parse(await readFile(path.join(root, `locales/${lang}.json`), 'utf8'));
  compareKeys(reference, translation, lang);
  for (const route of routes) {
    const html = await readFile(path.join(dist, lang, route, 'index.html'), 'utf8');
    if (!html.includes(`<html lang="${lang}">`)) missing.push(`${lang}/${route}: language`);
    if (!html.includes('rel="canonical"')) missing.push(`${lang}/${route}: canonical`);
    if (!html.includes('hreflang="ro"')) missing.push(`${lang}/${route}: language alternatives`);
  }
}
if (missing.length) throw new Error(`Missing translations or page metadata:\n${missing.join('\n')}`);

async function scan(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) await scan(full);
    else if (entry.name.endsWith('.html')) {
      const html = await readFile(full, 'utf8');
      const refs = [...html.matchAll(/(?:src|href)="([^"#]+)"/g)].map((match) => match[1]);
      for (const ref of refs) {
        if (!ref.startsWith(base)) continue;
        let target = path.join(dist, ref.slice(base.length));
        try {
          if ((await stat(target)).isDirectory()) target = path.join(target, 'index.html');
          await stat(target);
        } catch (error) { missing.push(`${path.relative(dist, full)}: ${ref}`); }
      }
    }
  }
}
await scan(dist);
if (missing.length) throw new Error(`Broken local links:\n${missing.join('\n')}`);
console.log('Checked translations, localized routes, metadata and local links.');
