#!/usr/bin/env node
// Tiny local preview server for public/ with clean-URL fallback (mirrors Cloudflare Pages).
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'public');
const PORT = process.env.PORT || 8080;
const TYPES = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.png':'image/png',
  '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp', '.svg':'image/svg+xml', '.json':'application/json' };

function resolve(urlPath) {
  let p = decodeURIComponent(urlPath.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const candidates = [p, p + '.html', path.join(p, 'index.html')];
  for (const c of candidates) {
    const fp = path.join(DIR, c);
    if (fp.startsWith(DIR) && fs.existsSync(fp) && fs.statSync(fp).isFile()) return fp;
  }
  return null;
}

http.createServer((req, res) => {
  const fp = resolve(req.url);
  if (!fp) { res.writeHead(404, { 'Content-Type': 'text/html' }); res.end('<h1>404</h1>'); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(fp)] || 'application/octet-stream' });
  fs.createReadStream(fp).pipe(res);
}).listen(PORT, () => console.log(`Preview: http://localhost:${PORT}`));
