# HANDOFF — changebrief

## Datum: 2026-03-26

## Vad som byggts denna session

### Core engine
- Playwright screenshots (desktop + mobil, CSS-selektorer, cookies/auth)
- Pixelmatch pixel-diff med konfigurerbar tröskel
- OpenAI GPT-4o Vision-analys med importance scoring
- CLI: add, remove, list, history, report, export, check, integrate
- Integrationer: Slack, Teams, Discord, PagerDuty, Jira, webhooks
- Screenshot-arkivering med retention, daglig rapport, CSV/JSON-export

### Landing page (landing/)
- Astro + Tailwind, dark theme, 8 sektioner
- Live på **https://changebrief.io** (Cloudflare Pages)
- Checkout-knappar kopplade till Polar

### Betalning (Polar)
- Konto: changebrief (Individual)
- Stripe kopplad + ID-verifierad
- Pro ($19/mån) och Team ($49/mån) produkter skapade
- Checkout-länkar kopplade i landing page
- Fortfarande i Test Mode — behöver "Go Live" i Polar

### Webbapp (app/)
- Next.js + Auth.js + SQLite
- GitHub-login fungerar (testat lokalt)
- Dashboard: lägg till/ta bort URLs, visa historik, plangränser
- API: GET/POST/DELETE /api/urls
- Kör på localhost:3000

### DNS & hosting
- changebrief.io köpt på Namecheap
- CNAME → pagewatch-d52.pages.dev (propagerat, SSL fungerar)
- GitHub: TWINDEJ/pagewatch

## Nästa steg
1. **Deploya webbappen** till Vercel + koppla app.changebrief.io
2. **Google OAuth** — skapa credentials i Google Cloud Console
3. **Koppla core engine till webbappen** — cron-jobb som kör screenshots för alla användares URLs
4. **Polar "Go Live"** — aktivera riktiga betalningar
5. **Regenerera GitHub client secret** (exponerades i chatten)
6. **Landing page CTA-knappar** — peka "Kom igång gratis" och hero-CTA till app.changebrief.io/login

## Filer att känna till
- `app/.env.local` — auth secrets (gitignored)
- `app/src/lib/db.ts` — SQLite databas-schema
- `app/src/lib/auth.ts` — NextAuth config
- `.env` — OpenAI API-nyckel (gitignored)
- `data/urls.json` — CLI-konfiguration (separat från webbappen)

## Dev-server
Webbappen körs möjligen fortfarande: `cd app && npm run dev` (port 3000)
