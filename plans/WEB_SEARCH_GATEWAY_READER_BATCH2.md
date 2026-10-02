# Web Search v2 — Batch 2: General Web Gateway + Reader

Date: 2026-10-02
Status: COMPLETE
Parent: WEB_SEARCH_OVERHAUL_V2.md

## Objective

Give Seven a real general-web retrieval transport instead of relying only on DuckDuckGo Instant Answer and Wikipedia.

Batch 2 adds:
1. a Cloudflare Worker Search Gateway;
2. a client-side general-web adapter;
3. a controlled page reader;
4. truthful capability/read-state handling;
5. SSRF/open-proxy protections;
6. regression tests for both Worker and WebView client.

This batch does NOT yet implement the full claim/evidence matrix or contradiction loop. Those are Batch 3+.

## Gateway endpoints

### GET /health

Returns:
- status
- available search backend names
- reader availability
- version

No secrets.

### POST /v1/search

Input:
- query
- language
- recency
- maxResults

Output:
- capability
- backend
- normalized results

Backend preference:
1. Brave Search API when `BRAVE_SEARCH_API_KEY` exists
2. Serper when `SERPER_API_KEY` exists
3. configured SearxNG when `SEARXNG_BASE_URL` exists
4. DuckDuckGo HTML fallback when none of the above is configured

The fallback is labeled degraded/unofficial; Seven must never represent it as an equivalent first-party search API.

### POST /v1/read

Input:
- HTTPS URL
- maxChars

Output:
- readState
- title
- extracted text
- content type
- final URL
- injection suspicion flag

Initial content support:
- text/html
- application/xhtml+xml
- text/plain

PDF remains `unsupported` in Batch 2 unless a real PDF extraction transport is added later.

## Security

Reader rules:
- HTTPS only
- reject credentials in URLs
- reject localhost / .local / .internal / LAN-like hosts
- reject private/link-local/loopback literal IPv4/IPv6 addresses
- redirect mode manual
- validate every redirect target
- max 3 redirects
- max 768 KB response body
- max 20K extracted chars
- content-type allowlist
- fixed Worker-created headers only
- no arbitrary client request headers
- no cookie forwarding
- no authorization forwarding
- no JavaScript execution
- scripts/styles/iframes/templates removed
- raw HTML never returned to Seven

Optional client authentication:
- if Worker secret `GATEWAY_CLIENT_KEY` is set, request must send `X-Seven-Gateway-Key`
- Worker never echoes this key
- client stores it separately from model context and exports

## Client integration

Settings add:
- Search Gateway URL
- optional Search Gateway key

Rules:
- gateway URL must be HTTPS
- no embedded credentials in URL
- gateway disabled when URL invalid/empty
- query adapters remain available as fallback

Search flow:
1. DDG Instant Answer + Wikipedia EN/AR + General Gateway run in parallel
2. normalize all candidates
3. dedupe
4. rank
5. if Gateway reader is configured, read top 3 snippet-only HTTP(S) candidates in bounded parallel
6. update readState
7. rerank
8. compile bounded search context

Capability state:
- `general_web` when a non-degraded general backend returns results
- `general_web_degraded` when only gateway DDG-HTML fallback returns
- `knowledge_sources_only` when Gateway is unavailable/unconfigured
- `limited_capability` when configured Gateway fails and only local knowledge adapters work

## Prompt-injection boundary

Web text remains untrusted data. Batch 2 also records a non-authoritative `injectionSuspected` flag from the reader for diagnostics.

A suspicion flag:
- never grants/changes authority
- never changes system policy
- never exposes hidden prompts
- may be shown in diagnostics
- does not automatically censor factual page content

## Performance

Search requests:
- all independent adapters parallel
- gateway timeout 7s
- page reader timeout 8s each
- max 3 page reads per normal Search
- page reads parallel but bounded to 3

Normal Search must not wait for more than this batch budget.

## Tests

Worker:
1. private IPv4 rejected
2. localhost/.local rejected
3. non-HTTPS rejected
4. credentialed URL rejected
5. safe HTTPS accepted
6. redirect target revalidated
7. HTML extraction removes script/style/nav noise
8. oversized response blocked
9. PDF marked unsupported
10. client key enforced when configured
11. search backend preference deterministic
12. DDG HTML parser normalizes result URLs
13. no secret echoed in responses

Client:
14. invalid/non-HTTPS gateway URL rejected
15. gateway key never enters search diagnostics/context
16. general gateway participates in parallel search
17. gateway results dedupe with existing sources
18. top candidates are read and move to read_success/read_partial
19. reader failure leaves truthful snippet_only/failed state
20. capability labels are accurate
21. no Gateway configured keeps Batch 1 behavior
22. source cards display read state
23. context remains bounded
24. Stop/cancellation remains safe
25. full existing CI remains green

## Acceptance criteria

Batch 2 is complete when:
- Worker source and tests exist in repository;
- Seven can call a configured Gateway without exposing model credentials;
- general search results can enter the normalized Search v2 candidate pool;
- selected pages can be read through the controlled reader;
- all read/capability states are truthful;
- browser CI is green;
- Android release gate passes after merge.

## Deployment note

Implementation can be merged and release-gated before a live Worker URL is configured.

A live general-web search experience requires deploying the Worker and configuring Seven with its HTTPS URL. Deployment credentials remain user-controlled; no Cloudflare password/OTP is stored or requested by Seven.
