# Seven AI Search Gateway

This Worker provides the controlled transport required by Web Search v2 Batch 2.

## Endpoints

- `GET /health`
- `POST /v1/search`
- `POST /v1/read`

The reader accepts only public HTTPS URLs and revalidates redirects. It blocks obvious loopback/private/link-local targets, strips executable/navigation HTML, limits response size, and never forwards client cookies/auth headers to target pages.

## Search backends

Preference order:

1. Brave Search API — `BRAVE_SEARCH_API_KEY`
2. Serper — `SERPER_API_KEY`
3. custom SearxNG — `SEARXNG_BASE_URL`
4. DuckDuckGo HTML fallback — no extra key, labeled `general_web_degraded`

The DuckDuckGo HTML fallback is intentionally labeled degraded because it is not an official structured search API and can be rate-limited/changed upstream.

## Client authentication

For a personal deployment, set `GATEWAY_CLIENT_KEY` and put the same value in Seven's **Web Search Gateway** settings.

This is a gateway access token, not a model key. Seven keeps it outside prompts, search diagnostics, conversation exports, and page-reader requests to third-party sites.

## Deployment

From this folder with Wrangler configured:

```
wrangler deploy
```

Then configure Seven with the resulting HTTPS Worker URL.

Do not commit Cloudflare login credentials, API tokens, OTPs, search API keys, or the gateway client key.

## Limits

Batch 2 reads HTML/XHTML/plain text. PDF is truthfully returned as `unsupported` until a real PDF extraction transport is implemented.

The Worker includes an in-isolate request counter, but production deployments should also use Cloudflare's account-level rate limiting/WAF controls for stronger abuse protection.


## Production CI deployment

The repository workflow `.github/workflows/search-gateway-production.yml` validates the Worker on every relevant `main` change and can deploy it when the repository has:

- secret `CLOUDFLARE_API_TOKEN`
- secret `CLOUDFLARE_ACCOUNT_ID`

For the post-deploy live quality gate:

- the workflow automatically extracts a newly deployed `workers.dev` HTTPS URL from Wrangler;
- repository variable `SEARCH_GATEWAY_URL` is only an optional override for an existing/custom production endpoint;
- optional secret `GATEWAY_CLIENT_KEY` is used when the Worker requires client authentication.

The live gate runs `npm run eval:search-live` and measures search success, host diversity, reader success, and p95 search/read latency. Search-provider secrets remain Worker-side Cloudflare secrets and must never be committed to the repository.
