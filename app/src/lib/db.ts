import { createClient, type Client } from '@libsql/client';

let client: Client;

function getDb(): Client {
  if (!client) {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return client;
}

// ─── Schema initialization ───
// VIKTIGT: Migrationer definieras centralt i shared/schema.ts.
// Denna kopia måste hållas i synk — testet tests/schema-sync.test.ts verifierar detta.

export async function initDb() {
  const db = getDb();
  await db.executeMultiple(`
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
  `);

  // Magic link tokens
  await db.execute(`
    CREATE TABLE IF NOT EXISTS magic_tokens (
      token TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      expires TEXT NOT NULL,
      used INTEGER DEFAULT 0
    )
  `);

  // API keys table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      name TEXT NOT NULL,
      key_hash TEXT NOT NULL UNIQUE,
      key_prefix TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      last_used_at TEXT,
      revoked_at TEXT
    )
  `);

  // Add columns if they don't exist (migration for existing DBs)
  for (const col of [
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
    'ALTER TABLE users ADD COLUMN digest_frequency TEXT DEFAULT \'weekly\'',
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
    'ALTER TABLE users ADD COLUMN locale TEXT DEFAULT \'en\'',
    'ALTER TABLE users ADD COLUMN teams_webhook_url TEXT',
    'ALTER TABLE users ADD COLUMN discord_webhook_url TEXT',
    'ALTER TABLE users ADD COLUMN pagerduty_routing_key TEXT',
    'ALTER TABLE watched_urls ADD COLUMN ignore_selectors TEXT',
    'ALTER TABLE watched_urls ADD COLUMN check_interval_minutes INTEGER DEFAULT 360',
    "ALTER TABLE watched_urls ADD COLUMN watch_intent TEXT DEFAULT 'page'",
    'ALTER TABLE watched_urls ADD COLUMN keyword_filters TEXT',
    'ALTER TABLE watched_urls ADD COLUMN custom_prompt_hint TEXT',
    'ALTER TABLE watched_urls ADD COLUMN wait_for_selector TEXT',
    'ALTER TABLE watched_urls ADD COLUMN wait_ms INTEGER',
    'ALTER TABLE watched_urls ADD COLUMN scroll_to_bottom INTEGER DEFAULT 0',
  ]) {
    try { await db.execute(col); } catch { /* column already exists */ }
  }

  // Skapa url_config_history om den saknas (lades till av Våg 1 #2).
  try {
    await db.execute(`CREATE TABLE IF NOT EXISTS url_config_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url_id INTEGER NOT NULL REFERENCES watched_urls(id) ON DELETE CASCADE,
      changed_at TEXT DEFAULT (datetime('now')),
      changed_by TEXT,
      diff TEXT NOT NULL
    )`);
  } catch { /* redan skapad */ }

  // Brus-feedback (Spår C #10).
  try {
    await db.execute(`CREATE TABLE IF NOT EXISTS notification_feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id),
      change_history_id INTEGER NOT NULL REFERENCES change_history(id) ON DELETE CASCADE,
      verdict TEXT NOT NULL,
      reason TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`);
  } catch { /* redan skapad */ }
}

// ─── Magic Tokens ───

export async function createMagicToken(email: string): Promise<string> {
  const db = getDb();
  await initDb();
  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min
  await db.execute({
    sql: 'INSERT INTO magic_tokens (token, email, expires) VALUES (?, ?, ?)',
    args: [token, email.toLowerCase().trim(), expires],
  });
  return token;
}

export async function consumeMagicToken(token: string, email: string): Promise<boolean> {
  const db = getDb();
  await initDb();
  const result = await db.execute({
    sql: 'SELECT * FROM magic_tokens WHERE token = ? AND email = ? AND used = 0',
    args: [token, email.toLowerCase().trim()],
  });
  if (result.rows.length === 0) return false;

  const row = result.rows[0];
  if (new Date(row.expires as string) < new Date()) return false;

  await db.execute({ sql: 'UPDATE magic_tokens SET used = 1 WHERE token = ?', args: [token] });
  return true;
}

// ─── Users ───

export async function getOrCreateUser(email: string, name?: string, image?: string) {
  const db = getDb();
  await initDb();
  const existing = await db.execute({ sql: 'SELECT * FROM users WHERE email = ?', args: [email] });
  if (existing.rows.length > 0) return existing.rows[0];

  const id = crypto.randomUUID();
  await db.execute({ sql: 'INSERT INTO users (id, email, name, image) VALUES (?, ?, ?, ?)', args: [id, email, name ?? null, image ?? null] });
  return { id, email, plan: 'free' };
}

export async function getUserByEmail(email: string) {
  const db = getDb();
  await initDb();
  const result = await db.execute({ sql: 'SELECT * FROM users WHERE email = ?', args: [email] });
  return result.rows[0] ?? null;
}

export async function getUserByPolarCustomerId(polarCustomerId: string) {
  const db = getDb();
  await initDb();
  const result = await db.execute({ sql: 'SELECT * FROM users WHERE polar_customer_id = ?', args: [polarCustomerId] });
  return result.rows[0] ?? null;
}

export async function updateUserPlan(userId: string, plan: string) {
  await getDb().execute({ sql: 'UPDATE users SET plan = ? WHERE id = ?', args: [plan, userId] });
}

export async function updateUserPolarId(userId: string, polarCustomerId: string) {
  await getDb().execute({ sql: 'UPDATE users SET polar_customer_id = ? WHERE id = ?', args: [polarCustomerId, userId] });
}

export async function updateUserSettings(userId: string, settings: { notifyEmail?: boolean; slackWebhookUrl?: string | null; weeklyDigest?: boolean; digestFrequency?: string; notifyActionRequired?: boolean; notifyReviewRecommended?: boolean; notifyInfoOnly?: boolean; webhookUrl?: string | null; slaActionHours?: number; slaReviewHours?: number; locale?: string; teamsWebhookUrl?: string | null; discordWebhookUrl?: string | null; pagerdutyRoutingKey?: string | null }) {
  const updates: string[] = [];
  const args: any[] = [];

  if (settings.notifyEmail !== undefined) {
    updates.push('notify_email = ?');
    args.push(settings.notifyEmail ? 1 : 0);
  }
  if (settings.slackWebhookUrl !== undefined) {
    updates.push('slack_webhook_url = ?');
    args.push(settings.slackWebhookUrl);
  }
  if (settings.weeklyDigest !== undefined) {
    updates.push('weekly_digest = ?');
    args.push(settings.weeklyDigest ? 1 : 0);
  }
  if (settings.digestFrequency !== undefined) {
    updates.push('digest_frequency = ?');
    args.push(settings.digestFrequency);
  }
  if (settings.notifyActionRequired !== undefined) {
    updates.push('notify_action_required = ?');
    args.push(settings.notifyActionRequired ? 1 : 0);
  }
  if (settings.notifyReviewRecommended !== undefined) {
    updates.push('notify_review_recommended = ?');
    args.push(settings.notifyReviewRecommended ? 1 : 0);
  }
  if (settings.notifyInfoOnly !== undefined) {
    updates.push('notify_info_only = ?');
    args.push(settings.notifyInfoOnly ? 1 : 0);
  }
  if (settings.webhookUrl !== undefined) {
    updates.push('webhook_url = ?');
    args.push(settings.webhookUrl);
  }
  if (settings.slaActionHours !== undefined) {
    updates.push('sla_action_hours = ?');
    args.push(settings.slaActionHours);
  }
  if (settings.slaReviewHours !== undefined) {
    updates.push('sla_review_hours = ?');
    args.push(settings.slaReviewHours);
  }
  if (settings.locale !== undefined) {
    updates.push('locale = ?');
    args.push(settings.locale);
  }
  if (settings.teamsWebhookUrl !== undefined) {
    updates.push('teams_webhook_url = ?');
    args.push(settings.teamsWebhookUrl);
  }
  if (settings.discordWebhookUrl !== undefined) {
    updates.push('discord_webhook_url = ?');
    args.push(settings.discordWebhookUrl);
  }
  if (settings.pagerdutyRoutingKey !== undefined) {
    updates.push('pagerduty_routing_key = ?');
    args.push(settings.pagerdutyRoutingKey);
  }

  if (updates.length === 0) return;
  args.push(userId);
  await getDb().execute({ sql: `UPDATE users SET ${updates.join(', ')} WHERE id = ?`, args });
}

// ─── Watched URLs ───

export async function getWatchedUrls(userId: string) {
  const result = await getDb().execute({
    sql: `SELECT wu.*,
            ch.summary as last_summary,
            ch.importance as last_importance,
            ch.checked_at as last_change_at
          FROM watched_urls wu
          LEFT JOIN change_history ch ON ch.id = (
            SELECT id FROM change_history
            WHERE user_id = wu.user_id AND url = wu.url AND has_significant_change = 1
            ORDER BY checked_at DESC LIMIT 1
          )
          WHERE wu.user_id = ?
          ORDER BY wu.created_at DESC`,
    args: [userId]
  });
  return result.rows;
}

export async function addWatchedUrl(userId: string, url: string, name: string, options?: {
  threshold?: number;
  selector?: string;
  mobile?: boolean;
  minImportance?: number;
  cookies?: string;
  headers?: string;
  webhookUrl?: string;
  category?: string;
  ignoreSelectors?: string;
  checkIntervalMinutes?: number;
  watchIntent?: string;
  keywordFilters?: string;
  customPromptHint?: string;
  waitForSelector?: string;
  waitMs?: number;
  scrollToBottom?: boolean;
}) {
  await getDb().execute({
    sql: `INSERT INTO watched_urls
          (user_id, url, name, threshold, selector, mobile, min_importance, cookies, headers,
           webhook_url, category, ignore_selectors, check_interval_minutes,
           watch_intent, keyword_filters, custom_prompt_hint,
           wait_for_selector, wait_ms, scroll_to_bottom)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      userId, url, name,
      options?.threshold ?? 0.3,
      options?.selector ?? null,
      options?.mobile ? 1 : 0,
      options?.minImportance ?? 5,
      options?.cookies ?? null,
      options?.headers ?? null,
      options?.webhookUrl ?? null,
      options?.category ?? null,
      options?.ignoreSelectors ?? null,
      options?.checkIntervalMinutes ?? 360,
      options?.watchIntent ?? 'page',
      options?.keywordFilters ?? null,
      options?.customPromptHint ?? null,
      options?.waitForSelector ?? null,
      options?.waitMs ?? null,
      options?.scrollToBottom ? 1 : 0,
    ]
  });
}

