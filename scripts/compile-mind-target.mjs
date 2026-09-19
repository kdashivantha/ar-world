/**
 * Compiles public/ar/world-map.png into public/ar/world-map.mind using MindAR's
 * browser Compiler via Puppeteer (avoids node-canvas on Windows).
 */
import puppeteer from 'puppeteer';
import { writeFileSync, existsSync, createReadStream } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const mapPath = join(root, 'public', 'ar', 'world-map.png');
const outPath = join(root, 'public', 'ar', 'world-map.mind');
const distDir = join(root, 'node_modules', 'mind-ar', 'dist');

if (!existsSync(mapPath)) {
  console.error('Missing', mapPath);
  process.exit(1);
}
if (!existsSync(join(distDir, 'mindar-image.prod.js'))) {
  console.error('Missing mind-ar dist. Run: npm install mind-ar --ignore-scripts');
  process.exit(1);
}

const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
</head>
<body>
<script type="module">
  import '/mindar-image.prod.js';
  const run = async () => {
    const Compiler = window.MINDAR.IMAGE.Compiler;
    const compiler = new Compiler();
    const img = new Image();
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = rej;
      img.src = '/world-map.png';
    });
    await compiler.compileImageTargets([img], () => {});
    const buffer = await compiler.exportData();
    window.__MIND_BUFFER__ = Array.from(new Uint8Array(buffer));
    window.__DONE__ = true;
  };
  run().catch((e) => {
    window.__ERROR__ = String(e && e.stack || e);
    window.__DONE__ = true;
  });
</script>
</body>
</html>`;

const mime = {
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.html': 'text/html',
};

const server = createServer((req, res) => {
  const url = req.url?.split('?')[0] ?? '/';
  if (url === '/' || url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
    return;
  }
  if (url === '/world-map.png') {
    res.writeHead(200, { 'Content-Type': 'image/png' });
    createReadStream(mapPath).pipe(res);
    return;
  }
  const file = join(distDir, url.replace(/^\//, ''));
  if (existsSync(file) && file.startsWith(distDir)) {
    const ext = file.slice(file.lastIndexOf('.'));
    res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
    createReadStream(file).pipe(res);
    return;
  }
  res.writeHead(404);
  res.end();
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();
console.log('Compile server on', port);

const browser = await puppeteer.launch({
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--enable-webgl',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--ignore-gpu-blocklist',
  ],
  timeout: 120000,
  protocolTimeout: 120000,
  ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}),
});
const page = await browser.newPage();
page.on('console', (msg) => console.log('browser:', msg.text()));
page.on('pageerror', (err) => console.error('pageerror:', err.message));
page.setDefaultTimeout(300000);
await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForFunction('window.__DONE__ === true', { timeout: 300000 });
const error = await page.evaluate(() => window.__ERROR__);
if (error) {
  console.error('Compile failed:', error);
  await browser.close();
  server.close();
  process.exit(1);
}
const bytes = await page.evaluate(() => window.__MIND_BUFFER__);
writeFileSync(outPath, Buffer.from(bytes));
console.log('Wrote', outPath, bytes.length, 'bytes');
await browser.close();
server.close();
