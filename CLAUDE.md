# changebrief

## Om projektet
Verktyg som bevakar webbsidor och med AI (GPT-4o Vision) berättar *vad* som ändrades — inte bara att något ändrades.

## Teknikstack
- **Node.js + TypeScript**
- **Playwright** — headless screenshots (desktop + mobil)
- **Pixelmatch + pngjs** — pixeljämförelse (filter innan AI-anrop)
- **OpenAI API (gpt-4o)** — bildanalys av före/efter-screenshots
- **dotenv** — miljövariabler

## Projektstruktur
```
shared/screenshot.ts  — Playwright-wrapper (viewport, selector, cookies, headers)
shared/diff.ts        — Pixelmatch-wrapper
shared/vision.ts      — OpenAI Vision API-anrop
shared/notify.ts      — Alla notis-kanaler (Slack, Teams, Discord, PagerDuty, Jira, webhook)
shared/integrations.ts — Central dispatcher + integrations-config
shared/history.ts     — JSON-baserad ändringslogg
shared/config.ts      — URL-konfiguration med per-URL settings
shared/storage.ts     — Screenshot-arkivering med retention
shared/report.ts      — Daglig rapport + CSV/JSON-export
cli.ts                — CLI med add/remove/list/history/report/export/check/integrate
local-test.ts         — Kör hela bevakningsflödet
data/urls.json        — Bevakade URLs (med konfiguration)
data/integrations.json — Integrationer (gitignored)
data/history.json     — Ändringshistorik (gitignored)
data/screenshots/     — Aktuella screenshots (gitignored)
data/archive/         — Datumstämplade arkiv (gitignored)
landing/              — Astro + Tailwind landing page
```

## Köra lokalt
```bash
cp .env.example .env         # Fyll i OPENAI_API_KEY
npm run cli -- add <url> <namn>  # Lägg till URL
npm run check                # Kör bevakning
npm run cli -- report        # Visa rapport
```

## Lektioner
- pixelmatch v7 är ESM-only, importera med `import pixelmatch from 'pixelmatch'`
- Namn med mellanslag i CLI: samla alla non-option/non-URL args och join med ' '
- Filtrera bort undefined vid spread för att inte skriva över defaults

<!-- VERCEL BEST PRACTICES START -->
## Best practices for developing on Vercel

These defaults are optimized for AI coding agents (and humans) working on apps that deploy to Vercel.

- Treat Vercel Functions as stateless + ephemeral (no durable RAM/FS, no background daemons), use Blob or marketplace integrations for preserving state
- Edge Functions (standalone) are deprecated; prefer Vercel Functions
- Don't start new projects on Vercel KV/Postgres (both discontinued); use Marketplace Redis/Postgres instead
- Store secrets in Vercel Env Variables; not in git or `NEXT_PUBLIC_*`
- Provision Marketplace native integrations with `vercel integration add` (CI/agent-friendly)
- Sync env + project settings with `vercel env pull` / `vercel pull` when you need local/offline parity
- Use `waitUntil` for post-response work; avoid the deprecated Function `context` parameter
- Set Function regions near your primary data source; avoid cross-region DB/service roundtrips
- Tune Fluid Compute knobs (e.g., `maxDuration`, memory/CPU) for long I/O-heavy calls (LLMs, APIs)
- Use Runtime Cache for fast **regional** caching + tag invalidation (don't treat it as global KV)
- Use Cron Jobs for schedules; cron runs in UTC and triggers your production URL via HTTP GET
- Use Vercel Blob for uploads/media; Use Edge Config for small, globally-read config
- If Enable Deployment Protection is enabled, use a bypass secret to directly access them
- Add OpenTelemetry via `@vercel/otel` on Node; don't expect OTEL support on the Edge runtime
- Enable Web Analytics + Speed Insights early
- Use AI Gateway for model routing, set AI_GATEWAY_API_KEY, using a model string (e.g. 'anthropic/claude-sonnet-4.6'), Gateway is already default in AI SDK
  needed. Always curl https://ai-gateway.vercel.sh/v1/models first; never trust model IDs from memory
- For durable agent loops or untrusted code: use Workflow (pause/resume/state) + Sandbox; use Vercel MCP for secure infra access
<!-- VERCEL BEST PRACTICES END -->
