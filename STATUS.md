# STATUS — changebrief

## Uppdaterad: 2026-03-29

## Status: Live — Notisum-konkurrensfunktioner deployade

### Teknik
- **Landing:** Cloudflare Pages (changebrief.io) — ✅ live
- **App:** Vercel (app.changebrief.io) — ✅ live
- **DB:** Turso (eu-west-1) — schema uppdaterat med reviewed_by, review_note, notification preferences
- **Engine:** GitHub Actions cron var 6h

### Nya funktioner (2026-03-29)
- Ljust tema (hela produkten)
- Compliance Action Summary (dashboard)
- Kvittens-workflow med reviewer-attribution
- Compliance Overview-tabell (sortbar, filtrerbar, mobilanpassad)
- Flikar: Senaste ändringar / Källor / Trend
- 71 myndigheter (15 nya nordiska: DK/NO/FI)
- Jurisdiktionsfilter i Discover
- Notifikationspreferenser per åtgärdsnivå
- Compliance-onboarding (3-stegs wizard)
- Landing page: Why, ISO, Beyond, FAQ, How it works
- RSS synlig, badge-tooltips, väntindikator, export upgrade CTA

### Blockerare
- Compliance-klassificering ej verifierad med riktiga regulatoriska ändringar
- RAG-integration (8000 föreskrifter) — framtida fas

### Väntar på
- Testare / beta-användare
- Riktiga regulatoriska ändringar att verifiera AI-klassificering mot
