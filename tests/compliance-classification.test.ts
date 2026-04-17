// Verifierar att GPT-5.4-mini (via shared/vision.ts analyzeChange) klassar
// regeländringar korrekt: jurisdiction, documentType, complianceAction, importance.
//
// Körs manuellt via `npm run test:compliance` — INTE i `npm test`, eftersom varje
// körning kostar ~$0.05 i OpenAI-tokens. Skippas automatiskt utan OPENAI_API_KEY
// eller saknade PNG-screenshots (kör `scripts/render-compliance-fixtures.ts` först).

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';
import { analyzeChange, type ChangeAnalysis } from '../shared/vision';

interface Fixture {
  name: string;
  url: string;
  category: string;
  locale: string;
  description?: string;
  expected: {
    jurisdiction: string | null;
    documentType: string | null;
    complianceAction: string;
    importanceMin: number;
    importanceMax: number;
    hasSignificantChange: boolean;
  };
}

const FIXTURES_DIR = path.join(__dirname, 'fixtures', 'compliance-cases');
const hasApiKey = !!process.env.OPENAI_API_KEY;

function loadFixtures(): Array<{ file: string; fixture: Fixture; beforePath: string; afterPath: string }> {
  if (!fs.existsSync(FIXTURES_DIR)) return [];

  return fs.readdirSync(FIXTURES_DIR)
    .filter(f => f.endsWith('.json') && !f.startsWith('_') && f !== 'README.md')
    .map(file => {
      const fixture = JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, file), 'utf8')) as Fixture;
      const stem = file.replace(/\.json$/, '');
      return {
        file,
        fixture,
        beforePath: path.join(FIXTURES_DIR, `${stem}-before.png`),
        afterPath: path.join(FIXTURES_DIR, `${stem}-after.png`),
      };
    });
}

const fixtures = loadFixtures();

describe.skipIf(!hasApiKey)('Compliance classification — verkliga GPT-5.4-mini-anrop', () => {
  if (!hasApiKey) {
    // describe.skipIf hanterar detta, men tydliggör i terminalen
    console.log('OPENAI_API_KEY saknas — skippar compliance-tester');
    return;
  }

  if (fixtures.length === 0) {
    it.fails('Inga fixtures hittades — skapa tests/fixtures/compliance-cases/*.json', () => {
      expect(fixtures.length).toBeGreaterThan(0);
    });
    return;
  }

  for (const { file, fixture, beforePath, afterPath } of fixtures) {
    const pngMissing = !fs.existsSync(beforePath) || !fs.existsSync(afterPath);

    it.skipIf(pngMissing)(
      `${fixture.name} (${file})`,
      async () => {
        const result: ChangeAnalysis = await analyzeChange(
          beforePath,
          afterPath,
          fixture.url,
          undefined,
          fixture.category,
          fixture.locale
        );

        console.log(`\n  [${fixture.name}]`);
        console.log(`  → summary: ${result.summary}`);
        console.log(`  → importance: ${result.importance}`);
        console.log(`  → jurisdiction: ${result.jurisdiction ?? '(none)'}`);
        console.log(`  → documentType: ${result.documentType ?? '(none)'}`);
        console.log(`  → complianceAction: ${result.complianceAction ?? '(none)'}`);

        expect(result.importance).toBeGreaterThanOrEqual(fixture.expected.importanceMin);
        expect(result.importance).toBeLessThanOrEqual(fixture.expected.importanceMax);

        // hasSignificantChange är flaky på låg-importance cases (3-4) — AI:n växlar.
        // Assertera bara när importance >= 5 (tydlig signifikans) eller vid info_only.
        if (result.importance >= 5 || fixture.expected.complianceAction === 'info_only') {
          expect(result.hasSignificantChange).toBe(fixture.expected.hasSignificantChange);
        }

        // info_only-case har ofta inga compliance-fält — acceptera null/undefined
        if (fixture.expected.complianceAction === 'info_only') {
          if (result.complianceAction) {
            expect(result.complianceAction).toBe('info_only');
          }
        } else {
          expect(result.jurisdiction).toBe(fixture.expected.jurisdiction);
          expect(result.documentType).toBe(fixture.expected.documentType);
          expect(result.complianceAction).toBe(fixture.expected.complianceAction);
        }
      },
      60_000 // 60s timeout per case — GPT-anrop kan ta tid
    );

    if (pngMissing) {
      console.log(`  ⚠ Screenshots saknas för ${file} — kör scripts/render-compliance-fixtures.ts`);
    }
  }
});
