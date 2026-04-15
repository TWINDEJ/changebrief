# changebrief

AI-powered regulatory monitoring. Watches government and agency websites, detects changes, and tells you *what* changed — not just that something changed.

> "Finansinspektionen published new capital adequacy requirements for credit institutions. Effective 2026-06-01."

**Live:** [changebrief.io](https://changebrief.io) | **App:** [app.changebrief.io](https://app.changebrief.io) | **Status:** [app.changebrief.io/status](https://app.changebrief.io/status)

## How it works

1. **Playwright** screenshots each monitored page every 6 hours
2. **Pixelmatch** compares with previous screenshot (cheap pixel filter)
3. If change > threshold → **GPT-4o Vision** analyzes what changed
4. AI classifies regulatory changes: `action_required`, `review_recommended`, or `info_only`
5. Notifications via email, Slack, Teams, Discord, PagerDuty, or webhook

## Architecture

```
landing/          — Astro + Tailwind → Cloudflare Pages (changebrief.io)
app/              — Next.js (App Router) + Auth.js → Vercel (app.changebrief.io)
engine/           — Playwright + GPT-4o Vision → GitHub Actions (cron every 6h)
shared/           — Shared logic (diff, vision, notify, schema)
tests/            — Vitest test suite
```

| Component | Tech | Where |
|---|---|---|
| Landing page | Astro + Tailwind | Cloudflare Pages |
| Web app | Next.js, Auth.js, Turso | Vercel |
| Database | Turso (libsql, eu-west-1) | AWS Ireland |
| Engine | Playwright, Pixelmatch, OpenAI | GitHub Actions |
| Billing | Polar.sh + Stripe | External |
| Email | Resend | External |

## Getting started

```bash
# 1. Clone and install
git clone https://github.com/TWINDEJ/changebrief.git
cd changebrief
npm install
npx playwright install chromium

# 2. Configure
cp .env.example .env
# Fill in all required variables (see .env.example for details)

# 3. Run the app locally
cd app && npm install && npm run dev

# 4. Run the engine manually
npx ts-node engine/check-all.ts
```

## Environment variables

See `.env.example` for the complete list. Required:

| Variable | Purpose |
|---|---|
| `TURSO_DATABASE_URL` | Turso database connection |
| `TURSO_AUTH_TOKEN` | Turso auth |
| `OPENAI_API_KEY` | GPT-4o Vision analysis |
| `AUTH_SECRET` | NextAuth session encryption |
| `GOOGLE_CLIENT_ID/SECRET` | Google OAuth |
| `GITHUB_CLIENT_ID/SECRET` | GitHub OAuth |
| `RESEND_API_KEY` | Email notifications |

## Testing

```bash
npm test              # Run all tests (29 tests, 3 suites)
```

Tests cover: vision JSON parsing, notification thresholds, plan limits, structured diff logic, compliance action filters, rate limiting, schema sync between engine and app.

## Production monitoring

- **CI:** Tests + build run on every push
- **Uptime:** Health checks every 5 minutes, email alerts on downtime
- **DB backup:** Daily export to GitHub Actions artifacts (30 day retention)
- **Crash alerts:** Engine emails on fatal errors
- **Rate limiting:** All public API endpoints (60 req/min)
- **Health:** `GET /api/health` returns DB status + env check

## API (Pro+)

```bash
# List your changes
curl -H "Authorization: Bearer cb_..." https://app.changebrief.io/api/v1/changes

# Filter by compliance action
curl -H "Authorization: Bearer cb_..." "https://app.changebrief.io/api/v1/changes?action=action_required"

# List monitored sources
curl -H "Authorization: Bearer cb_..." https://app.changebrief.io/api/v1/sources
```

## Plans

| | Free | Pro | Team |
|---|---|---|---|
| Monitored pages | 3 | 25 | 100 |
| Checks/month | 100 | 2,000 | 10,000 |
| History retention | 7 days | 90 days | 365 days |
| API access | - | Yes | Yes |
| Teams/Discord/PagerDuty | - | Yes | Yes |
| Team assignment | - | - | Yes |

## Deploy

```bash
# Landing page → Cloudflare Pages
cd landing && npm run build && npx wrangler pages deploy dist --project-name pagewatch

# App → Vercel
cd app && npx vercel --prod --yes

# Trigger engine manually
gh workflow run check-urls.yml
```
