import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const port = Number(process.env.PORT || 4173);
const base = new URL(process.env.SITE_URL || 'https://kongor-co.github.io/doina-stylist-test/').pathname;
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.xml': 'application/xml', '.txt': 'text/plain' };

http.createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, `http://localhost:${port}`).pathname);
  if (!pathname.startsWith(base)) { response.writeHead(404); response.end(); return; }
  const relative = pathname.slice(base.length);
  let target = path.resolve(dist, relative);
  if (!target.startsWith(dist)) { response.writeHead(403); response.end(); return; }
  try {
    if ((await stat(target)).isDirectory()) target = path.join(target, 'index.html');
    const file = await readFile(target);
    response.writeHead(200, { 'content-type': `${types[path.extname(target)] || 'application/octet-stream'}; charset=utf-8`, 'cache-control': 'no-cache' });
    response.end(file);
  } catch (error) {
    response.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
    response.end(await readFile(path.join(dist, '404.html')));
  }
}).listen(port, '127.0.0.1', () => console.log(`Local URL: http://127.0.0.1:${port}${base}`));
