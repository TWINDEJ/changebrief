import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Verifierar att migrationer i shared/schema.ts och app/src/lib/db.ts
 * inte har glidit isär. Extraherar ALTER TABLE-satser från båda filerna
 * och jämför dem.
 */
describe('Schema sync between engine and app', () => {
  function extractMigrations(filePath: string): string[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    const migrations: string[] = [];
    // Matcha alla ALTER TABLE ... ADD COLUMN-satser
    const regex = /ALTER TABLE \w+ ADD COLUMN \w+[^'"]*/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      // Normalisera: ta bort trailing whitespace och quotes
      migrations.push(match[0].trim().replace(/['"]/g, ''));
    }
    return migrations;
  }

  it('shared/schema.ts och app/src/lib/db.ts har samma migrationer', () => {
    const sharedPath = path.resolve(__dirname, '../shared/schema.ts');
    const appPath = path.resolve(__dirname, '../app/src/lib/db.ts');

    const sharedMigrations = extractMigrations(sharedPath);
    const appMigrations = extractMigrations(appPath);

    // Båda ska ha migrationer
    expect(sharedMigrations.length).toBeGreaterThan(10);
    expect(appMigrations.length).toBeGreaterThan(10);

    // Alla shared-migrationer ska finnas i app
    for (const migration of sharedMigrations) {
      const found = appMigrations.some(m => m.includes(migration.split(' ').slice(0, 6).join(' ')));
      expect(found, `Missing in app/db.ts: ${migration}`).toBe(true);
    }

    // Alla app-migrationer ska finnas i shared
    for (const migration of appMigrations) {
      const found = sharedMigrations.some(m => m.includes(migration.split(' ').slice(0, 6).join(' ')));
      expect(found, `Missing in shared/schema.ts: ${migration}`).toBe(true);
    }
  });
});
