---
title: "Notisum vs changebrief: när behöver du vilken?"
description: "Notisum är svensk standard för lagbevakning. changebrief gör något annat. Här är en ärlig jämförelse så du kan välja rätt verktyg — eller använda båda."
pubDate: 2026-04-18
author: "Kristian Wigander"
tags: ["compliance", "lagbevakning", "jämförelse"]
---

Om du gör lagbevakning i Sverige har du förmodligen använt Notisum. Det är standarden, det fungerar och ISO-revisorer vet vad det är. Så varför skulle du ens titta på något annat?

Kort svar: Notisum och changebrief löser överlappande men olika problem. Det här inlägget är en ärlig jämförelse — jag har byggt changebrief, men jag tänker inte låtsas att det ersätter Notisum för alla användningsfall.

## Vad Notisum gör

Notisum är en juridisk databas. Den täcker svenska lagar, förordningar och myndighetsföreskrifter, med uppdateringar när själva lagtexten ändras. Pitchen: du behöver inte läsa Svensk författningssamling själv — Notisum spårar den och levererar ett kurerat flöde.

Styrkor:
- Strukturerad åtkomst till den officiella juridiska korpusen.
- ISO 14001 / 45001-revisorer känner igen verktyget.
- Korsreferenser mellan lagar, förordningar och föreskrifter.
- Juridiska tolkningar skrivna av jurister.

Svagheter:
- Långsam på allt som inte är en formell lagändring. Vägledningar, remisser, myndighets-Q&A, tillsynsbeslut — dessa syns ofta på myndighetssidan dagar eller veckor innan Notisum fångar upp dem.
- Stängd portal. Ingen Slack, inga webhooks, ingen RSS. Du loggar in för att läsa.
- Dyr per användare. Team som vill ha delad åtkomst betalar per person.
- Svensk lag är scope. EU-vägledning, EDPB-yttranden, ESMA-Q&As, SEC final rules — där får du klara dig själv.

## Vad changebrief gör

changebrief bevakar valfri webbsida du pekar den mot. Den tar skärmdumpar, jämför före/efter och använder GPT-4o Vision för att berätta vad som ändrades i en mening. För regulatoriska URL:er klassificerar den också jurisdiktion, dokumenttyp (föreskrift, vägledning, remiss, beslut) och om ändringen kräver åtgärd.

Styrkor:
- Bevakar *källan*. När FI publicerar ny DORA-vägledning på sin webbsida vet du det idag — inte när en jurist i en juridisk databas skrivit en sammanfattning.
- Vilken URL som helst fungerar. EU-myndigheter, amerikanska SEC, branschstandard-organ, branschorganisationer.
- API-first. Slack, Teams, e-post, RSS, webhooks, CSV-export.
- Fast pris, inte per användare.

Svagheter:
- Ingen juridisk databas. Vi lagrar inte lagtexten — vi säger att den ändrats och visar diffen.
- AI-klassificering är ~95% träffsäker, inte 100%. Vi publicerar vår test-corpus så du kan se var vi felar.
- Inga korsreferenser eller juridisk tolkning. Det är inte vårt jobb.
- Nyare: vi har inte samma namnkännedom hos ISO-revisorer ännu.

## När du ska använda vilken

**Använd Notisum om:**
- Ditt primära behov är svensk lag och du behöver juridisk tolkning.
- Din ISO-revisor specifikt ber om det (vanligt för 14001/45001).
- Du är okej med fördröjningen mellan att något ändras och att det dyker upp i databasen.

**Använd changebrief om:**
- Du behöver snabbhet. Myndighetsvägledning, EU-remisser och tillsynsbeslut dyker upp på webbsidor först.
- Du bevakar EU, USA eller internationella källor utöver de svenska.
- Du vill ha notiser i Slack eller e-post — inte "logga in i portalen".
- Du spårar *specifika sidor* (en enskild föreskrift, en tillsynssida, ett Q&A-arkiv) snarare än hela svenska lagkorpusen.

**Använd båda om:**
- Du gör seriöst compliance-arbete för en reglerad bransch (finans, läkemedel, energi). Notisum för den statutära registerhållningen, changebrief för det levande flödet av vägledning och remisser.

## Ett konkret exempel

Förra månaden publicerade Finansinspektionen ny DORA-vägledning. Den dök upp på fi.se på morgonen 10 april. En changebrief-användare med fi.se/publicerat/vagledningar/ i sin bevakningslista fick en Slack-notis vid 12:00-cron-körningen: *"FI publicerade ny DORA-vägledning — rekommenderas granskas."*

Notisums DORA-täckning uppdaterades sex dagar senare, med en fullständig juridisk sammanfattning. Båda är användbara. Olika verktyg, olika jobb.

## Testa changebrief

Gratis att komma igång. Inget kreditkort. Lägg in de tre viktigaste sidorna för din roll och se hur de första två veckorna ser ut. Om det inte ersätter något du redan betalar för — fint, säg upp. Men det kommer förmodligen fånga saker som ditt nuvarande upplägg missar.

→ [Skapa konto](https://app.changebrief.io)
