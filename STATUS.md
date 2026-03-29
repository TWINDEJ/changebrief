# STATUS — changebrief

## Uppdaterad: 2026-03-29

## Status: Live — production hardened

### Teknik
- **Landing:** Cloudflare Pages (changebrief.io) — live
- **App:** Vercel (app.changebrief.io) — live
- **DB:** Turso (eu-west-1) — daglig backup
- **Engine:** GitHub Actions cron var 6h — crash alerting
- **CI:** Tester + build vid varje push
- **Uptime:** Health check var 5:e minut, mejl vid downtime

### Produktionsmognad: 8-9/10
- 29 tester (engine logik, rate limiting, schema sync)
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
- Compliance-klassificering ej verifierad med riktiga regulatoriska ändringar
- RAG-integration (8595 föreskrifter) — avvaktar, plan utvärderad

### Väntar på
- Feedback från testare
- Betalande kund