export async function removeWatchedUrl(userId: string, urlId: number) {
  await getDb().execute({ sql: 'DELETE FROM watched_urls WHERE id = ? AND user_id = ?', args: [urlId, userId] });
}

export async function countWatchedUrls(userId: string): Promise<number> {
  const result = await getDb().execute({ sql: 'SELECT COUNT(*) as count FROM watched_urls WHERE user_id = ?', args: [userId] });
  return Number(result.rows[0].count);
}

export async function muteUrl(userId: string, urlId: number, muted: boolean) {
  await getDb().execute({
    sql: 'UPDATE watched_urls SET muted = ? WHERE id = ? AND user_id = ?',
    args: [muted ? 1 : 0, urlId, userId],
  });
}

// ─── Edit + audit-trail ───

export interface UrlUpdates {
  name?: string;
  threshold?: number;
  selector?: string | null;
  mobile?: boolean;
  minImportance?: number;
  cookies?: string | null;
  headers?: string | null;
  webhookUrl?: string | null;
  category?: string | null;
  ignoreSelectors?: string | null;
  checkIntervalMinutes?: number;
  watchIntent?: string;
  keywordFilters?: string | null;
  customPromptHint?: string | null;
  waitForSelector?: string | null;
  waitMs?: number | null;
  scrollToBottom?: boolean;
}

