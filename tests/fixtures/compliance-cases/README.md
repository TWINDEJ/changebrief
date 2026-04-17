# Compliance-klassificering — fixture-corpus

Syfte: verifiera att GPT-4o (via `shared/vision.ts analyzeChange`) faktiskt klassar
jurisdiction, documentType, complianceAction och importance korrekt — inte bara att
nedströms filtrering respekterar värdena.

## Format

Varje case = en JSON-fil:

```json
{
  "name": "FI-DORA-2025-vagledning",
  "url": "https://www.fi.se/sv/...",
  "category": "Finance & Banking",
  "locale": "sv",
  "beforeHtml": "<html>...</html>",
  "afterHtml": "<html>...</html>",
  "expected": {
    "jurisdiction": "SE",
    "documentType": "guidance",
    "complianceAction": "review_recommended",
    "importanceMin": 6,
    "importanceMax": 9,
    "hasSignificantChange": true
  }
}
```

## Workflow

```bash
# 1. Rendera HTML till PNG (endast första gången eller när fixtures ändrats)
npx ts-node scripts/render-compliance-fixtures.ts

# 2. Kör testet (kräver OPENAI_API_KEY)
OPENAI_API_KEY=... npm run test:compliance
```

## Kostnad

~6 GPT-5.4-mini-vision-anrop per körning = ~$0.05 totalt.

## Lägga till fler cases

1. Skapa `NN-namn.json` med metadata + ground-truth.
2. Kör render-skriptet igen.
3. Kör testet.
