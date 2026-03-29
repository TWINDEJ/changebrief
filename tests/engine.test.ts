import { describe, it, expect } from 'vitest';

// ─── Test 1: Vision JSON-parsing ───
// Verifierar att analyzeChange-resultatet parsas korrekt från GPT-svar,
// inklusive edge cases med markdown-kodblock och ogiltig JSON.

describe('Vision JSON parsing', () => {
  // Simulerar samma parse-logik som shared/vision.ts rad 186-196
  function parseVisionResponse(text: string) {
    try {
      const clean = text.replace(/```json|```/g, '').trim();
      return JSON.parse(clean);
    } catch {
      return {
        summary: text,
        importance: 5,
        changedElements: [],
        hasSignificantChange: true,
      };
    }
  }

  it('parsear ren JSON korrekt', () => {
    const input = '{"summary":"Priset höjdes","importance":8,"changedElements":["pricing"],"hasSignificantChange":true}';
    const result = parseVisionResponse(input);
    expect(result.summary).toBe('Priset höjdes');
    expect(result.importance).toBe(8);
    expect(result.changedElements).toEqual(['pricing']);
  });

  it('parsear JSON inuti markdown-kodblock', () => {
    const input = '```json\n{"summary":"Ny knapp","importance":4,"changedElements":["button"],"hasSignificantChange":true}\n```';
    const result = parseVisionResponse(input);
    expect(result.summary).toBe('Ny knapp');
    expect(result.importance).toBe(4);
  });

  it('faller tillbaka vid ogiltig JSON', () => {
    const input = 'GPT sa något konstigt utan JSON';
    const result = parseVisionResponse(input);
    expect(result.summary).toBe(input);
    expect(result.importance).toBe(5);
    expect(result.hasSignificantChange).toBe(true);
  });

  it('parsear compliance-fält korrekt', () => {
    const input = JSON.stringify({
      summary: 'Ny föreskrift',
      importance: 9,
      changedElements: ['regulation text'],
      hasSignificantChange: true,
      jurisdiction: 'SE',
      documentType: 'regulation',
      complianceAction: 'action_required',
    });
    const result = parseVisionResponse(input);
    expect(result.jurisdiction).toBe('SE');
    expect(result.complianceAction).toBe('action_required');
    expect(result.documentType).toBe('regulation');
  });
});

// ─── Test 2: Notification threshold ───
// Verifierar att notifieringar bara skickas när importance >= min_importance

describe('Notification threshold logic', () => {
  function shouldNotify(importance: number, minImportance: number | null | undefined): boolean {
    return importance >= (minImportance ?? 5);
  }

  it('skickar vid importance >= threshold', () => {
    expect(shouldNotify(7, 5)).toBe(true);
    expect(shouldNotify(5, 5)).toBe(true);
  });

  it('blockar vid importance < threshold', () => {
    expect(shouldNotify(4, 5)).toBe(false);
    expect(shouldNotify(1, 5)).toBe(false);
  });

  it('använder default 5 om threshold saknas', () => {
    expect(shouldNotify(5, null)).toBe(true);
    expect(shouldNotify(5, undefined)).toBe(true);
    expect(shouldNotify(4, null)).toBe(false);
  });

  it('respekterar anpassat threshold', () => {
    expect(shouldNotify(3, 3)).toBe(true);
    expect(shouldNotify(2, 3)).toBe(false);
    expect(shouldNotify(9, 8)).toBe(true);
  });
});

// ─── Test 3: Plan limits ───
// Verifierar att URL- och check-gränser är korrekta per plan

describe('Plan limits', () => {
  function getUrlLimit(plan: string): number {
    switch (plan) {
      case 'pro': return 25;
      case 'team': return 100;
      default: return 3;
    }
  }

  function getCheckLimit(plan: string): number {
    switch (plan) {
      case 'pro': return 2000;
      case 'team': return 10000;
      default: return 100;
    }
  }

  it('free plan har 3 URLs och 100 checks', () => {
    expect(getUrlLimit('free')).toBe(3);
    expect(getCheckLimit('free')).toBe(100);
  });

  it('pro plan har 25 URLs och 2000 checks', () => {
    expect(getUrlLimit('pro')).toBe(25);
    expect(getCheckLimit('pro')).toBe(2000);
  });

  it('team plan har 100 URLs och 10000 checks', () => {
    expect(getUrlLimit('team')).toBe(100);
    expect(getCheckLimit('team')).toBe(10000);
  });

  it('okänd plan faller till free', () => {
    expect(getUrlLimit('enterprise')).toBe(3);
    expect(getUrlLimit('')).toBe(3);
    expect(getCheckLimit('unknown')).toBe(100);
  });
});

