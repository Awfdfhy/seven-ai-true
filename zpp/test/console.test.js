'use strict';
/**
 * Static console mount.
 *
 * The security property under test is the file allowlist: the request path is
 * never joined onto a directory, so traversal has nothing to exploit. These
 * tests attack it with the payloads that actually work against directory-serving
 * code and assert that all of them land on the same 404.
 *
 * The second property is that these assets are PUBLIC. The connect gate has to
 * render before anyone holds a key; a console that 401s its own HTML is a
 * blank page with no error message.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

const { openDb } = require('../src/db');
const { createStore } = require('../src/store');
const { createAuth } = require('../src/auth');
const { createApp } = require('../src/server');
const { createConsole, ASSETS } = require('../src/console');

async function harness(consoleOpts) {
  const db = await openDb({ file: ':memory:' });
  const store = createStore(db);
  const auth = createAuth(db, { mode: 'required' });
  const server = http.createServer(createApp(store, auth, {
    limits: { ip: null, owner: null },
    console: consoleOpts
  }));
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  return {
    db,
    auth,
    base: `http://127.0.0.1:${server.address().port}`,
    teardown: async () => { await new Promise((r) => server.close(r)); await db.close(); }
  };
}

test('console: the gate and its assets are public', async () => {
  const h = await harness({});
  try {
    // No Authorization header anywhere in this test.
    for (const p of ['/console', '/console/', '/console/index.html', '/console/app.js', '/console/app.css']) {
      const res = await fetch(h.base + p);
      assert.equal(res.status, 200, `${p} must load without a key`);
      assert.ok((await res.text()).length > 0, `${p} must not be empty`);
    }
  } finally { await h.teardown(); }
});

test('console: HTML sets a CSP that forbids inline and third-party script', async () => {
  const h = await harness({});
  try {
    const res = await fetch(`${h.base}/console/`);
    const csp = res.headers.get('content-security-policy');
    assert.ok(csp, 'a CSP header is required');
    assert.match(csp, /script-src 'self'/, 'inline script must not be permitted');
    assert.match(csp, /default-src 'none'/);
    assert.match(csp, /frame-ancestors 'none'/);
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
  } finally { await h.teardown(); }
});

test('console: correct content types, so nosniff cannot break it', async () => {
  const h = await harness({});
  try {
    const html = await fetch(`${h.base}/console/`);
    assert.match(html.headers.get('content-type'), /text\/html/);
    const js = await fetch(`${h.base}/console/app.js`);
    assert.match(js.headers.get('content-type'), /javascript/);
    const css = await fetch(`${h.base}/console/app.css`);
    assert.match(css.headers.get('content-type'), /text\/css/);
  } finally { await h.teardown(); }
});

test('console: path traversal cannot escape the allowlist', async () => {
  const h = await harness({});
  try {
    // `new URL()` — used to parse req.url — collapses BOTH literal `..` and
    // percent-encoded `%2e%2e`, because the URL spec treats %2e as `.` when
    // detecting dot-segments. Those attempts therefore never reach the console
    // handler at all: they normalise to an unrelated path, fall through to the
    // API, and answer 401 for an anonymous caller.
    //
    // Forms that are NOT dot-segments (`..%2f`, `....//`, doubled slashes) do
    // reach the handler, and must be refused by name.
    //
    // The invariant across all of them is the same and is what matters: no
    // request ever returns 200 with content from outside the four files.
    const collapses = [
      '/console/../package.json',
      '/console/../../package.json',
      '/console/%2e%2e/package.json',
      '/console/%2e%2e%2f%2e%2e%2fpackage.json'
    ];
    for (const p of collapses) {
      const res = await fetch(h.base + p);
      assert.notEqual(res.status, 200, `${p} must not be served`);
      assert.doesNotMatch(await res.text(), /"name"\s*:/, `${p} leaked package.json`);
    }

    const reachHandler = [
      '/console/..%2fpackage.json',
      '/console/....//package.json',
      '/console//etc/passwd',
      '/console/..%5c..%5cpackage.json'
    ];
    for (const p of reachHandler) {
      const res = await fetch(h.base + p);
      assert.equal(res.status, 404, `${p} must be refused by the allowlist`);
      const body = await res.text();
      assert.equal(body.trim(), 'not found', `${p} must not leak file content`);
    }

    // Raw sockets, so the client cannot normalise the path on the way out.
    const attacks = [
      'GET /console/..%2fpackage.json HTTP/1.1',
      'GET /console/....//package.json HTTP/1.1',
      'GET /console//etc/passwd HTTP/1.1'
    ];
    for (const raw of attacks) {
      const status = await rawRequest(h.base, raw);
      assert.equal(status, 404, `${raw.split(' ')[1]} returned ${status}, expected 404`);
    }
  } finally { await h.teardown(); }
});

/** Send a hand-written request line so the client cannot normalise the path. */
function rawRequest(base, raw) {
  const { port } = new URL(base);
  return new Promise((resolve, reject) => {
    const socket = require('node:net').connect(port, '127.0.0.1', () => {
      socket.write(`${raw}\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n`);
    });
    let buf = '';
    socket.on('data', (d) => { buf += d.toString(); });
    socket.on('end', () => {
      const m = /^HTTP\/1\.\d (\d{3})/.exec(buf);
      resolve(m ? Number(m[1]) : 0);
    });
    socket.on('error', reject);
  });
}

