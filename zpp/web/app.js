'use strict';
/**
 * ZPP console client.
 *
 * Deliberately dependency-free and framework-free: this ships inside an
 * Android WebView alongside the same code that serves it, so every byte of
 * framework here is a byte of APK. The whole surface is six routes and a
 * handful of DOM nodes.
 *
 * The concurrency model is the interesting part. The API is event-sourced with
 * optimistic concurrency (ETag / If-Match), so this client does NOT retry on
 * 409. An automatic retry would silently overwrite whatever advanced the log
 * between our read and our write — precisely the conflict the caller needs to
 * see. Instead we re-read, show what changed, and let a human press append
 * again. Conflicts are the product working, not a failure to paper over.
 */

const API = (() => {
  const params = new URLSearchParams(location.search);
  // Same-origin by default: the console is meant to be served by the API host.
  // Cross-origin is opt-in so it can be pointed at a deployed gateway, which is
  // the only case where the operator has to widen CORS themselves.
  return params.get('api') || '';
})();

const KEY_STORE = 'zpp.key';
const OWNER_STORE = 'zpp.owner';

const el = (id) => document.getElementById(id);
const ui = {
  gate: el('gate'), gateMsg: el('gate-msg'),
  owner: el('in-owner'), key: el('in-key'), bootstrap: el('in-bootstrap'), remember: el('in-remember'),
  use: el('btn-use'), mint: el('btn-mint'),
  conn: el('conn'), quota: el('quota'),
  app: el('app'), streams: el('streams'), newForm: el('new-stream'), newId: el('in-stream-id'),
  refresh: el('btn-refresh'),
  title: el('cur-title'), rev: el('rev'), verify: el('btn-verify'), rebuild: el('btn-rebuild'),
  composer: el('composer'), type: el('in-type'), payload: el('in-payload'), append: el('btn-append'),
  banner: el('banner'), events: el('events'), state: el('state')
};

/** @type {{key: string, owner: string}} */
const session = { key: '', owner: '' };
let current = null; // {id, revision, etag}
let inflight = 0;

// ---------------------------------------------------------------- transport

class ApiError extends Error {
  constructor(status, body) {
    super(`${status} ${(body && body.error) || ''}`.trim());
    this.status = status;
    this.body = body || {};
  }
}

