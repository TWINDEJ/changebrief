# HANDOFF — changebrief

## Session 2026-03-27 (eftermiddag)

### Vad som gjordes

**RegTech-expansion (Fas 1-3) — komplett:**
- DB-schema: 4 nya kolumner (category, jurisdiction, document_type, compliance_action)
- 58 watchlists i 12 sektorer — 26 svenska/EU-myndigheter
- AI-prompt: GPT-4o klassificerar regulatoriska ändringar med jurisdiktion, dokumenttyp, åtgärdsnivå
- Compliance Feed i dashboarden med action-badges och filter
- Compliance Trend — stacked bar chart per myndighet
- Audit trail CSV-export (/api/export/compliance)
- RSS-feed (/api/feed med jurisdiction/action-filter)
- Compliance-sektion i weekly digest
- Slack/Teams/Email med compliance-badges
- Dedikerad landing page: /compliance (EN) + /sv/compliance (SV)

**Teknisk skuld — löst:**
- Polar webhook-signaturverifiering aktiverad
- Weekly digest E2E-testad (2 mejl skickade framgångsrikt)
- OpenAI kostnadsloggning per engine-körning (tokens + USD)
- tsconfig.json fixad för GitHub Actions (types: ["node"])

**Dashboard UX:**
- Activity Feed: "Ändringar"-filter som default (döljer no-change-rader)
- Settings: kugghjulsikon i Activity-header istället för separat sektion
- Expanderbara monitored page-kort (klicka → detaljer)
- Discover: 12 items default, stabil grid-höjd, add-animation
- Feedback-knapp i header (pulsande amber, mailto kristian@changebrief.io)
- CSS-animationer (fade-in, fade-in-scale)

**E-post:**
- kristian@changebrief.io konfigurerad via Namecheap Email Forwarding → thewigander@gmail.com
- Reply-To på alla utgående mejl (notiser + digest)

### Var vi är

RegTech MVP komplett. Alla features deployade. Väntar på att myndigheter uppdaterar sidor så compliance-klassificering triggas i produktion. Baselines tagna för Trafikverket + Finansinspektionen.

### Nästa steg

1. **Hitta 2-3 compliance-testare** — Kristian kontaktar via LinkedIn/mejl (personligt, ej Twindej)
2. **RAG-integration** — Koppla lokal-rag:s 1900 indexerade föreskrifter. Fas 1: exportera metadata-JSON
3. **Acknowledged/Reviewed-workflow** — Markera ändringar som granskade (audit trail)
4. **Teamfunktion** — Delade bevakningslistor, motiverar Team-planen
5. **SEO** — Optimera /compliance för sökmotorer

### Kvarstående tekniskt
- [ ] Verifiera compliance-klassificering med riktiga regulatoriska ändringar
- [ ] Verifiera GPT-4o-mini pre-filter i produktion
- [ ] Kolla OpenAI-kostnad efter ett par dagars körningar (loggas nu per körning)

### Deploy-process
- **App (Vercel):** `cd app && npx vercel --prod --yes` (auto-deploy fungerar INTE pålitligt via git push)
- **Landing (Cloudflare):** `cd landing && npm run build && npx wrangler pages deploy dist --project-name pagewatch`
- **Engine (GitHub Actions):** Triggas automatiskt var 6h, eller `gh workflow run check-urls.yml`
