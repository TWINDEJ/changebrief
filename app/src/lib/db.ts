import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'changebrief.db');

let db: Database.Database;

function getDb(): Database.Database {
  if (!db) {
    const fs = require('fs');
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initDb(db);
  }
  return db;
}

function initDb(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      image TEXT,
      plan TEXT DEFAULT 'free',
      polar_customer_id TEXT,
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
  `);
}

// ─── Users ───

export function getOrCreateUser(email: string, name?: string, image?: string): { id: string; email: string; plan: string } {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  if (existing) return existing;

  const id = crypto.randomUUID();
  db.prepare('INSERT INTO users (id, email, name, image) VALUES (?, ?, ?, ?)').run(id, email, name, image);
  return { id, email, plan: 'free' };
}

export function getUserByEmail(email: string) {
  return getDb().prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
}

export function updateUserPlan(userId: string, plan: string) {
  getDb().prepare('UPDATE users SET plan = ? WHERE id = ?').run(plan, userId);
}

// ─── Watched URLs ───

export function getWatchedUrls(userId: string) {
  return getDb().prepare('SELECT * FROM watched_urls WHERE user_id = ? ORDER BY created_at DESC').all(userId) as any[];
}

export function addWatchedUrl(userId: string, url: string, name: string, options?: { threshold?: number; selector?: string; mobile?: boolean; minImportance?: number }) {
  const db = getDb();
  db.prepare(`
    INSERT INTO watched_urls (user_id, url, name, threshold, selector, mobile, min_importance)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    userId, url, name,
    options?.threshold ?? 0.3,
    options?.selector ?? null,
    options?.mobile ? 1 : 0,
    options?.minImportance ?? 5
  );
}

export function removeWatchedUrl(userId: string, urlId: number) {
  getDb().prepare('DELETE FROM watched_urls WHERE id = ? AND user_id = ?').run(urlId, userId);
}

export function countWatchedUrls(userId: string): number {
  const row = getDb().prepare('SELECT COUNT(*) as count FROM watched_urls WHERE user_id = ?').get(userId) as any;
  return row.count;
}

// ─── Change History ───

export function addChangeRecord(userId: string, record: {
  url: string; name: string; changePercent: number;
  summary?: string; importance?: number; changedElements?: string[];
  hasSignificantChange?: boolean;
}) {
  getDb().prepare(`
    INSERT INTO change_history (user_id, url, name, change_percent, summary, importance, changed_elements, has_significant_change)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    userId, record.url, record.name, record.changePercent,
    record.summary ?? null, record.importance ?? null,
    record.changedElements ? JSON.stringify(record.changedElements) : null,
    record.hasSignificantChange ? 1 : 0
  );
}

export function getChangeHistory(userId: string, limit = 50) {
  return getDb().prepare('SELECT * FROM change_history WHERE user_id = ? ORDER BY checked_at DESC LIMIT ?').all(userId, limit) as any[];
}

export function getChangeHistoryForUrl(userId: string, url: string, limit = 20) {
  return getDb().prepare('SELECT * FROM change_history WHERE user_id = ? AND url = ? ORDER BY checked_at DESC LIMIT ?').all(userId, url, limit) as any[];
}

// ─── Plan limits ───

export function getUrlLimit(plan: string): number {
  switch (plan) {
    case 'pro': return 25;
    case 'team': return 100;
    default: return 3;
  }
}
