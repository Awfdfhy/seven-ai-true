const VERSION = 2;
const DEFAULT_MAX_RESULTS = 8;
const MAX_RESULTS = 10;
const MAX_QUERY_CHARS = 320;
const MAX_REQUEST_BODY_CHARS = 16 * 1024;
const MAX_READ_BYTES = 768 * 1024;
const MAX_READ_CHARS = 20_000;
const MAX_REDIRECTS = 3;
const DEFAULT_RATE_PER_MINUTE = 60;
const SEARCH_TOTAL_BUDGET_MS = 5800;
const SEARCH_BACKEND_ATTEMPT_MS = 3200;
const READER_FETCH_TIMEOUT_MS = 6000;
const RATE_BUCKETS = new Map();

function json(data, status = 200, request = null, env = {}) {
  const headers = {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    ...corsHeaders(request, env),
  };
  return new Response(JSON.stringify(data), { status, headers });
}

function corsHeaders(request, env) {
  const configured = String(env?.ALLOWED_ORIGIN || "*").trim();
  const origin = request?.headers?.get?.("origin") || "";
  const allowOrigin = configured === "*" ? "*" : (origin === configured ? configured : configured);
  return {
    "access-control-allow-origin": allowOrigin,
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,x-seven-gateway-key",
    "access-control-max-age": "86400",
    "vary": "Origin",
  };
}

function timingSafeStringEqual(a, b) {
  const x = String(a ?? "");
  const y = String(b ?? "");
  let diff = x.length ^ y.length;
  const max = Math.max(x.length, y.length);
  for (let i = 0; i < max; i++) {
    diff |= (x.charCodeAt(i % Math.max(1, x.length)) || 0) ^ (y.charCodeAt(i % Math.max(1, y.length)) || 0);
  }
  return diff === 0;
}

export function isAuthorized(request, env = {}) {
  const required = String(env.GATEWAY_CLIENT_KEY || "");
  if (!required) return true;
  return timingSafeStringEqual(request.headers.get("x-seven-gateway-key") || "", required);
}

function clientRateKey(request) {
  return request.headers.get("cf-connecting-ip") || "anonymous";
}

function consumeRateLimit(request, env = {}, now = Date.now()) {
  const limit = Math.max(10, Math.min(600, Number(env.RATE_LIMIT_PER_MINUTE) || DEFAULT_RATE_PER_MINUTE));
  const key = clientRateKey(request);
  const minute = Math.floor(now / 60_000);
  const old = RATE_BUCKETS.get(key);
  const row = old && old.minute === minute ? old : { minute, count: 0 };
  row.count += 1;
  RATE_BUCKETS.set(key, row);
  if (RATE_BUCKETS.size > 500) {
    for (const [k, v] of RATE_BUCKETS) {
      if (v.minute < minute - 1) RATE_BUCKETS.delete(k);
      if (RATE_BUCKETS.size <= 400) break;
    }
  }
  return row.count <= limit;
}

function timedFetch(fetchImpl, timeoutMs) {
  return async (url, options = {}) => {
    const ms = Math.max(250, Number(timeoutMs) || 1000);
    if (typeof AbortController !== "function") {
      return Promise.race([
        fetchImpl(url, options),
        new Promise((_, reject) => setTimeout(() => reject(new Error("upstream_timeout")), ms)),
      ]);
    }
    const controller = new AbortController();
    const upstreamSignal = options?.signal;
    let detach = null;
    if (upstreamSignal) {
      if (upstreamSignal.aborted) controller.abort();
      else {
        const forward = () => controller.abort();
        upstreamSignal.addEventListener?.("abort", forward, { once: true });
        detach = () => upstreamSignal.removeEventListener?.("abort", forward);
      }
    }
    const timer = setTimeout(() => controller.abort(), ms);
    try {
      return await fetchImpl(url, { ...options, signal: controller.signal });
    } catch (error) {
      if (error?.name === "AbortError" && !(upstreamSignal?.aborted)) throw new Error("upstream_timeout");
      throw error;
    } finally {
      clearTimeout(timer);
      if (detach) detach();
    }
  };
}

async function readJsonBody(request) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_REQUEST_BODY_CHARS) throw Object.assign(new Error("request_too_large"), { status: 413 });
  const text = await request.text();
  if (text.length > MAX_REQUEST_BODY_CHARS) throw Object.assign(new Error("request_too_large"), { status: 413 });
  try {
    const value = JSON.parse(text || "{}");
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
    return value;
  } catch {
    throw Object.assign(new Error("invalid_json"), { status: 400 });
  }
}

