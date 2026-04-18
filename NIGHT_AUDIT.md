# NIGHT_AUDIT — changebrief UX/first-impression pass

**Date:** 2026-04-18 (overnight session)
**Branch:** `night-ux-improve-20260418-2322`
**Scope:** Low/medium-risk UX and copy improvements on landing + dashboard. No schema, pricing, auth, or webhook changes.

---

## ✅ Strengths

1. **Positioning is clear** on the compliance page: "monitor agency websites with AI — tells you exactly what changed, whether action is required, and which jurisdiction". Differentiator from pixel-diff tools is explicit.
2. **Real substance behind the marketing** — 74 pre-configured agencies (SE/DK/NO/FI/EU/US/INTL) in `app/src/data/suggestions.json`, sector onboarding, SLA tracking, audit-trail export — not vaporware.
3. **i18n is comprehensive** — every major string in landing + app is translated (en/sv), 212 keys in landing, 188 in app.
4. **Dashboard first-value experience is thoughtful** — new-user onboarding card, ghost preview of compliance changes when empty, "waiting for first check" banner so users understand the 6-hour cadence.
5. **Compliance feed UX is mature** — SLA-overdue indicator, action-required/review/info badges with tooltips, jurisdiction filtering, team assignment, CSV export, "Mark as reviewed" with reviewer attribution.
6. **Pricing page transparency** — Free tier exists with 3 pages/7-day history; upgrades clearly flagged.
7. **ISO 14001/45001 framing on the compliance landing** is a smart wedge — auditors ask about acknowledgment workflows and the product answers that exactly.
8. **Demo page** at `/demo` is a real anonymous experience with realistic mock data (Finansinspektionen, IMY, DORA, etc.) — a good "try before signup" path.
9. **Trust/compliance pages** — `/security`, `/dpa`, `/privacy`, `/terms` all exist.

## ❌ Weaknesses — ranked by conversion impact

1. **Landing hero is generic, not RegTech-first.** The main `/` headline ("See what changed, not just that something changed") positions as a visual-diff tool. Compliance leads land here first and have to click through to `/compliance` to see themselves. No quantitative proof (74 agencies, etc.) above the fold. **(High impact)**
2. **No trust-signal strip on landing.** Numbers exist in i18n (`60+ authorities`, `5 countries`, `8 sectors`, `9 integrations`) but only appear on the compliance sub-page. Home page has zero numeric proof. **(High)**
3. **Primary CTA lacks friction-killer microcopy.** "Get started free" — no line underneath saying "no credit card required" or "3 sources free forever". **(High)**
4. **Dashboard compliance empty state has no CTA.** Shows ghost preview + "Add agencies from Discover below" but no actual button/anchor to jump to Discover. User has to scroll to find it. **(High for activation)**
5. **"Export audit trail" link is visually weak.** Rendered as small slate text alongside filter buttons — looks like secondary filter control, not a feature. Pro users may not notice it exists. **(Medium)**
6. **Accessibility gaps on icon-only buttons.** Settings gear (dashboard header), theme toggle, language switcher, OAuth SVGs on login, remove-row `×` in add-url form — none have `aria-label`. **(Medium — compliance/enterprise buyers care)**
7. **Login page has no email/magic-link fallback.** OAuth-only (Google + GitHub). Compliance officers at banks often don't have a personal GitHub/Google account they can use for work. **(Medium — but out of scope for tonight; requires auth changes.)**
8. **Demo page CTA only appears at very bottom.** Top has a thin banner; after scrolling the full stats + feed + sources, the Sign Up card is 900px down. Users who scroll midway see no call to action. **(Low/Medium)**
9. **"Compliance account" subtext on login is unexplained** (only shown when `?ref=compliance`). **(Low)**
10. **Generic `Onboarding` card doesn't surface the compliance path.** New users who don't come via `?ref=compliance` get the generic 3-step card with no link to the RegTech onboarding flow. **(Low)**

## 💡 Improvement backlog

| # | Priority | Idea |
|---|---|---|
| 1 | High | Add proof-strip below hero CTAs with real numbers: "74+ authorities · Nordic + EU + US · AI-classified · EU-hosted" |
| 2 | High | Microcopy under primary CTA: "Free — no credit card · 3 sources forever" |
| 3 | High | Dashboard compliance empty state: add anchor-CTA button that scrolls to Discover |
| 4 | High | Compliance feed export: icon + more visible styling; make "Upgrade for CSV" card look like a feature teaser |
| 5 | Medium | Onboarding card: add "Monitor regulatory sources?" link that kicks off compliance onboarding |
| 6 | Medium | Add `aria-label` to icon-only buttons across dashboard + landing |
| 7 | Medium | Add a secondary inline CTA banner midway through the demo page |
| 8 | Low | A/B: swap landing hero headline to RegTech-first on sv/ variant once traffic sources are known |
| 9 | Low | Add email / magic-link auth fallback (requires auth changes — defer) |
| 10 | Low | Add pagination or "Load more" to compliance feed at >100 entries |

---

## Changes implemented tonight

Four commits on `night-ux-improve-20260418-2322`. All builds pass (Next.js `app` + Astro `landing`) and `npm test` stays at 29/29.

### Commit 1 — `landing: add hero proof strip and no-card microcopy`
- `landing/src/i18n.ts` — three new keys: `hero.nocard`, `hero.proof.intro`, `hero.proof.compliance` (en + sv).
- `landing/src/components/LandingPage.astro` — under the hero CTA pair:
  - *"Free forever for 3 pages · no credit card"* friction-killer line.
  - Proof strip reusing existing `reg.proof.*` keys (60+ authorities · 5 countries · 8 sectors · 9 integrations).
  - "Built for compliance teams →" deep-link to `/compliance` (or `/sv/compliance`) for the regulatory segment.