type ConfigRow = Record<string, unknown>;

function buildDiff(before: ConfigRow, after: ConfigRow): Record<string, { from: unknown; to: unknown }> {
  const diff: Record<string, { from: unknown; to: unknown }> = {};
  for (const key of Object.keys(after)) {
    if (before[key] !== after[key]) diff[key] = { from: before[key], to: after[key] };
  }
  return diff;
}

export async function updateWatchedUrl(
  userId: string,
  urlId: number,
  updates: UrlUpdates,
  changedBy?: string
): Promise<{ changed: boolean }> {
  const db = getDb();

  const current = await db.execute({
    sql: `SELECT name, threshold, selector, mobile, min_importance, cookies, headers, webhook_url,
                 category, ignore_selectors, check_interval_minutes,
                 watch_intent, keyword_filters, custom_prompt_hint,
                 wait_for_selector, wait_ms, scroll_to_bottom
          FROM watched_urls WHERE id = ? AND user_id = ?`,
    args: [urlId, userId],
  });
  if (current.rows.length === 0) throw new Error('URL not found');
  const row = current.rows[0] as ConfigRow;

  const next = {
    name: updates.name ?? row.name,
    threshold: updates.threshold ?? row.threshold,
    selector: updates.selector === undefined ? row.selector : updates.selector,
    mobile: updates.mobile === undefined ? row.mobile : (updates.mobile ? 1 : 0),
    min_importance: updates.minImportance ?? row.min_importance,
    cookies: updates.cookies === undefined ? row.cookies : updates.cookies,
    headers: updates.headers === undefined ? row.headers : updates.headers,
    webhook_url: updates.webhookUrl === undefined ? row.webhook_url : updates.webhookUrl,
    category: updates.category === undefined ? row.category : updates.category,
    ignore_selectors: updates.ignoreSelectors === undefined ? row.ignore_selectors : updates.ignoreSelectors,
    check_interval_minutes: updates.checkIntervalMinutes ?? row.check_interval_minutes,
    watch_intent: updates.watchIntent ?? row.watch_intent,
    keyword_filters: updates.keywordFilters === undefined ? row.keyword_filters : updates.keywordFilters,
    custom_prompt_hint: updates.customPromptHint === undefined ? row.custom_prompt_hint : updates.customPromptHint,
    wait_for_selector: updates.waitForSelector === undefined ? row.wait_for_selector : updates.waitForSelector,
    wait_ms: updates.waitMs === undefined ? row.wait_ms : updates.waitMs,
    scroll_to_bottom: updates.scrollToBottom === undefined ? row.scroll_to_bottom : (updates.scrollToBottom ? 1 : 0),
  };

  const diff = buildDiff(row, next);
  if (Object.keys(diff).length === 0) return { changed: false };

  await db.execute({
    sql: `UPDATE watched_urls SET name = ?, threshold = ?, selector = ?, mobile = ?,
          min_importance = ?, cookies = ?, headers = ?, webhook_url = ?, category = ?,
          ignore_selectors = ?, check_interval_minutes = ?,
          watch_intent = ?, keyword_filters = ?, custom_prompt_hint = ?,
          wait_for_selector = ?, wait_ms = ?, scroll_to_bottom = ?
          WHERE id = ? AND user_id = ?`,
    args: [
      next.name as string, next.threshold as number, next.selector as string | null,
      next.mobile as number, next.min_importance as number,
      next.cookies as string | null, next.headers as string | null,
      next.webhook_url as string | null, next.category as string | null,
      next.ignore_selectors as string | null, next.check_interval_minutes as number,
      next.watch_intent as string, next.keyword_filters as string | null,
      next.custom_prompt_hint as string | null,
      next.wait_for_selector as string | null,
      next.wait_ms as number | null,
      next.scroll_to_bottom as number,
      urlId, userId,
    ],
  });

  await db.execute({
    sql: 'INSERT INTO url_config_history (url_id, changed_by, diff) VALUES (?, ?, ?)',
    args: [urlId, changedBy ?? null, JSON.stringify(diff)],
  });

  return { changed: true };
}

