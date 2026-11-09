#!/usr/bin/env node
/**
 * Record each showcase visual as an MP4, organized like the marketing site.
 *
 *   npm run export:visuals
 *   npm run export:visuals -- --only homepage
 *   npm run export:visuals -- --only virtual-office --seconds 8
 *   npm run export:visuals -- --list
 *
 * Output: export/Roam Feature Animations @2x/
 *
 * The page is recorded at the website's 1× CSS size (1440×900) so layout
 * does not reflow. Each clip is cropped to the visual, then the file is
 * stored at 2× pixels (retina-sized), same as an @2x image.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import ffmpegPath from 'ffmpeg-static';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_ROOT = path.join(ROOT, 'export', 'Roam Feature Animations @2x');
const TMP_DIR = path.join(ROOT, 'export', '.tmp-videos');

const VIEWPORT = { width: 1440, height: 900 };
const SCALE = 2;
const FPS = 30;
const DEFAULT_SECONDS = 10;
const DEFAULT_PORT = Number(process.env.EXPORT_PORT || 5173);
const BASE = process.env.EXPORT_BASE || `http://127.0.0.1:${DEFAULT_PORT}`;

function parseArgs(argv) {
  const args = { only: null, seconds: DEFAULT_SECONDS, list: false, skipExisting: true };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--list') args.list = true;
    else if (a === '--no-skip') args.skipExisting = false;
    else if (a === '--only') args.only = argv[++i];
    else if (a === '--seconds') args.seconds = Number(argv[++i]);
  }
  return args;
}

async function portOpen(port) {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/`, { method: 'HEAD' });
    return res.ok || res.status === 404 || res.status === 200;
  } catch {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/`);
      return res.ok || res.status >= 200;
    } catch {
      return false;
    }
  }
}

async function ensureServer() {
  if (await portOpen(DEFAULT_PORT)) {
    console.log(`Using existing server at ${BASE}`);
    return null;
  }
  console.log(`Starting Vite on ${DEFAULT_PORT}…`);
  const child = spawn('npx', ['vite', '--host', '127.0.0.1', '--port', String(DEFAULT_PORT), '--strictPort'], {
    cwd: ROOT,
    stdio: 'pipe',
    env: { ...process.env, BROWSER: 'none' },
  });
  child.stdout.on('data', (d) => process.stdout.write(d));
  child.stderr.on('data', (d) => process.stderr.write(d));
  const start = Date.now();
  while (Date.now() - start < 30000) {
    if (await portOpen(DEFAULT_PORT)) return child;
    await new Promise((r) => setTimeout(r, 250));
  }
  child.kill();
  throw new Error('Vite did not start in time');
}

function even(n) {
  return Math.max(2, Math.floor(n / 2) * 2);
}

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpegPath, args, { stdio: 'pipe' });
    let err = '';
    child.stderr.on('data', (d) => { err += d.toString(); });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg failed (${code}): ${err.slice(-800)}`));
    });
  });
}

function ffmpegFromImageDir(framesDir, outputMp4, frameCount, seconds, w, h) {
  const capturedFps = frameCount / seconds;
  const vf = capturedFps < 28
    ? `scale=${w}:${h}:flags=lanczos,minterpolate=fps=${FPS}:mi_mode=blend`
    : `scale=${w}:${h}:flags=lanczos`;
  return runFfmpeg([
    '-y',
    '-framerate', String(capturedFps),
    '-start_number', '0',
    '-i', path.join(framesDir, '%05d.jpg'),
    '-an',
    '-vf', vf,
    '-r', String(FPS),
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', 'medium',
    '-crf', '17',
    '-movflags', '+faststart',
    outputMp4,
  ]);
}

async function loadCatalog(page) {
  await page.goto(`${BASE}/#/export`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => Array.isArray(window.__EXPORT_CATALOG__) && window.__EXPORT_CATALOG__.length > 0, { timeout: 60000 });
  return page.evaluate(() => window.__EXPORT_CATALOG__);
}

function clampClip(clip) {
  const x = Math.max(0, Math.min(VIEWPORT.width - 2, clip.x));
  const y = Math.max(0, Math.min(VIEWPORT.height - 2, clip.y));
  const width = Math.max(2, Math.min(clip.width, VIEWPORT.width - x));
  const height = Math.max(2, Math.min(clip.height, VIEWPORT.height - y));
  return { x, y, width, height };
}

async function recordClip(browser, item, destPath, seconds) {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    reducedMotion: 'no-preference',
  });
  const page = await context.newPage();
  await page.addInitScript(() => {
    window.__EXPORT_READY__ = false;
  });
  await page.goto(`${BASE}/${item.hash}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.addStyleTag({
    content: '* { cursor: none !important; } html, body, .fp-export-page { overflow: hidden !important; background: #000 !important; }',
  });
  await page.waitForFunction(
    () => window.__EXPORT_READY__ === true && typeof window.__EXPORT_CLIP__ === 'function',
    { timeout: 90000 },
  );
  const clip = clampClip(await page.evaluate(() => window.__EXPORT_CLIP__()));
  const outW = even(clip.width * SCALE);
  const outH = even(clip.height * SCALE);

  const client = await page.context().newCDPSession(page);
  const interval = 1000 / FPS;
  const started = Date.now();
  const deadline = started + seconds * 1000;
  const frames = [];
  let n = 0;
  while (Date.now() < deadline) {
    const target = started + n * interval;
    const wait = target - Date.now();
    if (wait > 1) await new Promise((r) => setTimeout(r, wait));
    const { data } = await client.send('Page.captureScreenshot', {
      format: 'jpeg',
      quality: 70,
      fromSurface: true,
      captureBeyondViewport: false,
      clip: {
        x: clip.x,
        y: clip.y,
        width: clip.width,
        height: clip.height,
        scale: 1,
      },
    });
    frames.push(Buffer.from(data, 'base64'));
    n += 1;
  }
  await page.close();
  await context.close();

  if (frames.length < 2) {
    throw new Error(`too few frames (${frames.length})`);
  }

  const capturedFps = frames.length / seconds;
  console.log(`  clip ${clip.width}×${clip.height} @1× → ${outW}×${outH} @2×  ${frames.length} frames (${capturedFps.toFixed(1)} captured fps → ${FPS} fps)`);

  const clipDir = path.join(TMP_DIR, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
  await fs.mkdir(clipDir, { recursive: true });
  await Promise.all(frames.map((buf, i) =>
    fs.writeFile(path.join(clipDir, `${String(i).padStart(5, '0')}.jpg`), buf)
  ));

  await fs.mkdir(path.dirname(destPath), { recursive: true });
  await ffmpegFromImageDir(clipDir, destPath, frames.length, seconds, outW, outH);
  await fs.rm(clipDir, { recursive: true, force: true });
}

function writeReadme(catalog) {
  const byFolder = new Map();
  for (const item of catalog) {
    if (!byFolder.has(item.folder)) byFolder.set(item.folder, []);
    byFolder.get(item.folder).push(item);
  }
  const lines = [
    '# Roam Feature Animations',
    '',
    'Clips of the animated visuals on the Roam marketing site. These are not screen recordings of a product build — they are the in-browser React/CSS animations, exported as MP4.',
    '',
    `Recorded ${new Date().toISOString().slice(0, 10)}. ${catalog.length} clips, ~${DEFAULT_SECONDS}s each at ${FPS}fps. Same 1× layout as the website, stored at ${SCALE}× pixels, cropped to the visual, H.264.`,
    '',
    'Folders follow the website: Homepage, then each product page in the same order as the nav.',
    '',
  ];
  for (const [folder, items] of byFolder) {
    lines.push(`## ${folder}`);
    for (const item of items) {
      lines.push(`- ${item.fileName}`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!ffmpegPath) throw new Error('ffmpeg-static did not resolve a binary');

  let server = null;
  try {
    server = await ensureServer();
    const browser = await chromium.launch({
      args: [
        '--autoplay-policy=no-user-gesture-required',
        '--disable-frame-rate-limit',
      ],
    });
    const setup = await browser.newContext({ viewport: VIEWPORT });
    const page = await setup.newPage();
    const catalog = await loadCatalog(page);
    await setup.close();

    let items = catalog;
    if (args.only) {
      const needle = args.only.toLowerCase();
      if (needle.includes('/')) {
        const [feat, sect] = needle.split('/');
        items = catalog.filter((c) =>
          c.feature === feat && (!sect || c.section === sect || c.section.includes(sect))
        );
      } else {
        items = catalog.filter((c) =>
          c.feature === needle ||
          c.folder.toLowerCase().includes(needle) ||
          c.section === needle
        );
      }
      if (!items.length) {
        console.error(`No clips matched --only ${args.only}`);
        console.error('Features:', [...new Set(catalog.map((c) => c.feature))].join(', '));
        process.exitCode = 1;
        await browser.close();
        return;
      }
    }

    if (args.list) {
      for (const item of items) {
        console.log(`${item.folder}/${item.fileName}  ${item.hash}`);
      }
      console.log(`${items.length} clips`);
      await browser.close();
      return;
    }

    await fs.mkdir(OUT_ROOT, { recursive: true });
    await fs.mkdir(TMP_DIR, { recursive: true });
    await fs.rm(path.join(OUT_ROOT, '07 Pizza'), { recursive: true, force: true });
    await fs.writeFile(path.join(OUT_ROOT, 'README.md'), writeReadme(catalog));
    await fs.writeFile(path.join(OUT_ROOT, 'manifest.json'), JSON.stringify(catalog, null, 2));

    console.log(`Recording ${items.length} clips (${args.seconds}s each) → ${OUT_ROOT}`);
    let done = 0;
    for (const item of items) {
      const dest = path.join(OUT_ROOT, item.folder, item.fileName);
      done += 1;
      if (args.skipExisting) {
        try {
          const st = await fs.stat(dest);
          if (st.size > 10000) {
            console.log(`[${done}/${items.length}] skip ${item.folder}/${item.fileName}`);
            continue;
          }
        } catch {}
      }
      console.log(`[${done}/${items.length}] ${item.folder}/${item.fileName}`);
      try {
        await recordClip(browser, item, dest, args.seconds);
        const st = await fs.stat(dest);
        console.log(`  wrote ${(st.size / 1024).toFixed(0)} KB`);
      } catch (err) {
        console.error(`  failed: ${err.message}`);
      }
    }

    await browser.close();
    console.log(`Done. Folder:\n  ${OUT_ROOT}`);
  } finally {
    if (server) server.kill();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
