# STATUS — changebrief

## Uppdaterad: 2026-04-17

## Status: Live — production hardened

### Teknik
- **Landing:** Cloudflare Pages (changebrief.io) — live
- **App:** Vercel (app.changebrief.io) — live
- **DB:** Turso (eu-west-1) — daglig backup
- **Engine:** GitHub Actions cron var 6h — crash alerting
- **CI:** Tester + build vid varje push
- **Uptime:** Health check var 5:e minut, mejl vid downtime

### Produktionsmognad: 8-9/10
- 29 tester i snabb svit + 6 compliance-klassificerings-tester (golden corpus mot GPT-5.4-mini)
- Rate limiting på alla publika endpoints
- Centraliserat DB-schema med drift-detection
- Crash alerting, uptime monitoring, daglig DB-backup
- Polar webhook-secret obligatoriskt

### Nya sidor
- `/demo` — interaktiv demo utan inloggning
- `/status` — publik statuspage med live DB-check
- `/api/health` — maskinläsbar health check
- `/api/v1/changes` — public API (bearer auth, Pro+)
- `/api/v1/sources` — public API (bearer auth, Pro+)
- `/api/keys` — API key management (Pro+)

### Blockerare
- RAG-integration (8595 föreskrifter) — avvaktar, plan utvärderad

### Compliance-klassificering (2026-04-17)
- 6/6 cases i `tests/fixtures/compliance-cases/` passerar mot GPT-5.4-mini
- Täcker: FI (guidance), IMY (guidance), Naturvårdsverket (regulation), ESMA (consultation), Livsmedelsverket (regulation), Trafikverket (regression-case för news-rotation)
- **Fixad produktionsbugg:** `shared/vision.ts` använde `max_tokens` (ogiltigt för gpt-5.4-mini) — hela compliance-flödet var tyst brutet. Corpus-testet hittade det.
- Känd begränsning: EU-remisser (consultation) betygsätts stabilt 3-4 — filtreras bort vid default min_importance=5. Iterera prompt om kunder klagar.
- Kör: `npm run fixtures:render && npm run test:compliance`

### Väntar på
- Feedback från testare
- Betalande kund