function isPrivateIpv4(host) {
  if (!/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) return false;
  const parts = host.split(".").map(Number);
  if (parts.some((x) => x < 0 || x > 255)) return true;
  const [a, b] = parts;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127) ||
    a >= 224
  );
}

function isPrivateIpv6(host) {
  const value = host.replace(/^\[|\]$/g, "").toLowerCase();
  if (!value.includes(":")) return false;
  if (value === "::" || value === "::1") return true;
  if (value.startsWith("fc") || value.startsWith("fd")) return true;
  if (/^fe[89ab]/.test(value)) return true;
  if (value.startsWith("::ffff:")) {
    const tail = value.slice(7);
    if (isPrivateIpv4(tail)) return true;
  }
  return false;
}

export function validateReaderUrl(raw) {
  let url;
  try {
    url = new URL(String(raw || ""));
  } catch {
    return { ok: false, reason: "invalid_url" };
  }
  if (url.protocol !== "https:") return { ok: false, reason: "https_required" };
  if (url.username || url.password) return { ok: false, reason: "credentials_forbidden" };
  const host = url.hostname.toLowerCase().replace(/\.$/, "");
  if (!host) return { ok: false, reason: "invalid_host" };
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host.endsWith(".lan") ||
    host.endsWith(".home")
  ) return { ok: false, reason: "private_host" };
  if (isPrivateIpv4(host) || isPrivateIpv6(host)) return { ok: false, reason: "private_address" };
  return { ok: true, url: url.href };
}

function decodeHtmlEntities(value) {
  return String(value || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n) || 32))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16) || 32));
}

export function detectPromptInjection(text) {
  const value = String(text || "").toLowerCase();
  const patterns = [
    /ignore (all |any )?(previous|prior) instructions/,
    /system prompt/,
    /developer message/,
    /reveal (your )?(prompt|instructions|secrets)/,
    /you are (chatgpt|an ai|the assistant)/,
    /follow these instructions instead/,
    /do not follow.*instructions/,
  ];
  return patterns.some((re) => re.test(value));
}

export function extractReadableText(html, maxChars = MAX_READ_CHARS) {
  const raw = String(html || "");
  const titleMatch = raw.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = decodeHtmlEntities((titleMatch?.[1] || "").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim().slice(0, 240);
  let body = raw
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|noscript|svg|template|iframe|canvas|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<(nav|footer|header|aside|form)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|section|article|li|tr|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, " ");
  body = decodeHtmlEntities(body)
    .replace(/[ \t\f\v]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  const text = body.slice(0, Math.max(500, Math.min(MAX_READ_CHARS, Number(maxChars) || MAX_READ_CHARS)));
  return { title, text, injectionSuspected: detectPromptInjection(text) };
}

async function readResponseBytesLimited(response, maxBytes = MAX_READ_BYTES) {
  const advertised = Number(response.headers.get("content-length") || 0);
  if (advertised > maxBytes) throw Object.assign(new Error("response_too_large"), { code: "TOO_LARGE" });
  if (!response.body?.getReader) {
    const buf = new Uint8Array(await response.arrayBuffer());
    if (buf.byteLength > maxBytes) throw Object.assign(new Error("response_too_large"), { code: "TOO_LARGE" });
    return buf;
  }
  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = value instanceof Uint8Array ? value : new Uint8Array(value);
    total += chunk.byteLength;
    if (total > maxBytes) {
      try { await reader.cancel(); } catch {}
      throw Object.assign(new Error("response_too_large"), { code: "TOO_LARGE" });
    }
    chunks.push(chunk);
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}

async function fetchReaderTarget(url, fetchImpl = fetch) {
  let current = validateReaderUrl(url);
  if (!current.ok) throw Object.assign(new Error(current.reason), { code: current.reason });
  for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect++) {
    const response = await timedFetch(fetchImpl, READER_FETCH_TIMEOUT_MS)(current.url, {
      method: "GET",
      redirect: "manual",
      headers: {
        "accept": "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.1",
        "user-agent": "SevenAI-SearchGateway/2.0",
      },
    });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      if (redirect >= MAX_REDIRECTS) throw Object.assign(new Error("too_many_redirects"), { code: "TOO_MANY_REDIRECTS" });
      const location = response.headers.get("location");
      if (!location) throw Object.assign(new Error("redirect_without_location"), { code: "BAD_REDIRECT" });
      const nextUrl = new URL(location, current.url).href;
      current = validateReaderUrl(nextUrl);
      if (!current.ok) throw Object.assign(new Error(current.reason), { code: current.reason });
      continue;
    }
    return { response, finalUrl: current.url };
  }
  throw Object.assign(new Error("too_many_redirects"), { code: "TOO_MANY_REDIRECTS" });
}