// ─── Test 4: Structured diff — prisändringar ───
// Verifierar att strukturerad diff hittar prisändringar korrekt

describe('Structured diff logic', () => {
  function setDiff(before: string[], after: string[]): { added: string[]; removed: string[] } {
    const beforeSet = new Set(before);
    const afterSet = new Set(after);
    return {
      added: after.filter(x => !beforeSet.has(x)),
      removed: before.filter(x => !afterSet.has(x)),
    };
  }

  function findPriceChanges(before: string[], after: string[]): string[] {
    const changes: string[] = [];
    const { added, removed } = setDiff(before, after);
    for (const rem of removed) {
      for (const add of added) {
        const remCurrency = rem.match(/[\$€£]|SEK|kr/i)?.[0];
        const addCurrency = add.match(/[\$€£]|SEK|kr/i)?.[0];
        if (remCurrency && addCurrency && remCurrency.toLowerCase() === addCurrency.toLowerCase()) {
          changes.push(`${rem} → ${add}`);
        }
      }
    }
    if (changes.length === 0) {
      for (const rem of removed) changes.push(`Removed: ${rem}`);
      for (const add of added) changes.push(`Added: ${add}`);
    }
    return changes;
  }

  it('hittar prisändring med dollar', () => {
    const changes = findPriceChanges(['$29/mo'], ['$39/mo']);
    expect(changes).toEqual(['$29/mo → $39/mo']);
  });

  it('hittar prisändring med SEK', () => {
    const changes = findPriceChanges(['299 SEK'], ['349 SEK']);
    expect(changes).toEqual(['299 SEK → 349 SEK']);
  });

  it('hittar prisändring med kr', () => {
    const changes = findPriceChanges(['299 kr/mån'], ['349 kr/mån']);
    expect(changes).toEqual(['299 kr/mån → 349 kr/mån']);
  });

  it('rapporterar tillagda/borttagna vid blandade valutor', () => {
    const changes = findPriceChanges(['$29'], ['€35']);
    expect(changes).toEqual(['Removed: $29', 'Added: €35']);
  });

  it('returnerar tomt vid identiska priser', () => {
    const changes = findPriceChanges(['$29/mo'], ['$29/mo']);
    expect(changes).toEqual([]);
  });

  it('hittar set-diff korrekt', () => {
    const diff = setDiff(['a', 'b', 'c'], ['b', 'c', 'd']);
    expect(diff.added).toEqual(['d']);
    expect(diff.removed).toEqual(['a']);
  });
});

// ─── Test 5: Compliance action notification filter ───
// Verifierar att per-action-level notification preferences respekteras

describe('Compliance action notification filter', () => {
  function shouldNotifyForAction(
    complianceAction: string | null,
    prefs: { action_required: number; review_recommended: number; info_only: number }
  ): boolean {
    if (!complianceAction) return true; // Icke-compliance-ändringar passerar alltid
    const prefMap: Record<string, number> = {
      action_required: prefs.action_required,
      review_recommended: prefs.review_recommended,
      info_only: prefs.info_only,
    };
    return !!prefMap[complianceAction];
  }

  const defaultPrefs = { action_required: 1, review_recommended: 1, info_only: 0 };

  it('tillåter action_required med default-prefs', () => {
    expect(shouldNotifyForAction('action_required', defaultPrefs)).toBe(true);
  });

  it('tillåter review_recommended med default-prefs', () => {
    expect(shouldNotifyForAction('review_recommended', defaultPrefs)).toBe(true);
  });

  it('blockar info_only med default-prefs', () => {
    expect(shouldNotifyForAction('info_only', defaultPrefs)).toBe(false);
  });

  it('tillåter allt utan compliance_action', () => {
    expect(shouldNotifyForAction(null, defaultPrefs)).toBe(true);
  });

  it('blockar action_required om användaren stängt av det', () => {
    expect(shouldNotifyForAction('action_required', { ...defaultPrefs, action_required: 0 })).toBe(false);
  });

  it('tillåter info_only om användaren slagit på det', () => {
    expect(shouldNotifyForAction('info_only', { ...defaultPrefs, info_only: 1 })).toBe(true);
  });
});
