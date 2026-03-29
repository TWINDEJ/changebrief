# HANDOFF — changebrief

## Senast uppdaterad: 2026-03-29

## Vad gjordes denna session

### Notisum-konkurrensanalys → Implementation (8 faser + 3 iterationer)

**Fas 0: Ljust tema (hela produkten)**
- Dark `#06080f` → vit/slate-50 i landing + app
- 30+ filer uppdaterade: globals.css, alla dashboard-komponenter, landing-sidor
- Glass-effekter → vita kort med border-slate-200 + subtil shadow
- Glow-effekter borttagna, ersatta med subtila gradienter

**Fas 1: Compliance Action Summary**
- Ny `getComplianceActionSummary()` i db.ts
- Färgkodade rutor i dashboard: "3 actions pending | 2 review | 12 reviewed (7d)"

**Fas 2: Kvittens-workflow**
- DB: `reviewed_by`, `review_note` kolumner
- API: POST med reviewer-attribution, PATCH för anteckningar
- Two-speed review: snabbklick (default) + optional anteckning
- CSV export: +3 kolumner (reviewed_at, reviewed_by, review_note)

**Fas 3: Compliance Feed + Overview som flikar**
- Ny `ComplianceOverview` (tabell desktop / kort mobil)
- `ComplianceTabs` wrapper: "Senaste ändringar" / "Källor" / "Trend"
- localStorage för flik-val, print-stöd

**Fas 4: Nordiska myndigheter + jurisdiktionsfilter**
- 15 nya myndigheter (DK/NO/FI) i suggestions.json
- `jurisdiction`-fält på alla 71 poster
- Jurisdiktionsfilter SE|DK|NO|FI|EU|US i Discover

**Fas 5: Notifikationspreferenser**
- 3 DB-kolumner: notify_action_required (on), notify_review_recommended (on), notify_info_only (off)
- Engine respekterar preferenser innan notification dispatch
- Settings-toggles i dashboard

**Fas 6: Compliance-onboarding + empty states**
- 3-stegs wizard: jurisdiktion → sektor → "Add all recommended"
- Triggas via `?ref=compliance` från landing page
- Ghost empty state med mock Finansinspektionen-ändring

**Fas 7: Landing page omskrivning**
- 4 nya sektioner: "Why changebrief", ISO-framing, "Beyond legislation", siffror-strip
- "How it works" (3-stegs compliance-flöde)
- FAQ med Notisum-jämförelse + FAQPage JSON-LD
- Compliance-länk i header, highlighted regulatory use-case kort
- ~80 nya i18n-nycklar (EN+SV)

**Iterationer (bugfixes + UX)**
- OAuth ref=compliance bevaras genom login-flödet
- Väntindikator för URLs som väntar på första check
- RSS-feed synlig med copy-to-clipboard
- Export upgrade CTA istället för döda knappar
- Badge-tooltips (vad "Action required" betyder)
- Toast.tsx ljust tema
- Locale-provider ljust tema
- Svenska tecken (å,ä,ö) fixade i compliance-overview
- Weekly digest visar review-status + pending count
- Compliance-aware engine error (importance 8)
- Jurisdiktions-badge i activity feed

## Deployat
- Landing: Cloudflare Pages (changebrief.io) — ✅
- App: Vercel (app.changebrief.io) — ✅

## Commits
- `be3c247` — Light theme + Notisum-competitive features + compliance UX overhaul
- `a8ebd4b` — Fix: remove unused _initialWeeklyDigest
- `77121ff` — Fix: lint errors in compliance-onboarding

## Blockerare
- Compliance-klassificering väntar fortfarande på riktiga regulatoriska ändringar (myndigheter måste faktiskt uppdatera sina sidor)
- RAG-integration (8000 föreskrifter) planerad som framtida fas

## Nästa steg
1. Testa flödet live: signup via /compliance → onboarding → add authorities → vänta på check
2. Verifiera att Nordic authorities (DK/NO/FI) faktiskt fungerar med screenshots
3. Sätta upp testare / beta-användare
4. Överväga Notisum-specifik comparison page för SEO