// ─── Notification feedback (#10) ───

export async function recordNotificationFeedback(
  userId: string,
  changeHistoryId: number,
  verdict: 'relevant' | 'noise',
  reason?: string
): Promise<{ recorded: boolean }> {
  // Verifiera att change-raden tillhör användaren innan vi accepterar feedback.
  const owns = await getDb().execute({
    sql: 'SELECT 1 FROM change_history WHERE id = ? AND user_id = ?',
    args: [changeHistoryId, userId],
  });
  if (owns.rows.length === 0) return { recorded: false };

  await getDb().execute({
    sql: `INSERT INTO notification_feedback (user_id, change_history_id, verdict, reason)
          VALUES (?, ?, ?, ?)`,
    args: [userId, changeHistoryId, verdict, reason ?? null],
  });
  return { recorded: true };
}

export async function getNoiseSuggestion(
  userId: string,
  changeHistoryId: number
): Promise<null | {
  urlId: number;
  noiseCount: number;
  suggestedMinImportance: number;
  currentMinImportance: number;
}> {
  // Hitta vilken URL change-raden gäller.
  const change = await getDb().execute({
    sql: `SELECT ch.url, wu.id AS url_id, wu.min_importance
          FROM change_history ch
          JOIN watched_urls wu ON wu.user_id = ch.user_id AND wu.url = ch.url
          WHERE ch.id = ? AND ch.user_id = ? LIMIT 1`,
    args: [changeHistoryId, userId],
  });
  if (change.rows.length === 0) return null;
  const urlId = Number(change.rows[0].url_id);
  const currentMin = Number(change.rows[0].min_importance) || 5;

  // Räkna brus-markeringar för samma URL senaste 14 dagarna.
  const result = await getDb().execute({
    sql: `SELECT COUNT(*) AS cnt, AVG(ch.importance) AS avg_imp
          FROM notification_feedback nf
          JOIN change_history ch ON ch.id = nf.change_history_id
          JOIN watched_urls wu ON wu.user_id = ch.user_id AND wu.url = ch.url
          WHERE nf.user_id = ?
            AND wu.id = ?
            AND nf.verdict = 'noise'
            AND nf.created_at > datetime('now', '-14 days')`,
    args: [userId, urlId],
  });
  const noiseCount = Number(result.rows[0].cnt);
  const avgImp = Number(result.rows[0].avg_imp) || 0;
  if (noiseCount < 3) return null;

  // Enkel heuristik: höj min_importance till max(current+1, ceil(avg_imp)+1), cap 10.
  const suggested = Math.min(10, Math.max(currentMin + 1, Math.ceil(avgImp) + 1));
  if (suggested <= currentMin) return null; // ingen meningsfull höjning

  return {
    urlId,
    noiseCount,
    suggestedMinImportance: suggested,
    currentMinImportance: currentMin,
  };
}