export async function readUrl(url, maxChars = MAX_READ_CHARS, fetchImpl = fetch) {
  const safe = validateReaderUrl(url);
  if (!safe.ok) return { readState: "blocked", error: safe.reason };
  try {
    const { response, finalUrl } = await fetchReaderTarget(safe.url, fetchImpl);
    const contentType = String(response.headers.get("content-type") || "").toLowerCase();
    if (!response.ok) return { readState: "failed", status: response.status, finalUrl, contentType };
    if (contentType.includes("application/pdf")) {
      return { readState: "unsupported", reason: "pdf_reader_not_configured", finalUrl, contentType };
    }
    const supported = ["text/html", "application/xhtml+xml", "text/plain"].some((type) => contentType.includes(type));
    if (!supported) return { readState: "unsupported", reason: "unsupported_content_type", finalUrl, contentType };
    const bytes = await readResponseBytesLimited(response);
    const decoded = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    if (contentType.includes("text/plain")) {
      const text = decoded.replace(/\r/g, "").trim().slice(0, Math.max(500, Math.min(MAX_READ_CHARS, Number(maxChars) || MAX_READ_CHARS)));
      return {
        readState: text.length >= 300 ? "read_success" : "read_partial",
        title: "",
        text,
        finalUrl,
        contentType,
        injectionSuspected: detectPromptInjection(text),
      };
    }
    const extracted = extractReadableText(decoded, maxChars);
    return {
      readState: extracted.text.length >= 300 ? "read_success" : "read_partial",
      title: extracted.title,
      text: extracted.text,
      finalUrl,
      contentType,
      injectionSuspected: extracted.injectionSuspected,
    };
  } catch (error) {
    if (error?.code === "TOO_LARGE") return { readState: "blocked", error: "response_too_large" };
    if (["private_host", "private_address", "https_required", "credentials_forbidden"].includes(error?.code)) {
      return { readState: "blocked", error: error.code };
    }
    return { readState: "failed", error: "reader_transport_failed" };
  }
}

function normalizeLanguage(value) {
  const lang = String(value || "en").toLowerCase();
  return /^[a-z]{2}(-[a-z]{2})?$/.test(lang) ? lang.slice(0, 5) : "en";
}

function normalizeRecency(value) {
  const v = String(value || "").toLowerCase();
  return ["day", "week", "month", "year"].includes(v) ? v : null;
}

function sourceTypeFromUrl(raw) {
  try {
    const host = new URL(raw).hostname.toLowerCase();
    if (host.endsWith(".gov") || host.endsWith(".gov.uk") || host.endsWith(".gov.au")) return "government";
    if (host.endsWith(".edu") || host.includes("arxiv.org")) return "academic";
    if (host === "github.com" || host.startsWith("docs.") || host.includes("developer.")) return "documentation";
    if (host.includes("wikipedia.org")) return "reference";
    return "unknown";
  } catch {
    return "unknown";
  }
}

function normalizeSearchResult(item, rank = 1) {
  let url;
  try {
    url = new URL(String(item?.url || "")).href;
  } catch {
    return null;
  }
  if (!/^https?:$/.test(new URL(url).protocol)) return null;
  return {
    title: String(item?.title || url).replace(/\s+/g, " ").trim().slice(0, 240),
    url,
    snippet: String(item?.snippet || "").replace(/\s+/g, " ").trim().slice(0, 1600),
    rank,
    sourceType: item?.sourceType || sourceTypeFromUrl(url),
    publishedAt: item?.publishedAt ? String(item.publishedAt).slice(0, 64) : null,
  };
}

function braveFreshness(recency) {
  return ({ day: "pd", week: "pw", month: "pm", year: "py" })[recency] || undefined;
}

