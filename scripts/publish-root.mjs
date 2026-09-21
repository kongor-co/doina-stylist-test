import { access, cp, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist');
const files = ['index.html', '404.html', 'app.js', 'styles.css', 'logo.svg', 'favicon.svg', 'robots.txt', 'sitemap.xml'];
const languages = ['en', 'de', 'ru', 'ro'];

await access(path.join(output, 'index.html'));
for (const name of [...files, ...languages]) {
  if (languages.includes(name)) await rm(path.join(root, name), { recursive: true, force: true });
  await cp(path.join(output, name), path.join(root, name), { recursive: true, force: true });
}
await writeFile(path.join(root, '.nojekyll'), '');
console.log('Published generated pages to the repository root.');
