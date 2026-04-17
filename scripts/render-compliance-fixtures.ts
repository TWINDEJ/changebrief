// Renderar HTML i tests/fixtures/compliance-cases/*.json till before/after PNG.
// Körs en gång (eller när HTML ändrats) innan `npm run test:compliance`.
//
// Varför HTML → PNG istället för Wayback-screenshots:
// - Reproducerbart: fixtures checkas in i git, ingen nätverksberoende i CI.
// - Snabbt: renderar lokalt, inte beroende av att externa sidor finns kvar.
// - Testar samma sak: vision.ts får PNG:er med realistiska regulatoriska ändringar.

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

interface Fixture {
  name: string;
  url: string;
  beforeHtml: string;
  afterHtml: string;
}

const FIXTURES_DIR = path.join(__dirname, '..', 'tests', 'fixtures', 'compliance-cases');
const VIEWPORT = { width: 1280, height: 900 };

async function renderHtmlToPng(html: string, outputPath: string, page: any): Promise<void> {
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.screenshot({ path: outputPath, fullPage: false });
}

async function main() {
  const entries = fs.readdirSync(FIXTURES_DIR)
    .filter(f => f.endsWith('.json') && !f.startsWith('_'));

  if (entries.length === 0) {
    console.error('Inga fixture-JSON-filer hittades i', FIXTURES_DIR);
    process.exit(1);
  }

  console.log(`Renderar ${entries.length} fixtures...`);

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize(VIEWPORT);

  for (const file of entries) {
    const fullPath = path.join(FIXTURES_DIR, file);
    const fixture = JSON.parse(fs.readFileSync(fullPath, 'utf8')) as Fixture;
    const stem = file.replace(/\.json$/, '');
    const beforePath = path.join(FIXTURES_DIR, `${stem}-before.png`);
    const afterPath = path.join(FIXTURES_DIR, `${stem}-after.png`);

    await renderHtmlToPng(fixture.beforeHtml, beforePath, page);
    await renderHtmlToPng(fixture.afterHtml, afterPath, page);

    console.log(`  ✓ ${fixture.name}`);
  }

  await browser.close();
  console.log('Klar.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
