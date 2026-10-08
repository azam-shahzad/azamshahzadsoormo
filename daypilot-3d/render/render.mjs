// Frame-accurate renderer: serves the project, drives the scene one frame at a
// time in headless Chromium and streams PNG frames into ffmpeg.
//
//   node render/render.mjs                      full film -> out/daypilot_video.mp4
//   node render/render.mjs --stills 0,45,150    PNG stills -> out/stills/
//   node render/render.mjs --from 0 --to 300 --out out/tmp/part.mp4
//   node render/render.mjs --scale 0.5 --step 3 quick low-res preview
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FPS = 30, TOTAL = 900;

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, arr) => {
  if (a.startsWith('--')) acc.push([a.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]);
  return acc;
}, []));
const from = +(args.from ?? 0), to = +(args.to ?? TOTAL), step = +(args.step ?? 1);
const scale = +(args.scale ?? 1);
const W = Math.round(1920 * scale), H = Math.round(1080 * scale);

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise(r => server.listen(0, r));
const port = server.address().port;

const browser = await chromium.launch({
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-gpu-sandbox'],
});
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('[page]', m.text()); });
page.on('pageerror', e => console.log('[pageerror]', e.message));
await page.goto(`http://127.0.0.1:${port}/src/index.html?render=1&w=${W}&h=${H}`);
await page.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });

async function grab(f) {
  await page.evaluate(f => window.renderFrame(f), f);
  return page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: W, height: H } });
}

const t0 = Date.now();
if (args.stills) {
  const dir = path.join(ROOT, 'out/stills');
  fs.mkdirSync(dir, { recursive: true });
  for (const s of String(args.stills).split(',')) {
    const f = Math.round(s.includes('s') ? parseFloat(s) * FPS : +s);
    fs.writeFileSync(path.join(dir, `f${String(f).padStart(4, '0')}.png`), await grab(f));
    console.log('still', f, ((Date.now() - t0) / 1000).toFixed(1) + 's');
  }
} else {
  const out = path.resolve(ROOT, args.out ?? 'out/daypilot_video.mp4');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS / step), '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', String(args.crf ?? 16), '-pix_fmt', 'yuv420p', '-r', String(FPS / step), out],
    { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = from; f < to; f += step) {
    const buf = await grab(f);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if ((f - from) % (30 * step) === 0) {
      const done = (f - from) / step + 1, n = Math.ceil((to - from) / step);
      const el = (Date.now() - t0) / 1000;
      console.log(`frame ${f} (${done}/${n})  ${(el / done).toFixed(2)}s/frame  eta ${((n - done) * el / done / 60).toFixed(1)}min`);
    }
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  console.log('wrote', out);
}
await browser.close();
server.close();