test('console: only the four known names are served', async () => {
  const h = await harness({});
  try {
    assert.equal(ASSETS.size, 4, 'the allowlist must stay a fixed, reviewed set');
    // Sibling files that exist on disk but are not in the map. If this ever
    // turns into a directory mount, these are the first things to leak.
    for (const p of ['/console/secrets.txt', '/console/db/schema.sql', '/console/app.js.map', '/console/src/auth.js']) {
      const res = await fetch(h.base + p);
      assert.equal(res.status, 404, `${p} must not be served`);
    }
    // And one directory above the web root.
    assert.notEqual((await fetch(`${h.base}/console/../src/auth.js`)).status, 200);
  } finally { await h.teardown(); }
});

test('console: ETag revalidation returns 304 with no body', async () => {
  const h = await harness({});
  try {
    const first = await fetch(`${h.base}/console/app.js`);
    const etag = first.headers.get('etag');
    assert.ok(etag, 'an ETag is required for the conditional path to mean anything');

    const second = await fetch(`${h.base}/console/app.js`, { headers: { 'If-None-Match': etag } });
    assert.equal(second.status, 304);
    assert.equal((await second.text()).length, 0);
  } finally { await h.teardown(); }
});

test('console: HEAD works and carries no body', async () => {
  const h = await harness({});
  try {
    const res = await fetch(`${h.base}/console/app.css`, { method: 'HEAD' });
    assert.equal(res.status, 200);
    assert.equal((await res.text()).length, 0);
    assert.match(res.headers.get('content-type'), /text\/css/);
  } finally { await h.teardown(); }
});

test('console: can be disabled entirely', async () => {
  const h = await harness(null);
  try {
    // Auth runs before the route check on every non-/health path, so an
    // anonymous caller is told 401 whether or not the console exists. That is
    // deliberate — it keeps the set of real routes unprobeable — so this test
    // authenticates before asserting the 404.
    assert.equal((await fetch(`${h.base}/console/`)).status, 401);

    const key = await h.auth.registerKey({ ownerId: 'alice' });
    const authed = { headers: { Authorization: `Bearer ${key.plaintext}` } };
    assert.equal((await fetch(`${h.base}/console/`, authed)).status, 404);

    // And the API itself still works, so this is a real disable not a crash.
    assert.equal((await fetch(`${h.base}/health`)).status, 200);
    assert.equal((await fetch(`${h.base}/v1/streams`, authed)).status, 200);
  } finally { await h.teardown(); }
});

test('console: an unknown /console path does not shadow an API route', async () => {
  const h = await harness({});
  try {
    // /v1/... must never be claimed by the console handler.
    assert.equal((await fetch(`${h.base}/v1/streams`)).status, 401);
  } finally { await h.teardown(); }
});

test('console: unit level — handle() declines non-console paths', () => {
  const consolePolicy = createConsole({});
  assert.equal(consolePolicy.handle({ method: 'GET', headers: {} }, '/health'), null);
  assert.equal(consolePolicy.handle({ method: 'GET', headers: {} }, '/v1/streams/abc'), null);
  assert.ok(consolePolicy.handle({ method: 'GET', headers: {} }, '/console/'));
});

test('console: unit level — handle() tolerates a request with no headers', () => {
  // Direct callers must not have to fabricate an IncomingMessage.
  const consolePolicy = createConsole({});
  assert.doesNotThrow(() => consolePolicy.handle({ method: 'GET' }, '/console/app.js'));
});