async function call(method, path, { body, etag } = {}) {
  const headers = { Authorization: `Bearer ${session.key}` };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (etag !== undefined) headers['If-Match'] = etag;

  const res = await fetch(API + path, {
    method,
    headers,
    // Auth is a bearer token, not a cookie, so credentials must stay off:
    // sending them would make this a cross-site request amplifier.
    credentials: 'omit',
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  paintQuota(res);

  if (res.status === 204) return null;
  const text = await res.text();
  let payload = null;
  try { payload = text ? JSON.parse(text) : null; } catch { payload = { error: text.slice(0, 200) }; }
  if (!res.ok) throw new ApiError(res.status, payload);
  return payload;
}

/** Surface the server's own budget accounting so throttling is never a surprise. */
function paintQuota(res) {
  const limit = res.headers.get('ratelimit-limit');
  if (!limit) return;
  const left = res.headers.get('ratelimit-remaining');
  ui.quota.textContent = `${left}/${limit} left`;
  const retry = res.headers.get('retry-after');
  ui.quota.title = retry ? `retry after ${retry}s` : `limit ${limit}/window`;
}

// ------------------------------------------------------------------ chrome

function setConnected(on, owner) {
  ui.conn.textContent = on ? `connected · ${owner}` : 'not connected';
  ui.conn.className = `pill ${on ? 'pill-on' : 'pill-off'}`;
  ui.gate.hidden = on;
  ui.app.hidden = !on;
}

function banner(text, kind = '') {
  ui.banner.textContent = text;
  ui.banner.className = `banner ${kind}`;
  ui.banner.hidden = !text;
}

function busy(on) {
  inflight += on ? 1 : -1;
  if (inflight < 0) inflight = 0;
  // Disable every control while a request is out. Two concurrent appends would
  // race each other into a 409 that the user cannot interpret.
  for (const node of [ui.refresh, ui.verify, ui.rebuild, ui.append, ui.newForm]) {
    node.disabled = on;
  }
}

async function guarded(fn) {
  busy(true);
  try {
    await fn();
  } catch (err) {
    handle(err);
  } finally {
    busy(false);
  }
}

function handle(err) {
  if (err instanceof ApiError) {
    switch (err.status) {
      case 401:
        // The key is gone, expired or revoked. Forget it rather than retrying
        // with a credential that cannot work.
        forgetKey();
        banner('The API key was rejected (401). Paste a working key to reconnect.', 'bad');
        setConnected(false);
        return;
      case 403:
        banner(`Refused by policy (403): ${err.body.error || ''}`, 'bad');
        return;
      case 404:
        banner('Not found (404). It may belong to another tenant, or not exist.', 'warn');
        return;
      case 409:
        // Show the conflict; do NOT auto-retry. See the header comment.
        banner(
          `Conflict (409): you were editing revision ${err.body.expectedVersion}, the log is now at ${err.body.revision}. ` +
          'Nothing was written — reload to see the change, then re-apply yours.',
          'warn'
        );
        if (err.body.revision !== undefined) ui.rev.textContent = `rev ${err.body.revision}`;
        return;
      case 413:
        banner('Payload too large (413).', 'bad');
        return;
      case 429: {
        const retry = err.body && err.body.scope
          ? ` (${err.body.scope} scope)` : '';
        banner(`Rate limited (429)${retry}. Slow down; the budget refills continuously.`, 'warn');
        return;
      }
      default:
        banner(`Server error ${err.status}: ${err.body.error || err.message}`, 'bad');
    }
    return;
  }
  banner(`Cannot reach the API: ${err.message}`, 'bad');
}

// --------------------------------------------------------------- rendering

/**
 * Render the event log.
 *
 * Every string here goes in as textContent. Event fields are attacker-shaped
 * data (a stored campaign is whatever a previous writer put there), so building
 * these rows with innerHTML would make the console a stored-XSS delivery
 * channel against whoever opens it.
 *
 * `GET /events` is a SUMMARY projection by design — it returns stream_version,
 * event_id, type, actor_id, summary, status, reason and recorded_at, but not
 * `payload`. Payloads are unbounded in size and the log is paginated, so
 * shipping them here would make the cheapest query the most expensive one. The
 * payload block below therefore only appears if a caller supplies a richer
 * shape; the summary line is what you actually get from this endpoint.
 */
const COMMITTED = 'COMMITTED';

function renderEvents(rows) {
  ui.events.textContent = '';
  if (!rows.length) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'no events yet';
    ui.events.append(li);
    return;
  }
  for (const ev of rows) {
    const li = document.createElement('li');
    li.className = ev.status && ev.status !== COMMITTED ? 'ev ev-bad' : 'ev';

    const head = document.createElement('div');
    head.className = 'ev-head';
    const v = document.createElement('span');
    v.className = 'ev-v';
    v.textContent = `v${ev.stream_version ?? '?'}`;
    const t = document.createElement('span');
    t.className = 'ev-type';
    t.textContent = ev.type || '(no type)';
    head.append(v, t);

    if (ev.status && ev.status !== COMMITTED) {
      const s = document.createElement('span');
      s.className = 'ev-src';
      s.textContent = ev.reason ? `${ev.status}: ${ev.reason}` : ev.status;
      head.append(s);
    }

    // `summary` is the engine's own one-line description of what happened.
    if (ev.summary) {
      const sum = document.createElement('div');
      sum.className = 'ev-summary';
      sum.textContent = ev.summary;
      li.append(head, sum);
    } else {
      li.append(head);
    }

    // Only rendered when a payload is actually present.
    if (ev.payload !== undefined) {
      const pre = document.createElement('pre');
      pre.className = 'ev-payload';
      pre.textContent = JSON.stringify(ev.payload, null, 1);
      li.append(pre);
    }

    const foot = document.createElement('div');
    foot.className = 'ev-foot';
    foot.textContent = [ev.event_id, ev.actor_id, ev.recorded_at].filter(Boolean).join(' · ');
    li.append(foot);

    ui.events.append(li);
  }
}

function renderStreams(list) {
  ui.streams.textContent = '';
  if (!list.length) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'no streams yet';
    ui.streams.append(li);
    return;
  }
  for (const s of list) {
    const li = document.createElement('li');
    li.className = 'stream';
    if (current && current.id === s.id) li.classList.add('sel');

    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'stream-btn';
    // Same rule as the log: textContent, never innerHTML.
    b.textContent = s.id;
    b.addEventListener('click', () => openStream(s.id));

    const meta = document.createElement('span');
    meta.className = 'stream-meta';
    meta.textContent = `rev ${s.revision}`;
    li.append(b, meta);
    ui.streams.append(li);
  }
}

// -------------------------------------------------------------- operations

async function refreshStreams() {
  const { streams } = await call('GET', '/v1/streams');
  renderStreams(streams);
}

async function openStream(id) {
  const stream = await call('GET', `/v1/streams/${encodeURIComponent(id)}`);
  current = { id: stream.id, revision: stream.revision, etag: stream.etag || `"${stream.revision}"` };
  ui.title.textContent = stream.id;
  ui.rev.textContent = `rev ${stream.revision}`;
  ui.rev.className = 'pill pill-on';
  ui.state.textContent = JSON.stringify(stream.state ?? {}, null, 2);

  const { events } = await call('GET', `/v1/streams/${encodeURIComponent(id)}/events`);
  renderEvents(events);
  renderStreams(await call('GET', '/v1/streams').then((r) => r.streams));
}

