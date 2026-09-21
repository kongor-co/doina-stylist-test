import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist');
const languages = ['en', 'de', 'ru', 'ro'];
const files = ['.nojekyll', 'index.html', '404.html', 'app.js', 'styles.css', 'logo.png', 'robots.txt', 'sitemap.xml'];

async function collect(directory, relative = '') {
  const found = [];
  for (const entry of await readdir(path.join(directory, relative), { withFileTypes: true })) {
    const name = path.join(relative, entry.name);
    if (entry.isDirectory()) found.push(...await collect(directory, name));
    else found.push(name);
  }
  return found.sort();
}

for (const lang of languages) {
  const built = await collect(output, lang);
  const published = await collect(root, lang);
  if (JSON.stringify(built) !== JSON.stringify(published)) {
    throw new Error(`Published ${lang} pages do not match the build. Run npm run publish:root.`);
  }
  files.push(...built);
}

for (const name of files) {
  const [built, published] = await Promise.all([
    readFile(path.join(output, name)),
    readFile(path.join(root, name)),
  ]);
  if (!built.equals(published)) {
    throw new Error(`Published ${name} does not match the build. Run npm run publish:root.`);
  }
}
console.log('Checked published root pages against the build.');