export async function getUrlConfigHistory(userId: string, urlId: number) {
  // Bekräfta ägarskap innan historiken returneras.
  const owns = await getDb().execute({
    sql: 'SELECT 1 FROM watched_urls WHERE id = ? AND user_id = ?',
    args: [urlId, userId],
  });
  if (owns.rows.length === 0) return [];

  const result = await getDb().execute({
    sql: 'SELECT id, changed_at, changed_by, diff FROM url_config_history WHERE url_id = ? ORDER BY changed_at DESC LIMIT 50',
    args: [urlId],
  });
  return result.rows;
}

// ─── All URLs (for cron job) ───

export async function getAllActiveUrls() {
  const result = await getDb().execute({
    sql: 'SELECT wu.*, u.email, u.plan, u.notify_email, u.slack_webhook_url FROM watched_urls wu JOIN users u ON wu.user_id = u.id WHERE wu.active = 1 AND (wu.muted IS NULL OR wu.muted = 0)',
    args: []
  });
  return result.rows;
}

// ─── Change History ───

export async function addChangeRecord(userId: string, record: {
  url: string; name: string; changePercent: number;
  summary?: string; importance?: number; changedElements?: string[];
  hasSignificantChange?: boolean;
  jurisdiction?: string; documentType?: string; complianceAction?: string;
}) {
  await getDb().execute({
    sql: 'INSERT INTO change_history (user_id, url, name, change_percent, summary, importance, changed_elements, has_significant_change, jurisdiction, document_type, compliance_action) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    args: [
      userId, record.url, record.name, record.changePercent,
      record.summary ?? null, record.importance ?? null,
      record.changedElements ? JSON.stringify(record.changedElements) : null,
      record.hasSignificantChange ? 1 : 0,
      record.jurisdiction ?? null, record.documentType ?? null, record.complianceAction ?? null,
    ]
  });
}

