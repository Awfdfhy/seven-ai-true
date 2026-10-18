'use strict';
/**
 * Console end-to-end check in a real browser.
 *
 * The unit tests prove the mount serves four files and refuses everything else.
 * They cannot prove the page WORKS. This drives a real Chromium through the
 * whole path a user takes — mint, connect, create a stream, append an event,
 * see the revision advance — because every one of those steps crosses a
 * contract the unit tests never see: DOM ids, the CSP, the ETag the client
 * captured, and the status codes the error banner branches on.
 *
 * Run: node zpp\test\console.e2e.cjs
 * Exits non-zero on the first failed step. Writes a screenshot to
 * zpp\test\artifacts\console.png on success (and on failure) for inspection.
 */

const http = require('node:http');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright');

const { openDb } = require('../src/db');
const { createStore } = require('../src/store');
const { createAuth, hashKey } = require('../src/auth');
const { createApp } = require('../src/server');
const { createConsole } = require('../src/console');

const ARTIFACTS = path.join(__dirname, 'artifacts');
const BOOTSTRAP_TOKEN = 'e2e-bootstrap-secret-12345';

const steps = [];
function ok(label, detail = '') {
  steps.push(`  PASS  ${label}${detail ? ` — ${detail}` : ''}`);
}
function fail(label, detail) {
  steps.push(`  FAIL  ${label} — ${detail}`);
  throw new Error(`${label}: ${detail}`);
}

async function main() {
  fs.mkdirSync(ARTIFACTS, { recursive: true });

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'zpp-e2e-'));
  const db = await openDb({ file: path.join(dir, 'e2e.sqlite') });
  const store = createStore(db);
  const auth = createAuth(db, { mode: 'required', keyTtlMs: 0, bootstrapToken: BOOTSTRAP_TOKEN });
  // A tiny bucket so the browser's own burst of requests is not throttled.
  const server = http.createServer(createApp(store, auth, {
    limits: { ip: null, owner: null },
    console: {}
  }));
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;

  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Any console error or page error is a failure. A CSP violation shows up
  // here as a console error, so this also proves the policy is satisfiable by
  // the page we actually wrote.
  // We filter out expected 401s from the revocation test.
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Ignore expected 401 from the revoked-key test
      if (!text.includes('401') && !text.includes('Unauthorized')) {
        consoleErrors.push(text);
      }
    }
  });
  page.on('pageerror', (err) => consoleErrors.push(`pageerror: ${err.message}`));

  try {
    // ---- 1. the gate renders -------------------------------------------
    await page.goto(`${base}/console/`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#gate:not([hidden])', { timeout: 10000 });
    if (!(await page.title()).includes('ZPP')) fail('title', await page.title());
    ok('connect gate renders');

    // ---- 2. mint a key through the UI ----------------------------------
    await page.fill('#in-owner', 'e2e-tenant');
    await page.fill('#in-bootstrap', BOOTSTRAP_TOKEN);
    await page.click('#btn-mint');
    await page.waitForSelector('#app:not([hidden])', { timeout: 10000 });
    ok('mint + connect reaches the app view');

    const minted = await page.inputValue('#in-key');
    if (!minted.startsWith('zpp_')) fail('minted key shape', minted.slice(0, 8));
    ok('plaintext key surfaced once', minted.slice(0, 12) + '…');

    // Keep the minted key for step 8 (revocation test)
    const mintedKey = minted;

    // ---- 3. create a stream --------------------------------------------
    await page.fill('#in-stream-id', 'e2e-stream');
    await page.press('#in-stream-id', 'Enter');
    await page.waitForFunction(
      () => document.getElementById('cur-title').textContent === 'e2e-stream',
      null,
      { timeout: 10000 }
    );
    ok('stream created and auto-selected');

    const revAfterCreate = await page.textContent('#rev');
    if (!/rev \d+/.test(revAfterCreate)) fail('revision pill', revAfterCreate);
    ok('revision pill shows a revision', revAfterCreate.trim());

    // ---- 4. append an event --------------------------------------------
    await page.fill('#in-type', 'world.set');
    await page.fill('#in-payload', JSON.stringify({ path: 'weather.state', value: 'rain' }));
    await page.click('#btn-append');

    await page.waitForFunction(
      () => {
        const t = document.getElementById('rev').textContent;
        return /rev [1-9]/.test(t);
      },
      null,
      { timeout: 10000 }
    );
    const revAfterAppend = await page.textContent('#rev');
    ok('revision advanced after append', revAfterAppend.trim());

    // ---- 5. the log shows the event ------------------------------------
    await page.waitForSelector('#events .ev', { timeout: 10000 });
    const evType = await page.textContent('#events .ev:first-child .ev-type');
    if (evType.trim() !== 'world.set') fail('event type in the log', evType);
    ok('committed event appears in the log', evType.trim());

    // ---- 6. the projected state is visible ------------------------------
    const stateText = await page.textContent('#state');
    if (!stateText || stateText.trim() === '{}') fail('state pane', `${stateText}`.slice(0, 80));
    ok('projected state rendered', `${stateText}`.length + ' chars');

    // ---- 7. bad JSON is refused client-side, never sent ----------------
    await page.fill('#in-type', 'world.set');
    await page.fill('#in-payload', '{not json');
    await page.click('#btn-append');
    await page.waitForFunction(
      () => /not valid JSON/i.test(document.getElementById('banner').textContent),
      null,
      { timeout: 5000 }
    );
    ok('malformed payload blocked before the wire');

    // ---- 8. a rejected key sends the client back to the gate -----------
    // Revoke the minted key server-side, then trigger a 401 by refreshing
    await auth.revokeKey(hashKey(mintedKey));
    await page.click('#btn-refresh');
    // Wait for the gate to be visible and the key input to be editable
    await page.waitForSelector('#gate:not([hidden])', { timeout: 5000 });
    await page.waitForSelector('#in-key', { timeout: 2000, state: 'visible' });
    ok('a revoked key returns to the gate');

    // ---- 9. no console errors anywhere in that journey ------------------
    if (consoleErrors.length) {
      fail('no console errors', consoleErrors.slice(0, 4).join(' | '));
    }
    ok('no console errors (CSP satisfied, no uncaught exceptions)');

    await page.screenshot({ path: path.join(ARTIFACTS, 'console.png'), fullPage: true });
    ok('screenshot written', path.join('artifacts', 'console.png'));
  } catch (err) {
    await page.screenshot({ path: path.join(ARTIFACTS, 'console-failure.png'), fullPage: true }).catch(() => {});
    throw err;
  } finally {
    await browser.close();
    await new Promise((r) => server.close(r));
    await db.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

main()
  .then(() => {
    console.log('\nconsole e2e\n' + steps.join('\n'));
    console.log(`\n${steps.length} steps passed\n`);
    process.exit(0);
  })
  .catch((err) => {
    console.error('\nconsole e2e FAILED\n' + steps.join('\n'));
    console.error(`\n  ${err.message}\n`);
    process.exit(1);
  });
