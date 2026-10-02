# Web Search v2 — Production Hardening Pass

Date: 2026-10-02  
Status: CODE COMPLETE / PRODUCTION CONFIG BLOCKED — runtime, CI, latency, fallback and live-eval harness are implemented. GitHub Actions confirmed that the production deploy and live endpoint gate are currently blocked only by missing Cloudflare repository configuration.

## Scope

This pass closes the remaining production-facing work after Web Search v2 Batches 1–7:

1. Live Search Quality validation
2. Cloudflare Search Gateway production deployment
3. Search + Deep Think latency optimization
4. GitHub/main synchronization

## Implemented

### Latency Policy v2
- Search Gateway timeout reduced to 6.0s.
- Reader timeout reduced to 6.5s.
- Search waves have soft deadlines:
  - initial: 5.2s
  - follow-up: 4.2s
- A wave may return early only after a quality gate:
  - at least 8 unique candidates
  - at least 2 independent hosts
  - configured general-web gateway has contributed
  - technical queries contain a strong/primary-style source
- If that gate is not met, Search continues waiting for the remaining adapters.
- Safe diagnostics expose deadline/early-return counters.
- Deep Think hidden budgets/timeouts were reduced adaptively without removing its dedicated reasoning pass.

### Production Search Gateway hardening
- Backend order: Brave -> Serper -> SearxNG -> DuckDuckGo HTML.
- Failure/timeout/empty-result on one backend now falls through to the next backend.
- Total backend-chain latency is bounded.
- Each backend attempt has its own timeout.
- Page-reader upstream fetches are bounded.
- Deterministic fallback regression test added.

### Live Search Quality evaluator
- Covers English current, Arabic current, technical docs, comparison, primary-source discovery, and niche technical retrieval.
- Measures:
  - search success
  - source-host diversity
  - search p50/p95 latency
  - page-reader success
  - reader p95 latency
  - backend/fallback path
- Strict gate writes `eval/live-search-quality-report.json`.

### Production deployment workflow
- `.github/workflows/search-gateway-production.yml`
- Validates Worker before deployment.
- Deploys with Wrangler only when Cloudflare deployment secrets are present.
- Runs the strict live-quality gate when `SEARCH_GATEWAY_URL` is configured.
- Never prints credential values.
- Uploads the bounded live-quality report as a CI artifact.

## Required repository configuration for the real production endpoint

GitHub secrets:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- optional `GATEWAY_CLIENT_KEY`

Optional GitHub repository variable:
- `SEARCH_GATEWAY_URL` — existing/custom HTTPS Worker URL override. New Wrangler deployments are auto-discovered by CI.

Search-provider credentials such as Brave/Serper remain Worker-side Cloudflare secrets.

## Acceptance gates

- deterministic Seven test suite PASS
- Search Gateway fallback test PASS
- Android API 36 release/device smoke PASS
- Cloudflare deployment step executes successfully
- live Search Quality strict gate PASS
- main contains all production-hardening commits


## Observed CI state

Production workflow run #2 validated the Search Gateway successfully.

Deployment readiness result:
- Cloudflare deploy step: SKIPPED
- reason: `CLOUDFLARE_API_TOKEN` and/or `CLOUDFLARE_ACCOUNT_ID` are not configured as GitHub repository secrets
- live Search Quality step: SKIPPED in the observed run because there was neither a configured endpoint nor a deployment URL
- the workflow was subsequently hardened to auto-discover the newly deployed `workers.dev` URL, so `SEARCH_GATEWAY_URL` is no longer required for a first deployment

This is an external deployment-configuration blocker, not a Search v2 code/test failure. The remaining required repository configuration is Cloudflare deployment authentication. Once it exists, the workflow can deploy and immediately run the strict live gate on the discovered endpoint.
