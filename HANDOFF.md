# HANDOFF — changebrief

## Session 2026-03-29 (kväll — production hardening)

### Vad som gjordes

**5 nya features**
1. Global GRC webhook — engine:n skickar nu till `users.webhook_url` (var bara sparat men aldrig skickat)
2. Teams/Discord/PagerDuty — settings UI + engine notifications (Pro+ only i UI, kod för alla)
3. AI-sammanfattningar på svenska — `locale` skickas till GPT-4o, svenska användare får svenska summaries
4. Interaktiv demo (`/demo`) — mockad dashboard med 6 nordiska myndighets-ändringar, ingen auth
5. API-nycklar (`/api/keys`, `/api/v1/*`) — bearer auth, SHA-256 hashade nycklar, Pro+

**Production hardening (5→8/10)**
6. CI-pipeline — tester + build vid varje push (`.github/workflows/ci.yml`)
7. Crash alerting — engine mejlar `kristian@changebrief.io` vid fatal errors
8. Polar webhook-secret obligatoriskt — avvisar webhooks utan `POLAR_WEBHOOK_SECRET`
9. Health endpoint (`/api/health`) — kollar DB + env vars, returnerar healthy/degraded
10. Centraliserat schema (`shared/schema.ts`) — engine använder det, app har kopia + sync-test
11. DB-backup dagligen — GitHub Actions kl 03:00, 30 dagars retention

**Ytterligare härdning (8→9/10)**
12. Rate limiting — 60 req/min public API, 10/min URL-creation, 30/min webhooks (429 + Retry-After)
13. Uptime monitor — pingar var 5:e minut, mejlar vid downtime
14. Status-sida (`/status`) — publik sida med live komponentstatus
15. UI-rensning — Teams/Discord/PagerDuty dolt för free-plan

**Testning (0→29)**
16. 5 testsviter: vision JSON, notification threshold, plan limits, structured diff, compliance filter
17. Rate limit-tester
18. Schema-sync-test (fångar drift mellan engine och app)

**Dokumentation**
19. `.env.example` — alla 10 variabler, grupperade, kommenterade
20. README.md — helt omskriven för SaaS-produkten
21. HANDOFF.md — denna fil

### Nya filer
```
.github/workflows/ci.yml
.github/workflows/db-backup.yml
.github/workflows/uptime-monitor.yml
app/src/app/api/health/route.ts
app/src/app/api/keys/route.ts
app/src/app/api/v1/changes/route.ts
app/src/app/api/v1/sources/route.ts
app/src/app/demo/page.tsx
app/src/app/status/page.tsx
app/src/lib/api-auth.ts
app/src/lib/rate-limit.ts
shared/schema.ts
tests/engine.test.ts
tests/rate-limit.test.ts
tests/schema-sync.test.ts
```

### DB-migrationer (körs automatiskt)
- `users.teams_webhook_url TEXT`
- `users.discord_webhook_url TEXT`
- `users.pagerduty_routing_key TEXT`
- `api_keys`-tabell (id, user_id, name, key_hash, key_prefix, created_at, last_used_at, revoked_at)

### Ärligt utlåtande (uppdaterat)

| Dimension | Betyg |
|---|---|
| Idé & positionering | 8/10 |
| Kodbas & arkitektur | 7/10 |
| Produktionsmognad | 8-9/10 |
| Marknadsberedskap | 3/10 |

### Vad som kvarstår för 10/10
- Verifiera AI-klassificering mot riktiga regulatoriska ändringar (kräver tid, inte kod)
- Få en betalande kund (kräver försäljning, inte kod)
- RAG-integration (plan sparad i memory, 3 alternativ utvärderade — avvaktar)

---

## Nästa session — förslag

1. **Deploya till Vercel** — koden är pushad men Vercel kanske behöver manuell deploy
2. **Verifiera CI/uptime/backup** — kolla att de 3 nya workflows fungerar
3. **Prata med testaren** — fråga vad som var mest värdefullt, be om citat
4. **LinkedIn-inlägg** — använd demo-sidan + testarens feedback
