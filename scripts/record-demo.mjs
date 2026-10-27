// Records a short walkthrough of the app as an animated GIF for the README.
//
//   npm run dev            (in another terminal)
//   npm run demo:record
//
// Drives the app with Playwright at phone size, captures frames while it
// runs, and encodes docs/demo.gif. Uses the installed Google Chrome, so no
// browser download is needed. Seed data is reset before and after.

import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';
import gifenc from 'gifenc';
import { PNG } from 'pngjs';
import { createSeed } from '../server/seed.js';

const { applyPalette, GIFEncoder, quantize } = gifenc;

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const OUT = process.env.OUT || 'docs/demo.gif';
const FRAME_MS = 110;
const VIEWPORT = { width: 390, height: 844 };
const demoUser = createSeed().users.find((u) => u.id === 'u1');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Caption pill and tap markers, drawn into the page so they show in the frames.
function overlay() {
  const install = () => {
    if (document.getElementById('demo-caption')) return;
    const style = document.createElement('style');
    style.textContent = `
      #demo-caption{position:fixed;z-index:99;top:8px;left:50%;transform:translateX(-50%);padding:6px 14px;
        border-radius:999px;background:rgba(31,26,23,.9);color:#fff;font:600 13px Inter,system-ui,sans-serif;
        white-space:nowrap;pointer-events:none;transition:opacity .2s}
      .demo-tap{position:fixed;z-index:100;width:36px;height:36px;margin:-18px 0 0 -18px;border-radius:50%;
        background:rgba(200,147,95,.35);border:3px solid rgba(111,78,55,.9);pointer-events:none}`;
    document.head.append(style);
    const caption = document.createElement('div');
    caption.id = 'demo-caption';
    caption.style.opacity = '0';
    document.body.append(caption);
  };
  window.__demoCaption = (text) => {
    install();
    const c = document.getElementById('demo-caption');
    c.textContent = text;
    c.style.opacity = text ? '1' : '0';
  };
  window.__demoTap = (x, y) => {
    install();
    const dot = document.createElement('div');
    dot.className = 'demo-tap';
    dot.style.left = `${x}px`;
    dot.style.top = `${y}px`;
    document.body.append(dot);
    setTimeout(() => dot.remove(), 450);
  };
}

async function resetData() {
  const res = await fetch(`${BASE_URL}/api/test/reset`, { method: 'POST' });
  if (!res.ok) throw new Error(`Reset failed (${res.status}). Is "npm run dev" running?`);
}

