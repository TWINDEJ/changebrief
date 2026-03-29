/**
 * Centralt DB-schema för changebrief.
 * Används av både engine (check-all.ts) och app (db.ts).
 * All schema-logik ska ligga HÄR — inte dupliceras.
 */

import type { Client } from '@libsql/client';

const BASE_TABLES = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    image TEXT,
    plan TEXT DEFAULT 'free',
    polar_customer_id TEXT,
    notify_email INTEGER DEFAULT 1,
    slack_webhook_url TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS watched_urls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id),
    url TEXT NOT NULL,
    name TEXT NOT NULL,
    active INTEGER DEFAULT 1,
    threshold REAL DEFAULT 0.3,
    selector TEXT,
    mobile INTEGER DEFAULT 0,
    min_importance INTEGER DEFAULT 5,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, url)
  );

  CREATE TABLE IF NOT EXISTS change_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id),
    url TEXT NOT NULL,
    name TEXT NOT NULL,
    change_percent REAL NOT NULL,
    summary TEXT,
    importance INTEGER,
    changed_elements TEXT,
    has_significant_change INTEGER DEFAULT 0,
    before_screenshot TEXT,
    after_screenshot TEXT,
    checked_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS api_keys (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL UNIQUE,
    key_prefix TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    last_used_at TEXT,
    revoked_at TEXT
  );
`;

// Varje migration läggs till HÄR. Ordningen spelar roll.
// ALTER TABLE ... ADD COLUMN misslyckas tyst om kolumnen redan finns.
const MIGRATIONS = [
  'ALTER TABLE users ADD COLUMN notify_email INTEGER DEFAULT 1',
  'ALTER TABLE users ADD COLUMN slack_webhook_url TEXT',
  'ALTER TABLE watched_urls ADD COLUMN last_checked_at TEXT',
  'ALTER TABLE watched_urls ADD COLUMN last_error TEXT',
  'ALTER TABLE watched_urls ADD COLUMN consecutive_errors INTEGER DEFAULT 0',
  'ALTER TABLE watched_urls ADD COLUMN cookies TEXT',
  'ALTER TABLE watched_urls ADD COLUMN headers TEXT',
  'ALTER TABLE users ADD COLUMN weekly_digest INTEGER DEFAULT 1',
  'ALTER TABLE watched_urls ADD COLUMN muted INTEGER DEFAULT 0',
  'ALTER TABLE users ADD COLUMN checks_this_month INTEGER DEFAULT 0',
  'ALTER TABLE users ADD COLUMN checks_month TEXT',
  "ALTER TABLE users ADD COLUMN digest_frequency TEXT DEFAULT 'weekly'",
  'ALTER TABLE watched_urls ADD COLUMN webhook_url TEXT',
  'ALTER TABLE watched_urls ADD COLUMN category TEXT',
  'ALTER TABLE change_history ADD COLUMN jurisdiction TEXT',
  'ALTER TABLE change_history ADD COLUMN document_type TEXT',
  'ALTER TABLE change_history ADD COLUMN compliance_action TEXT',
  'ALTER TABLE change_history ADD COLUMN reviewed_at TEXT',
  'ALTER TABLE change_history ADD COLUMN reviewed_by TEXT',
  'ALTER TABLE change_history ADD COLUMN review_note TEXT',
  'ALTER TABLE users ADD COLUMN notify_action_required INTEGER DEFAULT 1',
  'ALTER TABLE users ADD COLUMN notify_review_recommended INTEGER DEFAULT 1',
  'ALTER TABLE users ADD COLUMN notify_info_only INTEGER DEFAULT 0',
  'ALTER TABLE users ADD COLUMN webhook_url TEXT',
  'ALTER TABLE users ADD COLUMN sla_action_hours INTEGER DEFAULT 48',
  'ALTER TABLE users ADD COLUMN sla_review_hours INTEGER DEFAULT 168',
  'ALTER TABLE change_history ADD COLUMN assigned_to TEXT',
  'ALTER TABLE change_history ADD COLUMN assigned_at TEXT',
  "ALTER TABLE users ADD COLUMN locale TEXT DEFAULT 'en'",
  'ALTER TABLE users ADD COLUMN teams_webhook_url TEXT',
  'ALTER TABLE users ADD COLUMN discord_webhook_url TEXT',
  'ALTER TABLE users ADD COLUMN pagerduty_routing_key TEXT',
];

export async function initSchema(db: Client) {
  await db.executeMultiple(BASE_TABLES);

  for (const migration of MIGRATIONS) {
    try {
      await db.execute(migration);
    } catch {
      // Kolumn finns redan — ignorera
    }
  }
}