export async function getChangeHistory(userId: string, limit = 50) {
  const result = await getDb().execute({ sql: 'SELECT * FROM change_history WHERE user_id = ? ORDER BY checked_at DESC LIMIT ?', args: [userId, limit] });
  return result.rows;
}

export async function getComplianceHistory(userId: string, filters?: {
  jurisdiction?: string;
  documentType?: string;
  complianceAction?: string;
  limit?: number;
}) {
  const conditions = ['user_id = ?', 'compliance_action IS NOT NULL'];
  const args: any[] = [userId];

  if (filters?.jurisdiction) {
    conditions.push('jurisdiction = ?');
    args.push(filters.jurisdiction);
  }
  if (filters?.documentType) {
    conditions.push('document_type = ?');
    args.push(filters.documentType);
  }
  if (filters?.complianceAction) {
    conditions.push('compliance_action = ?');
    args.push(filters.complianceAction);
  }

  args.push(filters?.limit ?? 100);
  const result = await getDb().execute({
    sql: `SELECT * FROM change_history WHERE ${conditions.join(' AND ')} ORDER BY checked_at DESC LIMIT ?`,
    args,
  });
  return result.rows;
}

export async function getComplianceTrend(userId: string) {
  const result = await getDb().execute({
    sql: `SELECT
            name,
            compliance_action,
            COUNT(*) as count,
            strftime('%Y-%m', checked_at) as month
          FROM change_history
          WHERE user_id = ? AND compliance_action IS NOT NULL
          GROUP BY name, compliance_action, month
          ORDER BY month DESC, count DESC
          LIMIT 200`,
    args: [userId],
  });
  return result.rows;
}

export async function markChangeReviewed(userId: string, changeId: number, reviewedBy?: string, reviewNote?: string) {
  await getDb().execute({
    sql: 'UPDATE change_history SET reviewed_at = datetime(\'now\'), reviewed_by = ?, review_note = ? WHERE id = ? AND user_id = ?',
    args: [reviewedBy ?? null, reviewNote ?? null, changeId, userId],
  });
}

export async function markAllChangesReviewed(userId: string, reviewedBy?: string) {
  await getDb().execute({
    sql: 'UPDATE change_history SET reviewed_at = datetime(\'now\'), reviewed_by = ? WHERE user_id = ? AND has_significant_change = 1 AND reviewed_at IS NULL',
    args: [reviewedBy ?? null, userId],
  });
}

export async function updateReviewNote(userId: string, changeId: number, reviewNote: string) {
  await getDb().execute({
    sql: 'UPDATE change_history SET review_note = ? WHERE id = ? AND user_id = ?',
    args: [reviewNote, changeId, userId],
  });
}

export async function deleteChangeHistoryByUrl(userId: string, url: string) {
  await getDb().execute({ sql: 'DELETE FROM change_history WHERE user_id = ? AND url = ?', args: [userId, url] });
}

