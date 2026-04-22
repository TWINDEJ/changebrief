# HANDOFF — changebrief

## Session 2026-04-17 — Compliance-klassificering verifierad + blogg

### Vad som gjordes

**Compliance-verifiering (corpus + golden-tester):**
- 11 golden-tester i `tests/fixtures/compliance-cases/` som verifierar att GPT-5.4-mini klassar jurisdiction, documentType, complianceAction och importance korrekt
- Täcker FI, IMY, Naturvårdsverket, ESMA, Livsmedelsverket, EBA, EDPB, Kemikalieinspektionen, SEC, Arbetsmiljöverket + regressionscase (Trafikverket news-rotation)
- HTML-fixtures (inte Wayback) renderas till PNG via `scripts/render-compliance-fixtures.ts` → reproducerbart i CI
- `npm run test:compliance` kedjar render + vitest
- 11/11 passerar

**Hittad produktionsbugg (fix inkluderad):**
- `shared/vision.ts` använde `max_tokens` i stället för `max_completion_tokens` (ogiltigt för gpt-5.4-mini). Hela compliance-flödet var tyst brutet. Fixat på två ställen (shouldAnalyze + analyzeChange).

**Astro-blogg på changebrief.io:**
- `landing/src/content.config.ts` + content collections med schema (title, description, pubDate, author, tags, heroImage, draft)
- Parallella språkmappar `content/blog/en/` och `content/blog/sv/`
- `BlogPost.astro` ärver Base.astro, sätter JSON-LD BlogPosting + hreflang-par
- Dynamiska routes `/blog/[slug]` + `/sv/blogg/[slug]` + index-sidor
- 3 artiklar × 2 språk = 6 markdown-filer:
  1. "What is changebrief?" / "Vad är changebrief?"
  2. "Notisum vs changebrief"
  3. "Regulatory monitoring for ISO consultants" / "Lagbevakning för ISO-konsulter"
- 19 sidor byggs, sitemap inkluderar alla blogg-URLs

**Dashboard:**
- Todo 13 (verifiera compliance-klassificering) + 18 (blogg) avbockade i `privat-dashboard/src/data/projects.js`

**Global CLAUDE.md:**
- Ny regel tillagd: "Efter arbete i privata projekt — kolla alltid dashboard-todos om något kan bockas av"

### Var vi är
- master: 6 commits sedan senast (60022ce, 6c7d32b, 40b472e, 7a4b004, 09d35ff)
- privat-dashboard main: 1 commit (77eab44)
- Working tree: omfattande WIP från tidigare sessioner orört (app/src/app/dashboard/*, Header.astro, Footer.astro, i18n.ts m.fl.)

### Nästa steg
**Inom changebrief:**
- Committa eller rensa WIP (dashboard-app-filer med nya routes, Header/Footer tema-rewrite + blogg-länkar, i18n-tillägg)
- Cloudflare Pages-projektet heter fortfarande "pagewatch" efter rebrand
- Iterera vision-prompten: EU-consultations får stabilt 3-4 importance → filtreras bort vid default min=5
- RSS-feed för bloggen (`@astrojs/rss`)

**Dashboard-todos kvar på changebrief:**
- #12 Kontakta 2-3 compliance officers (Kristians eget)
- #14 RAG-integration (metadata-JSON)
- #15 Acknowledged/Reviewed-workflow
- #16 Teamfunktion
- #17 SEO-optimera /compliance

### Risker / känd begränsning
- GPT-5.4-mini betygsätter EU-remisser (consultations) stabilt 3-4 — filtreras bort vid default min_importance=5. Dokumenterat i fixture 04. Iterera prompt om kunder klagar.
- AI klassar jurisdiction efter publicerande myndighet, inte efter formell regelkälla (Kemi→SE även för EU-förordning). Matchar dock hur kunder tänker.

---

## Session 2026-04-02 — Mejl-inloggning (magic link) + DNS

### Vad som gjordes

**Mejl-inloggning (magic link):**
- Implementerade komplett magic link-auth baserat på dxassistant-mönstret
- Credentials provider (`magic-link`) i Auth.js med JWT-strategi
- `magic_tokens`-tabell i DB (token, email, expires, used)
- API-route `POST /api/auth/magic` — genererar token, skickar mejl via Resend
- Mellansida `/login/verify` med POST-knapp (skyddar mot Outlook SafeLinks)
- `EmailForm`-klientkomponent med states (idle/sending/sent/error)
- Login-sida uppdaterad: mejlfält ovanför OAuth med "or"-divider
- `allowDangerousEmailAccountLinking: true` på Google/GitHub
- Förbättrat mejlinnehåll (mindre phishy: subject med mejladress, footer, företagsinfo)

**DNS-konfiguration (Namecheap):**
- SPF uppdaterad: `v=spf1 include:amazonses.com include:spf.efwd.registrar-servers.com ~all`
- DKIM: redan verifierad (`resend._domainkey`)