async function walkthrough(page) {
  const byId = (id) => page.getByTestId(id);
  const caption = (text) => page.evaluate((t) => window.__demoCaption(t), text);
  const tap = async (locator, pause = 400) => {
    await locator.scrollIntoViewIfNeeded();
    const box = await locator.boundingBox();
    await page.evaluate(([x, y]) => window.__demoTap(x, y), [box.x + box.width / 2, box.y + box.height / 2]);
    await sleep(250);
    await locator.click();
    await sleep(pause);
  };
  const typeInto = async (id, text) => {
    await tap(byId(id), 100);
    await byId(id).pressSequentially(text, { delay: 40 });
    await sleep(200);
  };
  const scroll = async (y, pause = 800) => {
    await page.evaluate((dy) => window.scrollBy({ top: dy, behavior: 'smooth' }), y);
    await sleep(pause);
  };

  await page.goto(`${BASE_URL}/login`);
  await byId('login-submit').waitFor();
  await caption('Sign in');
  await sleep(600);
  await typeInto('login-email', demoUser.email);
  await typeInto('login-password', demoUser.password);
  await tap(byId('login-submit'), 900);

  await byId('product-grid').waitFor();
  await caption('Browse all products');
  await sleep(500);
  await scroll(700, 1000);
  await scroll(-700, 900);
  await caption('Filter by category');
  await tap(byId('category-mugs'), 900);
  await tap(byId('category-all'), 900);

  await caption('Save favorites');
  await tap(byId('fav-toggle-sumatra-mandheling'), 700);

  await caption('Product options');
  await tap(byId('product-link-ethiopia-yirgacheffe'), 700);
  await tap(byId('size-500g'));
  await tap(byId('grind-espresso'));
  await tap(byId('qty-increase'));
  await caption('Add to cart');
  await tap(byId('add-to-cart'), 1400);

  await caption('Favorites');
  await tap(byId('tab-favorites'), 900);
  await tap(byId('favorite-add-to-cart-ceramic-mug'), 1200);

  await caption('Cart and promo codes');
  await tap(byId('tab-cart'), 900);
  await typeInto('promo-code', 'BREW10');
  await tap(byId('promo-apply'), 900);
  await scroll(400, 900);
  await caption('Checkout');
  await tap(byId('cart-checkout'), 800);
  await tap(byId('delivery-express'), 600);
  await typeInto('card-number', '4242424242424242');
  await typeInto('card-expiry', '1230');
  await typeInto('card-cvc', '123');
  await tap(byId('place-order'), 400);

  await byId('order-number').waitFor();
  await caption('Order placed');
  await sleep(1800);

  await caption('Profile');
  await tap(byId('tab-profile'), 1200);
  await caption('Notification preferences');
  await tap(byId('profile-menu-notifications'), 700);
  await tap(byId('notify-promotions'), 300);
  await tap(byId('profile-save'), 1000);
  await tap(byId('settings-back'), 700);

  await caption('Dark mode');
  await tap(byId('profile-menu-appearance'), 700);
  await tap(byId('appearance-select'), 200);
  await byId('appearance-select').selectOption('dark');
  await sleep(500);
  await tap(byId('profile-save'), 900);
  await tap(byId('settings-back'), 800);
  await tap(byId('tab-home'), 1800);
  await caption('');
  await sleep(600);
}

// Unchanged pixels are written as transparent so each frame only stores what moved.
function encodeGif(frames) {
  const gif = GIFEncoder();
  let previous = null;
  frames.forEach((frame, i) => {
    const { data, width, height } = PNG.sync.read(frame.buf);
    const palette = quantize(data, 255);
    const index = applyPalette(data, palette);
    const transparentIndex = palette.length;
    let transparent = false;
    if (previous) {
      for (let p = 0, px = 0; p < data.length; p += 4, px++) {
        if (
          data[p] === previous[p] &&
          data[p + 1] === previous[p + 1] &&
          data[p + 2] === previous[p + 2]
        ) {
          index[px] = transparentIndex;
          transparent = true;
        }
      }
    }
    const next = frames[i + 1];
    const delay = next ? next.t - frame.t : 2000;
    gif.writeFrame(index, width, height, {
      palette: transparent ? [...palette, [255, 0, 255]] : palette,
      delay,
      transparent,
      transparentIndex,
      dispose: 1,
    });
    previous = data;
  });
  gif.finish();
  return gif.bytes();
}

async function main() {
  await resetData();
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1, colorScheme: 'light' });
  await context.addInitScript(overlay);
  const page = await context.newPage();

  // Chrome's screencast sends a frame whenever the screen changes. Frames that
  // arrive within FRAME_MS of the last one replace it, capping the frame rate.
  const frames = [];
  const cdp = await context.newCDPSession(page);
  cdp.on('Page.screencastFrame', ({ data, sessionId, metadata }) => {
    cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
    const t = metadata.timestamp * 1000;
    const buf = Buffer.from(data, 'base64');
    const last = frames[frames.length - 1];
    if (last && t - last.t < FRAME_MS) last.buf = buf;
    else frames.push({ t, buf });
  });
  await cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1 });

  try {
    await walkthrough(page);
  } finally {
    await cdp.send('Page.stopScreencast').catch(() => {});
    await browser.close();
    await resetData();
  }

  // The first frames are the blank page before /login loads.
  const start = frames.findIndex((f, i) => i > 0 && f.buf.length > 20000);
  const bytes = encodeGif(frames.slice(Math.max(0, start)));
  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, bytes);
  const seconds = ((frames.at(-1).t - frames[0].t) / 1000).toFixed(1);
  console.log(`Wrote ${OUT}: ${frames.length} frames, ${seconds}s, ${(bytes.length / 1024 / 1024).toFixed(1)} MB`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