async function appendEvent() {
  if (!current) { banner('Select a stream first.', 'warn'); return; }

  const type = ui.type.value.trim();
  if (!type) { banner('An event needs a type.', 'warn'); return; }

  let payload;
  const raw = ui.payload.value.trim();
  try {
    // Empty payload is legitimate; an unparseable one is not.
    payload = raw ? JSON.parse(raw) : {};
  } catch (err) {
    banner(`Payload is not valid JSON: ${err.message}`, 'bad');
    return;
  }

  await call('POST', `/v1/streams/${encodeURIComponent(current.id)}/events`, {
    body: { type, payload, source: 'console' },
    etag: current.etag
  });

  ui.type.value = '';
  ui.payload.value = '';
  banner('');
  await openStream(current.id);
}

// ------------------------------------------------------------------- keys

function saveKey() {
  try {
    if (ui.remember.checked) {
      localStorage.setItem(KEY_STORE, session.key);
      localStorage.setItem(OWNER_STORE, session.owner);
    } else {
      localStorage.removeItem(KEY_STORE);
      localStorage.removeItem(OWNER_STORE);
    }
  } catch {
    // Private mode or a full quota. The key still works for this page load;
    // it simply will not survive a reload, which is the safe direction.
    banner('This browser refused to store the key; it will not persist across reloads.', 'warn');
  }
}

function forgetKey() {
  session.key = '';
  session.owner = '';
  try {
    localStorage.removeItem(KEY_STORE);
    localStorage.removeItem(OWNER_STORE);
  } catch { /* nothing to clean up */ }
}

async function connect(key, owner) {
  session.key = key;
  session.owner = owner || 'unknown';
  // Prove the key before revealing the app: a wrong key should not leave the
  // user staring at an empty console wondering why every list is empty.
  const health = await call('GET', '/health');
  if (health.auth === 'dev' && !key) {
    banner('Server is in dev-auth mode; requests are attributed to the dev owner.', 'warn');
  }
  await refreshStreams();
  setConnected(true, session.owner);
  banner('');
}

async function mintAndConnect() {
  const owner = ui.owner.value.trim();
  const bootstrap = ui.bootstrap.value.trim();
  if (!owner) { banner('An owner id is required to mint a key.', 'warn'); return; }

  const headers = { 'Content-Type': 'application/json' };
  if (bootstrap) headers['Authorization'] = `Bearer ${bootstrap}`;

  const res = await fetch(API + '/v1/streams/__keys', {
    method: 'POST',
    headers,
    credentials: 'omit',
    body: JSON.stringify({ ownerId: owner, label: 'zpp-console' })
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, payload);

  // Show the plaintext exactly once, in the field the user can copy from.
  ui.key.value = payload.key;
  ui.key.type = 'text';
  banner('Key minted. Copy it now — the server keeps only its hash.', 'ok');
  session.owner = payload.ownerId || owner;
  await connect(payload.key, session.owner);
  saveKey();
}

// ------------------------------------------------------------------ wiring

ui.use.addEventListener('click', () => guarded(async () => {
  const key = ui.key.value.trim();
  if (!key) { banner('Paste a key first.', 'warn'); return; }
  const owner = ui.owner.value.trim() || key.split('_')[1];
  await connect(key, owner);
  saveKey();
}));

ui.mint.addEventListener('click', () => guarded(mintAndConnect));
ui.refresh.addEventListener('click', () => guarded(refreshStreams));
ui.verify.addEventListener('click', () => guarded(async () => {
  if (!current) { banner('Select a stream first.', 'warn'); return; }
  const r = await call('GET', `/v1/streams/${encodeURIComponent(current.id)}/verify`);
  banner(`Verified: the snapshot matches a replay of the log at revision ${r.revision}.`, 'ok');
}));

ui.rebuild.addEventListener('click', () => guarded(async () => {
  if (!current) { banner('Select a stream first.', 'warn'); return; }
  const r = await call('POST', `/v1/streams/${encodeURIComponent(current.id)}/rebuild`);
  banner(
    r.repaired
      ? `Rebuilt: repaired ${r.applied} field(s). Drift: ${JSON.stringify(r.drift)}`
      : 'Rebuilt: snapshot already matched the log; nothing to repair.',
    r.repaired ? 'warn' : 'ok'
  );
  await openStream(current.id);
}));

ui.newForm.addEventListener('submit', (e) => {
  e.preventDefault();
  guarded(async () => {
    const id = ui.newId.value.trim();
    if (!id) { banner('A stream needs an id.', 'warn'); return; }
    await call('POST', '/v1/streams', { body: { id } });
    ui.newId.value = '';
    await refreshStreams();
    await openStream(id);
    banner(`Created ${id}.`, 'ok');
  });
});

ui.composer.addEventListener('submit', (e) => {
  e.preventDefault();
  guarded(appendEvent);
});

// Reconnect silently if a key was explicitly remembered.
(function boot() {
  let key = '';
  let owner = '';
  try {
    key = localStorage.getItem(KEY_STORE) || '';
    owner = localStorage.getItem(OWNER_STORE) || '';
  } catch { /* storage unavailable; stay on the gate */ }
  if (!key) return;
  ui.remember.checked = true;
  guarded(() => connect(key, owner));
})();