### Commit 2 — `dashboard: activation CTA in compliance empty state, visible audit export`
- `app/src/app/dashboard/page.tsx` — added `id="discover"` and `scroll-mt-20` on the Discover section so anchor-links land cleanly under the sticky header.
- `app/src/app/dashboard/compliance-feed.tsx`:
  - Empty state: replaced the passive "Add agencies below" hint with a gradient "Add agencies" button anchored to `#discover`. Copy also reworded to emphasise AI classification.
  - Export audit trail link now has a download icon, CSV pill, solid border and shadow — pro/team users stop missing it. The upgrade-variant for free users mirrors the treatment.

### Commit 3 — `a11y: aria-labels on icon-only buttons`
- `app/src/app/dashboard/theme-toggle.tsx` — aria-label + `aria-hidden` on the decorative SVGs.
- `app/src/app/locale-provider.tsx` (LanguageSwitcher) — aria-label.
- `app/src/app/dashboard/page.tsx` — settings-gear `<summary>` gains aria-label + title; feedback mailto link gets aria-label; inner SVGs marked `aria-hidden`.
- `app/src/app/login/page.tsx` — Google/GitHub submit buttons get aria-label; brand SVGs marked decorative.
- `landing/src/components/Header.astro` — theme toggle + language switcher aria-labels; SVGs marked decorative.

### Commit 4 — `activation: surface compliance onboarding and mid-scroll demo CTA`
- `app/src/app/dashboard/onboarding.tsx` — adds a bordered tray under the three-step card: *"Monitoring regulatory sources? → Start compliance onboarding"* linking to `/dashboard?ref=compliance`, which the existing server logic already routes to `ComplianceOnboarding`.
- `app/src/app/demo/page.tsx` — inserts a blue-tinted conversion banner between the activity feed and the sources grid: "Monitor your own sources in 60 seconds" + "Start free" button. Closes the gap between top banner and bottom CTA.

### Files touched
```
landing/src/i18n.ts
landing/src/components/LandingPage.astro
landing/src/components/Header.astro
app/src/app/dashboard/page.tsx
app/src/app/dashboard/compliance-feed.tsx
app/src/app/dashboard/theme-toggle.tsx
app/src/app/dashboard/onboarding.tsx
app/src/app/locale-provider.tsx
app/src/app/login/page.tsx
app/src/app/demo/page.tsx
NIGHT_AUDIT.md (this file)
```

## Not changed (requires Kristian's decision)

1. **Landing hero headline.** The current "See what changed, not just that something changed" positions as a generic visual-diff tool. RegTech buyers have to click through to `/compliance` to see themselves. Swapping headline copy on `/` is a higher-impact change but affects brand positioning — deferred for Kristian.
2. **Login auth methods.** No email / magic-link fallback today; enterprise compliance buyers often lack personal Google/GitHub. Auth changes are explicitly out of scope for this branch.
3. **Analytics / Plausible / PostHog.** `app/src/app/layout.tsx` loads no tracking script. Nothing to toggle on tonight without introducing a new dep or env var. Prompt said to skip if none is present.
4. **Compliance feed pagination.** At >100 entries the feed renders everything at once. A "Load more" pattern is medium effort and touches `getComplianceHistory` (server) plus state — left alone.
5. **Demo page i18n.** Entirely hard-coded English strings. Translating properly touches ~20 strings and the shared `t()` pattern; worth doing but I'd want product sign-off on the tone.
6. **Compliance onboarding preview of agencies.** The 3-step wizard doesn't show agency counts before commit; would be a useful transparency improvement but requires changes to the suggestions pipeline.

## Hypotheses for next pass (data-driven ideas)

1. **Swap `/` hero to RegTech-first for organic traffic.** Hypothesis: >50 % of referring traffic is compliance-intent (SEO for "regulatory monitoring", "Finansinspektionen bevakning"). Split-test the RegTech headline currently on `/compliance` on `/` itself.
2. **Conversion lift from the mid-demo CTA.** Measure click-through rate on the new mid-scroll button vs. the top banner and bottom CTA. If the middle CTA captures >30 % of demo-to-signup clicks, add a second nudge after the sources grid.
3. **Empty-state CTA click-through.** Instrument `#discover` anchor clicks from the compliance empty state vs. users who scroll manually. Prediction: 2-3× activation lift for users stuck at zero changes.
4. **Weekly digest as primary hook.** Users who enable weekly digest have a retention signal (they chose async engagement). Check if digest-on users have higher 30-day retention and, if so, make digest-on the default for new accounts.
5. **"Pro for CSV export" funnel.** The more visible export button will surface more upgrade clicks. Watch the `/api/export/compliance` 403→checkout rate. If the ratio shifts toward upgrade clicks, consider adding an inline CSV preview modal so free users feel the gap viscerally.

---

## Test plan

- Landing: visit `/` and `/sv` in both light and dark mode, confirm proof strip wraps correctly on narrow viewport.
- Dashboard empty state: sign in as a new user with no compliance history, confirm "Add agencies" button scrolls to Discover.
- Dashboard export: on free plan, confirm upgrade CTA shows; on pro/team, confirm CSV download link has the download icon.
- Login: run axe or Lighthouse accessibility audit — OAuth buttons should no longer flag missing accessible names.
- Demo: visit `/demo`, confirm mid-scroll CTA appears between feed and sources on mobile and desktop.

