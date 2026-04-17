---
title: "Notisum vs changebrief: when do you need which?"
description: "Notisum is the Swedish standard for law monitoring. changebrief does something different. Here's an honest side-by-side so you can pick the right tool — or use both."
pubDate: 2026-04-18
author: "Kristian Wigander"
tags: ["compliance", "lagbevakning", "comparison"]
---

If you do *lagbevakning* in Sweden, you've probably used Notisum. It's the default, it works, and ISO auditors know what it is. So why would you look at something else?

Short answer: Notisum and changebrief solve overlapping but different problems. This post is an honest comparison — I built changebrief, but I'm not going to pretend it replaces Notisum for every use case.

## What Notisum does

Notisum is a legal database. It covers Swedish laws, ordinances, and agency regulations (*föreskrifter*), with updates pushed when the legal text itself changes. The pitch: you don't have to read the *Svensk författningssamling* yourself — Notisum tracks it and delivers a curated feed.

Strengths:
- Structured access to the official legal corpus.
- ISO 14001 / 45001 auditors recognize it.
- Cross-references between laws, ordinances, and föreskrifter.
- Legal interpretations written by jurists.

Weaknesses:
- Slow on anything that isn't a formal law change. Guidance, consultations, agency Q&A, tillsynsbeslut — these often appear on the agency website days or weeks before Notisum surfaces them.
- Closed portal. No Slack, no webhooks, no RSS. You log in to read.
- Expensive per seat. Teams that want shared access pay per user.
- Scope is Swedish law. EU guidance, EDPB opinions, ESMA Q&As, SEC final rules — you're on your own.

## What changebrief does

changebrief monitors any webpage you point it at. It takes screenshots, compares before/after, and uses GPT-4o Vision to tell you what changed in one sentence. For regulatory-category URLs, it also classifies jurisdiction, document type (regulation, guidance, consultation, decision), and whether the change requires action.

Strengths:
- Watches the *source*. When FI publishes new DORA guidance on their website, you know today — not when a jurist at a legal database has written a summary.
- Any URL works. EU agencies, US SEC, industry standards bodies, trade associations.
- API-first. Slack, Teams, email, RSS, webhooks, CSV export.
- Flat pricing, not per seat.

Weaknesses:
- Not a legal database. We don't store the law text — we tell you it changed and show you the diff.
- AI classification is ~95% accurate, not 100%. We publish our test corpus so you can see where we fail.
- No cross-references or legal interpretation. That's not our job.
- Newer: we don't yet have the same name recognition with ISO auditors.

## When to use which

**Use Notisum if:**
- Your primary need is Swedish statutory law and you need legal interpretation.
- Your ISO auditor specifically asks for it (common for 14001/45001).
- You're okay with the lag between a change happening and it appearing in the database.

**Use changebrief if:**
- You need speed. Agency guidance, EU consultations, and tillsynsbeslut appear on websites first.
- You monitor EU, US, or international sources as well as Swedish.
- You want notifications in Slack or email — not "log in to the portal."
- You're tracking *specific pages* (a single föreskrift, a tillsynssida, a Q&A archive) not the whole Swedish legal corpus.

**Use both if:**
- You're doing serious compliance work for a regulated industry (finance, pharma, energy). Notisum for the statutory record, changebrief for the live stream of guidance and consultations.

## A concrete example

Last month, Finansinspektionen published new DORA guidance. It appeared on fi.se the morning of April 10. A changebrief user with fi.se/publicerat/vagledningar/ in their monitoring list got a Slack notification by the 12:00 cron run: *"FI published new DORA guidance — review recommended."*

Notisum's DORA coverage was updated six days later, with a full legal summary. Both are useful. Different tools, different jobs.

## Try changebrief

Free to get started. No credit card. Add the three most important pages for your role and see what the first two weeks look like. If it doesn't replace anything you're already paying for — fine, cancel. But it'll probably catch things your current setup misses.

→ [Create account](https://app.changebrief.io)
