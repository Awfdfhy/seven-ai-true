# Wave 01 Evidence — Web, Search, Extraction, Browser

Date: 2026-09-13
Purpose: primary-source evidence ledger supporting `WAVE_01_DISCOVERY_REPORT.md`. Classification remains provisional until individual Deep Polish.

## MCP

Sources:
- https://blog.modelcontextprotocol.io/posts/2026-07-28/
- https://modelcontextprotocol.io/specification/draft/server/tools
- https://modelcontextprotocol.io/specification/draft/server/resources
- https://ts.sdk.modelcontextprotocol.io/v2/api/%40modelcontextprotocol/server/

Verified observations:
- MCP 2026-07-28 introduces a stateless protocol core, Multi Round-Trip Requests, header-based routing, cacheable list results, authorization hardening and an extensions framework.
- The Tasks extension provides a lifecycle for long-running work.
- External server/tool metadata must not be treated as Seven authority.

Seven implication:
- use MCP as an interoperability adapter behind Seven's Tool Security Kernel, schema validation, permission binding, provenance, side-effect ledger and effect verification.

## Playwright

Sources:
- https://playwright.dev/docs/getting-started-cli
- https://github.com/microsoft/playwright-mcp/blob/main/README.md
- https://playwright.dev/docs/api/class-tracing

Verified observations:
- Playwright CLI is explicitly designed for coding agents and minimizes context overhead with concise commands/skills.
- Official guidance differentiates CLI from MCP: CLI fits token-efficient coding workflows; MCP fits persistent exploratory loops.
- Playwright browser automation remains a Node/browser-runtime capability rather than a lightweight Android startup dependency.

Seven implication:
- one `BrowserActionBroker`, with CLI-like concise host mode and MCP/persistent mode selected by task.
- browser work must remain lazy/remote or host-backed on Android.

## Exa

Sources:
- https://exa.ai/docs/reference/search-api-guide
- https://exa.ai/docs/reference/contents-api-guide
- https://exa.ai/pricing

Verified observations:
- provides Search and Contents APIs and configurable search depth/latency modes.
- Contents is designed to return LLM-ready page content/highlights.
- current pricing includes a free starter path/credits, but usage is metered.

Seven implication:
- useful semantic/research adapter, not a permanent single search dependency.

## Tavily

Sources:
- https://docs.tavily.com/documentation/api-reference/introduction
- https://docs.tavily.com/documentation/api-reference/endpoint/search
- https://docs.tavily.com/documentation/api-reference/endpoint/extract
- https://docs.tavily.com/documentation/api-reference/endpoint/crawl
- https://docs.tavily.com/documentation/api-reference/endpoint/map

Verified observations:
- exposes search, extract, crawl and map/research-oriented APIs.
- supports site traversal and structured extraction workflows.

Seven implication:
- broad research adapter candidate behind `SearchBroker`/`FetchExtractBroker`.

## Brave Search API

Source:
- https://brave.com/search/api/

Verified observations:
- independent web search API with metered pricing/free monthly credit path at time of research.

Seven implication:
- useful for index/provider diversity and fallback.

## SearXNG

Sources:
- https://docs.searxng.org/dev/search_api
- https://github.com/searxng/searxng
- https://github.com/searxng/searxng/blob/master/LICENSE

Verified observations:
- self-hostable metasearch with machine-readable search output when enabled.
- public instances may disable some output formats.
- AGPL-3.0 project licensing requires deliberate deployment/license review.

Seven implication:
- self-hosted/fallback path; never assume arbitrary public instances are stable machine APIs.

## Jina Reader

Source:
- https://jina.ai/reader/

Verified observations:
- converts supplied URLs into LLM-oriented text and exposes search/reader endpoints.
- API keys raise limits; remote service dependency remains.

Seven implication:
- low-friction extraction fallback after direct fetch/parse.

## Firecrawl

Sources:
- https://docs.firecrawl.dev/api-reference/v2-introduction
- https://docs.firecrawl.dev/features/interact
- https://docs.firecrawl.dev/api-reference/endpoint/search
- https://docs.firecrawl.dev/api-reference/endpoint/scrape

Verified observations:
- covers scrape/search/crawl/map plus interactive/browser capabilities.
- can return Markdown/HTML/structured output and handle complex page workflows.

Seven implication:
- hard-web specialist, but Seven must retain planner/authority instead of delegating control to another agent layer.

## Crawl4AI

Sources:
- https://docs.crawl4ai.com/
- https://docs.crawl4ai.com/core/quickstart/
- https://github.com/unclecode/crawl4ai/blob/main/README.md

Verified observations:
- open-source crawler/extraction runtime supporting dynamic pages and structured/Markdown extraction.

Seven implication:
- self-host/worker candidate, not phone startup dependency.

## Rejected-for-core browser-agent wrappers

Stagehand source:
- https://docs.stagehand.dev/v3/integrations/playwright

Browser Use source:
- https://docs.browser-use.com/open-source/customize/tools/add

Decision rationale:
- both add higher-level AI/browser orchestration.
- Seven already owns planning, model routing, permissions and verification.
- preserve as benchmark/reference; reconsider only if Seven Evals demonstrate a measurable advantage over direct browser primitives.

## Proposed retrieval escalation

1. direct HTTP fetch + lightweight parse
2. known structured endpoint/local parser
3. remote Reader-style extraction
4. provider extraction endpoint
5. crawler/browser-backed extraction
6. full interactive BrowserActionBroker only when interaction is necessary

This escalation is a proposal pending Deep Polish/Evals.