// ─── Assignment ───

export async function assignChange(userId: string, changeId: number, assignedTo: string) {
  await getDb().execute({
    sql: 'UPDATE change_history SET assigned_to = ?, assigned_at = datetime(\'now\') WHERE id = ? AND user_id = ?',
    args: [assignedTo, changeId, userId],
  });
}

export async function unassignChange(userId: string, changeId: number) {
  await getDb().execute({
    sql: 'UPDATE change_history SET assigned_to = NULL, assigned_at = NULL WHERE id = ? AND user_id = ?',
    args: [changeId, userId],
  });
}

// ─── URL status updates (for engine) ───

export async function updateUrlStatus(urlId: number, status: { lastCheckedAt: string; lastError?: string | null; consecutiveErrors?: number }) {
  await getDb().execute({
    sql: 'UPDATE watched_urls SET last_checked_at = ?, last_error = ?, consecutive_errors = ? WHERE id = ?',
    args: [status.lastCheckedAt, status.lastError ?? null, status.consecutiveErrors ?? 0, urlId]
  });
}

// ─── Dashboard stats ───

export async function getDashboardStats(userId: string) {
  const db = getDb();
  const [significantResult, totalResult, lastCheckResult] = await Promise.all([
    db.execute({
      sql: `SELECT COUNT(*) as count FROM change_history
            WHERE user_id = ? AND has_significant_change = 1
            AND checked_at >= datetime('now', '-7 days')`,
      args: [userId]
    }),
    db.execute({
      sql: `SELECT COUNT(*) as count FROM change_history
            WHERE user_id = ? AND checked_at >= datetime('now', '-7 days')`,
      args: [userId]
    }),
    db.execute({
      sql: `SELECT COALESCE(
              (SELECT MAX(last_checked_at) FROM watched_urls WHERE user_id = ?),
              (SELECT MAX(checked_at) FROM change_history WHERE user_id = ?)
            ) as last_check`,
      args: [userId, userId]
    }),
  ]);
  return {
    significantChanges7d: Number(significantResult.rows[0].count),
    totalChecks7d: Number(totalResult.rows[0].count),
    lastCheck: (lastCheckResult.rows[0] as any)?.last_check as string | null,
  };
}

// ─── Compliance summary ───

export async function getComplianceActionSummary(userId: string) {
  const db = getDb();
  const [pendingResult, reviewedResult] = await Promise.all([
    db.execute({
      sql: `SELECT compliance_action, COUNT(*) as count
            FROM change_history
            WHERE user_id = ? AND compliance_action IS NOT NULL AND reviewed_at IS NULL
            GROUP BY compliance_action`,
      args: [userId],
    }),
    db.execute({
      sql: `SELECT COUNT(*) as count FROM change_history
            WHERE user_id = ? AND compliance_action IS NOT NULL
            AND reviewed_at IS NOT NULL AND reviewed_at >= datetime('now', '-7 days')`,
      args: [userId],
    }),
  ]);
  const pending: Record<string, number> = {};
  for (const row of pendingResult.rows as any[]) {
    pending[row.compliance_action] = Number(row.count);
  }
  return {
    actionRequired: pending['action_required'] ?? 0,
    reviewRecommended: pending['review_recommended'] ?? 0,
    infoOnly: pending['info_only'] ?? 0,
    reviewedThisWeek: Number((reviewedResult.rows[0] as any).count),
  };
}