async function searchBrave(query, options, env, fetchImpl) {
  const url = new URL("https://api.search.brave.com/res/v1/web/search");
  url.searchParams.set("q", query);
  url.searchParams.set("count", String(options.maxResults));
  url.searchParams.set("search_lang", options.language.split("-")[0]);
  const freshness = braveFreshness(options.recency);
  if (freshness) url.searchParams.set("freshness", freshness);
  const res = await fetchImpl(url.href, {
    headers: {
      accept: "application/json",
      "x-subscription-token": String(env.BRAVE_SEARCH_API_KEY),
      "user-agent": "SevenAI-SearchGateway/2.0",
    },
  });
  if (!res.ok) throw new Error("brave_search_failed");
  const data = await res.json();
  return (data?.web?.results || []).slice(0, options.maxResults).map((r, i) => normalizeSearchResult({
    title: r.title,
    url: r.url,
    snippet: r.description,
    publishedAt: r.page_age || null,
  }, i + 1)).filter(Boolean);
}

async function searchSerper(query, options, env, fetchImpl) {
  const tbs = ({ day: "qdr:d", week: "qdr:w", month: "qdr:m", year: "qdr:y" })[options.recency];
  const body = { q: query, num: options.maxResults, hl: options.language.split("-")[0] };
  if (tbs) body.tbs = tbs;
  const res = await fetchImpl("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": String(env.SERPER_API_KEY),
      "user-agent": "SevenAI-SearchGateway/2.0",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("serper_search_failed");
  const data = await res.json();
  return (data?.organic || []).slice(0, options.maxResults).map((r, i) => normalizeSearchResult({
    title: r.title,
    url: r.link,
    snippet: r.snippet,
    publishedAt: r.date || null,
  }, i + 1)).filter(Boolean);
}

function validateConfiguredSearchBase(raw) {
  const safe = validateReaderUrl(raw);
  if (!safe.ok) return null;
  const url = new URL(safe.url);
  url.search = "";
  url.hash = "";
  return url.href.replace(/\/$/, "");
}

async function searchSearxng(query, options, env, fetchImpl) {
  const base = validateConfiguredSearchBase(env.SEARXNG_BASE_URL);
  if (!base) throw new Error("invalid_searxng_base");
  const url = new URL(base + "/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("language", options.language);
  if (options.recency) url.searchParams.set("time_range", options.recency);
  const res = await fetchImpl(url.href, {
    headers: { accept: "application/json", "user-agent": "SevenAI-SearchGateway/2.0" },
  });
  if (!res.ok) throw new Error("searxng_search_failed");
  const data = await res.json();
  return (data?.results || []).slice(0, options.maxResults).map((r, i) => normalizeSearchResult({
    title: r.title,
    url: r.url,
    snippet: r.content,
    publishedAt: r.publishedDate || null,
  }, i + 1)).filter(Boolean);
}

function decodeDdgRedirectUrl(href) {
  try {
    const absolute = href.startsWith("//") ? "https:" + href : href;
    const url = new URL(absolute, "https://html.duckduckgo.com/");
    const redirected = url.searchParams.get("uddg");
    return redirected ? decodeURIComponent(redirected) : url.href;
  } catch {
    return null;
  }
}

export function parseDuckDuckGoHtml(html, maxResults = DEFAULT_MAX_RESULTS) {
  const raw = String(html || "");
  const anchorRe = /<a[^>]*class=["'][^"']*result__a[^"']*["'][^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const anchors = [];
  let match;
  while ((match = anchorRe.exec(raw)) && anchors.length < maxResults) {
    anchors.push({ index: match.index, end: anchorRe.lastIndex, href: match[1], titleHtml: match[2] });
  }
  const results = [];
  for (let i = 0; i < anchors.length; i++) {
    const current = anchors[i];
    const nextIndex = anchors[i + 1]?.index ?? Math.min(raw.length, current.end + 5000);
    const region = raw.slice(current.end, nextIndex);
    const snippetMatch = region.match(/<(?:a|div)[^>]*class=["'][^"']*result__snippet[^"']*["'][^>]*>([\s\S]*?)<\/(?:a|div)>/i);
    const url = decodeDdgRedirectUrl(decodeHtmlEntities(current.href));
    const item = normalizeSearchResult({
      title: decodeHtmlEntities(current.titleHtml.replace(/<[^>]+>/g, " ")),
      url,
      snippet: decodeHtmlEntities((snippetMatch?.[1] || "").replace(/<[^>]+>/g, " ")),
    }, i + 1);
    if (item) results.push(item);
  }
  return results;
}

async function searchDdgHtml(query, options, env, fetchImpl) {
  const url = "https://html.duckduckgo.com/html/?q=" + encodeURIComponent(query);
  const res = await fetchImpl(url, {
    headers: {
      accept: "text/html,application/xhtml+xml",
      "user-agent": "SevenAI-SearchGateway/2.0",
    },
  });
  if (!res.ok) throw new Error("ddg_html_search_failed");
  const text = await res.text();
  return parseDuckDuckGoHtml(text, options.maxResults);
}

export function searchBackendOrder(env = {}) {
  const order = [];
  if (env.BRAVE_SEARCH_API_KEY) order.push("brave");
  if (env.SERPER_API_KEY) order.push("serper");
  if (validateConfiguredSearchBase(env.SEARXNG_BASE_URL)) order.push("searxng");
  order.push("duckduckgo_html");
  return order;
}

export function selectSearchBackend(env = {}) {
  return searchBackendOrder(env)[0];
}

async function runSearchBackend(backend, query, options, env, fetchImpl) {
  if (backend === "brave") return searchBrave(query, options, env, fetchImpl);
  if (backend === "serper") return searchSerper(query, options, env, fetchImpl);
  if (backend === "searxng") return searchSearxng(query, options, env, fetchImpl);
  return searchDdgHtml(query, options, env, fetchImpl);
}

export async function searchGeneralWeb(query, options = {}, env = {}, fetchImpl = fetch) {
  const q = String(query || "").trim().slice(0, MAX_QUERY_CHARS);
  if (!q) throw Object.assign(new Error("empty_query"), { status: 400 });
  const normalized = {
    language: normalizeLanguage(options.language),
    recency: normalizeRecency(options.recency),
    maxResults: Math.max(1, Math.min(MAX_RESULTS, Number(options.maxResults) || DEFAULT_MAX_RESULTS)),
  };
  const started = Date.now();
  const attempted = [];
  let lastError = null;
  for (const backend of searchBackendOrder(env)) {
    const remaining = SEARCH_TOTAL_BUDGET_MS - (Date.now() - started);
    if (remaining < 300) break;
    attempted.push(backend);
    try {
      const attemptMs = Math.min(SEARCH_BACKEND_ATTEMPT_MS, remaining);
      const results = await runSearchBackend(backend, q, normalized, env, timedFetch(fetchImpl, attemptMs));
      if (!Array.isArray(results) || results.length === 0) throw new Error("empty_search_results");
      return {
        capability: backend === "duckduckgo_html" ? "general_web_degraded" : "general_web",
        backend,
        attemptedBackends: attempted,
        results,
      };
    } catch (error) {
      lastError = error;
    }
  }
  const failure = new Error("all_search_backends_failed");
  failure.status = 502;
  failure.cause = lastError || null;
  throw failure;
}

function healthPayload(env = {}) {
  const backend = selectSearchBackend(env);
  return {
    status: "ok",
    version: VERSION,
    search: {
      backend,
      capability: backend === "duckduckgo_html" ? "general_web_degraded" : "general_web",
    },
    reader: { available: true, contentTypes: ["text/html", "application/xhtml+xml", "text/plain"] },
    authRequired: Boolean(env.GATEWAY_CLIENT_KEY),
  };
}

export async function handleRequest(request, env = {}, ctx = {}, fetchImpl = fetch) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(request, env) });
  if (!isAuthorized(request, env)) return json({ error: "unauthorized" }, 401, request, env);
  if (!consumeRateLimit(request, env)) return json({ error: "rate_limited" }, 429, request, env);

  const url = new URL(request.url);
  if (request.method === "GET" && url.pathname === "/health") return json(healthPayload(env), 200, request, env);

  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405, request, env);

  try {
    if (url.pathname === "/v1/search") {
      const body = await readJsonBody(request);
      const result = await searchGeneralWeb(body.query, {
        language: body.language,
        recency: body.recency,
        maxResults: body.maxResults,
      }, env, fetchImpl);
      return json({ version: VERSION, ...result }, 200, request, env);
    }

    if (url.pathname === "/v1/read") {
      const body = await readJsonBody(request);
      const result = await readUrl(body.url, body.maxChars, fetchImpl);
      const status = result.readState === "blocked" ? 400 : 200;
      return json({ version: VERSION, ...result }, status, request, env);
    }

    return json({ error: "not_found" }, 404, request, env);
  } catch (error) {
    const status = Number(error?.status) || 502;
    return json({ error: String(error?.message || "gateway_error").slice(0, 120) }, status, request, env);
  }
}

export default {
  fetch(request, env, ctx) {
    return handleRequest(request, env, ctx, fetch);
  },
};
