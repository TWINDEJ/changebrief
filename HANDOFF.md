# HANDOFF — changebrief

## Session 2026-03-29 (stor session)

### Vad som gjordes

**Dark mode fix**
- ~100 CSS-overrides i globals.css som automatiskt mappar alla Tailwind-klasser under `[data-theme="dark"]`
- GitHub-ikon på login fixad med `currentColor`

**5 konkurrensfeatures (från konkurrentanalys)**
1. PDF-rapport — compliance audit trail med jsPDF (klientsida, Pro+)
2. GRC webhook — globalt webhook URL i settings, strukturerad JSON-payload (Pro+)
3. Team-tilldelning — assign ändringar till kollegor via email (Team)
4. SLA-uppföljning — konfigurerbara granskningstider med overdue-flaggor (Pro+)
5. Bulk add sources — "Lägg till alla" per land/kategori i Discover

**Mejl- & rapport-lokalisering (SV/EN)**
- Ändringsnotis: full SV/EN + CTA-knapp + "Hantera inställningar"-länk
- Veckodigest: full SV/EN + locale-medvetna datum + lokaliserad subject-rad
- PDF-titel lokaliserad
- Ny `locale` kolumn i users-tabellen, sparas vid språkbyte

**UX-förbättringar (4 rundor)**
- Toast: slide-in/out + notifikationsljud (Web Audio API)
- Knappar: scale(0.97) press-feedback
- AnimatedNumber: count-up på stats-kort med IntersectionObserver
- Sticky header med glasmorfism vid scroll
- Konfetti vid URL-tillägg (canvas-baserad)
- FaviconBadge: visar ogranskade antal i browsertabben
- LiveTime: auto-uppdaterande relativa tider (varje minut)
- Smooth expand/collapse på feed-items
- Gradient card borders vid hover (CSS mask)
- Smooth theme toggle (300ms transition)
- CopyUrl: hover-reveal kopieringsknapp med flash-animation
- Shimmer-skeletons istället för pulse
- CSS tooltips (pure CSS, theme-aware)
- Keyboard shortcut hint (first visit, 3s delay)
- Status pulse ring på aktiva URLs

**Enterprise-readiness (landing page)**
- Security & Trust-sida (`/security` + `/sv/security`)
- Privacy Policy (`/privacy` + `/sv/privacy`)
- Terms of Service (`/terms` + `/sv/terms`)
- DPA — Data Processing Agreement (`/dpa`) med print/PDF-knapp
- Enterprise pricing-tier (SSO, DPA, SLA, faktura)
- Uppdaterade Pro/Team-tiers med nya features
- Footer med alla juridiska länkar
- Login-sidans "terms of service" länkar nu till /terms

**Konkurrentanalys**
- COMPETITIVE-ANALYSIS.md med 15 konkurrenter, 8 marknadsluckor, prisrekommendation
- Ny konkurrent upptäckt: Changeflow (närmast changebrief)

### DB-migrationer (körs automatiskt)
- `users.webhook_url TEXT` — globalt GRC webhook
- `users.sla_action_hours INTEGER DEFAULT 48`
- `users.sla_review_hours INTEGER DEFAULT 168`
- `users.locale TEXT DEFAULT 'en'`
- `change_history.assigned_to TEXT`
- `change_history.assigned_at TEXT`

### Nya filer
- `app/src/app/dashboard/animated-number.tsx`
- `app/src/app/dashboard/confetti.tsx`
- `app/src/app/dashboard/compliance-pdf-export.tsx`
- `app/src/app/dashboard/copy-url.tsx`
- `app/src/app/dashboard/dashboard-shell.tsx`
- `app/src/app/dashboard/favicon-badge.tsx`
- `app/src/app/dashboard/live-time.tsx`
- `app/src/app/dashboard/scroll-header.tsx`
- `app/src/app/dashboard/shortcut-hint.tsx`
- `app/src/app/api/assign/route.ts`
- `app/src/app/api/locale/route.ts`
- `landing/src/components/SecurityPage.astro`
- `landing/src/pages/security.astro` + sv
- `landing/src/pages/privacy.astro` + sv
- `landing/src/pages/terms.astro` + sv
- `landing/src/pages/dpa.astro`

---

## Nästa session — vad som återstår

### Blockerare för enterprise-försäljning
1. **Multi-user / Org-modell** — Idag är varje user isolerad. Behövs: organizations-tabell, team invites, delat dashboard, roller (Admin/Reviewer/Viewer). STOR insats men enda tekniska blockeraren för teamförsäljning.
2. **Fakturabetalning** — Polar/Stripe kräver kort. Behöver manuell faktura-process eller Stripe Invoicing för enterprise.

### Hög effekt (bygger förtroende)
3. **Interaktiv demo utan inloggning** — Låt besökare se en mock-dashboard
4. **Kundcitat / logotyper** — Social proof från tidiga testare
5. **API-dokumentation** — Webhook payload-spec, endpoints
6. **Statuspage** — status.changebrief.io (gratis via Instatus/Upptime)
7. **Onboarding-video** (60 sek) — Landing page video konverterar 2-3x

### Tekniska förbättringar
8. **SSO/SAML implementation** — Nämns på Enterprise-sidan men inte byggt
9. **Webhook i engine** — GRC webhook sparas i settings men engine:n skickar inte till den ännu (bara per-URL webhook)
10. **DPA som riktig PDF** — Nu print-vänlig HTML, kunde vara genererad PDF
11. **Flerspråkiga AI-summaries** — AI:n skriver alltid på engelska, kunde sammanfatta på SV

### Positioning (från konkurrentanalysen)
- **One-liner:** "RegTech-grade regulatory monitoring at SMB prices"
- **Sweet spot:** $149/mån compliance-plan (mellan $99/mån webbövervakare och $50K/år enterprise RegTech)
- **Närmaste konkurrent:** Changeflow (saknar visuell övervakning + nordiskt fokus)
- **Moat:** Enda verktyget som kombinerar screenshot-monitoring + AI-förklaring + compliance-klassificering + review workflow + nordiskt fokus + överkomlig self-serve-prissättning
