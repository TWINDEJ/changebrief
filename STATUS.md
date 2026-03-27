# Status — changebrief

## Fas: RegTech MVP + Compliance Dashboard

## Infrastruktur
- [x] Landing page live (changebrief.io) — EN + SV
- [x] Compliance landing page live (changebrief.io/compliance) — EN + SV
- [x] Webbapp live (app.changebrief.io) — EN + SV
- [x] Turso-databas i produktion
- [x] GitHub Actions cron (var 6h) — URL checks med screenshot-cache
- [x] GitHub Actions cron (fredag 08:00 UTC) — Weekly digest (verifierad E2E 2026-03-27)
- [x] Polar + Stripe godkänd och live
- [x] Polar webhook med signaturverifiering (Standard Webhooks)
- [x] Google + GitHub OAuth konfigurerat
- [x] DNS korrekt (Namecheap + Vercel + Cloudflare Pages)
- [x] Resend verified (changebrief.io, eu-west-1)
- [x] Email forwarding: kristian@changebrief.io → thewigander@gmail.com (Namecheap)
- [x] Reply-To: kristian@changebrief.io på alla utgående mejl
- [x] OpenAI kostnadsloggning i engine (tokens + USD per körning)

## Features — Core
- [x] Playwright screenshots (desktop + mobil, selektorer, cookies, headers)
- [x] Pixelmatch diff med konfigurerbar tröskel
- [x] GPT-4o Vision-analys med importance scoring
- [x] Strukturerad text-extraktion (priser, rubriker, knappar, länkar, listor)
- [x] Brus-strippning (timestamps, cookies, session-IDs, UUIDs)
- [x] GPT-4o-mini pre-filter (billig "worth analyzing?" check)
- [x] Pris-shortcut (prisändringar → direkt till full analys)
- [x] Screenshot-cache i GitHub Actions (baselines bevaras mellan körningar)
- [x] Auth: Google + GitHub login
- [x] i18n: EN/SV i hela appen + landing page
- [x] Veckorapport (weekly digest) — verifierad E2E
- [x] Mobilresponsiv dashboard

## Features — RegTech
- [x] AI compliance-klassificering: action_required / review_recommended / info_only
- [x] Jurisdiktions-taggning (SE, EU, US) per ändring
- [x] Dokumenttyp-identifiering (regulation, guidance, consultation, decision, standard, law)
- [x] 58 watchlists i 12 sektorer (26 myndigheter SE/EU/US)
- [x] Compliance Feed — dashboard-sektion med action-badges och filter
- [x] Compliance Trend — stacked bar chart per myndighet
- [x] Compliance audit trail CSV-export (/api/export/compliance)
- [x] RSS-feed per sektor (/api/feed med jurisdiction/action-filter)
- [x] Compliance-sektion i weekly digest (action counts + badges)
- [x] Slack/Teams/Email med compliance-badges (🔴 ACTION / 🟡 Review / ℹ️ Info)

## Features — Dashboard UX
- [x] Activity Feed med "Ändringar"-filter (döljer no-change-rader, default)
- [x] Settings via kugghjulsikon i Activity-header (solid popup)
- [x] Expanderbara monitored page-kort (threshold, viewport, importance, full URL)
- [x] Discover: 12 items default, stabil grid-höjd vid filtrering
- [x] Add-animation vid +Add i Discover (scale + green ring)
- [x] Feedback-knapp i header (pulsande amber, mailto med 5 frågor)
- [x] Upgrade-knapp i dashboard (Pro/Team via Polar checkout)
- [x] Plan-baserade begränsningar (URL/check limits, history retention)

## Behöver verifieras
- [ ] Compliance-klassificering med riktiga regulatoriska ändringar (väntar på att myndigheter uppdaterar)
- [ ] Strukturerad diff med faktiska textändringar
- [ ] GPT-4o-mini pre-filter i produktion

## Kvar att bygga
- [ ] RAG-integration med lokal-rag (8000 föreskrifter) — Fas 1: metadata-JSON
- [ ] Acknowledged/Reviewed-workflow (markera ändringar som granskade)
- [ ] Teamfunktion (delade bevakningslistor)
- [ ] Brusprofil per URL (auto-lär vilka delar som är dynamiska)
- [ ] Loading skeletons i dashboard
- [ ] SEO-optimering av /compliance (meta, structured data)