export async function getComplianceOverview(userId: string) {
  const result = await getDb().execute({
    sql: `SELECT
            wu.id, wu.url, wu.name, wu.category,
            ch.jurisdiction,
            ch.checked_at as last_change_at,
            ch.compliance_action,
            ch.document_type,
            ch.reviewed_at,
            ch.reviewed_by,
            ch.summary as last_summary,
            ch.importance
          FROM watched_urls wu
          LEFT JOIN change_history ch ON ch.id = (
            SELECT id FROM change_history
            WHERE user_id = wu.user_id AND url = wu.url AND compliance_action IS NOT NULL
            ORDER BY checked_at DESC LIMIT 1
          )
          WHERE wu.user_id = ? AND wu.category IS NOT NULL
          ORDER BY
            CASE WHEN ch.compliance_action = 'action_required' THEN 0
                 WHEN ch.compliance_action = 'review_recommended' THEN 1
                 ELSE 2 END,
            ch.checked_at DESC`,
    args: [userId],
  });
  return result.rows;
}

// ─── API Keys ───

export async function createApiKey(userId: string, name: string): Promise<{ id: string; key: string }> {
  const db = getDb();
  const id = crypto.randomUUID();
  // Prefix with "cb_" for easy identification, then 32 random hex chars
  const keyBytes = new Uint8Array(32);
  crypto.getRandomValues(keyBytes);
  const key = 'cb_' + Array.from(keyBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  const keyHash = await hashApiKey(key);

  await db.execute({
    sql: 'INSERT INTO api_keys (id, user_id, name, key_hash, key_prefix, created_at) VALUES (?, ?, ?, ?, ?, datetime(\'now\'))',
    args: [id, userId, name, keyHash, key.slice(0, 10)],
  });
  return { id, key }; // key only returned on creation
}

export async function listApiKeys(userId: string) {
  const result = await getDb().execute({
    sql: 'SELECT id, name, key_prefix, created_at, last_used_at FROM api_keys WHERE user_id = ? AND revoked_at IS NULL ORDER BY created_at DESC',
    args: [userId],
  });
  return result.rows;
}

export async function revokeApiKey(userId: string, keyId: string) {
  await getDb().execute({
    sql: 'UPDATE api_keys SET revoked_at = datetime(\'now\') WHERE id = ? AND user_id = ?',
    args: [keyId, userId],
  });
}

export async function getUserByApiKey(key: string) {
  const db = getDb();
  const keyHash = await hashApiKey(key);
  const result = await db.execute({
    sql: `SELECT u.* FROM api_keys ak JOIN users u ON ak.user_id = u.id
          WHERE ak.key_hash = ? AND ak.revoked_at IS NULL`,
    args: [keyHash],
  });
  if (result.rows.length === 0) return null;

  // Update last_used_at
  await db.execute({
    sql: 'UPDATE api_keys SET last_used_at = datetime(\'now\') WHERE key_hash = ?',
    args: [keyHash],
  });

  return result.rows[0];
}

async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ─── Plan limits ───

export function getUrlLimit(plan: string): number {
  switch (plan) {
    case 'pro': return 25;
    case 'team': return 100;
    default: return 3;
  }
}

export function getCheckLimit(plan: string): number {
  switch (plan) {
    case 'pro': return 2000;
    case 'team': return 10000;
    default: return 100;
  }
}

// ─── Monthly check counter ───

export async function getMonthlyCheckCount(userId: string): Promise<number> {
  const db = getDb();
  const currentMonth = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
  const result = await db.execute({
    sql: 'SELECT checks_this_month, checks_month FROM users WHERE id = ?',
    args: [userId],
  });
  const row = result.rows[0];
  if (!row) return 0;

  // Reset if month changed
  if (row.checks_month !== currentMonth) {
    await db.execute({
      sql: 'UPDATE users SET checks_this_month = 0, checks_month = ? WHERE id = ?',
      args: [currentMonth, userId],
    });
    return 0;
  }
  return Number(row.checks_this_month) || 0;
}

export async function incrementCheckCount(userId: string): Promise<void> {
  const db = getDb();
  const currentMonth = new Date().toISOString().slice(0, 7);
  await db.execute({
    sql: `UPDATE users SET checks_this_month = CASE WHEN checks_month = ? THEN checks_this_month + 1 ELSE 1 END, checks_month = ? WHERE id = ?`,
    args: [currentMonth, currentMonth, userId],
  });
}
