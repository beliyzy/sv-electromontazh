import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS leads (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    type        TEXT    NOT NULL,
    name        TEXT,
    phone       TEXT,
    email       TEXT,
    message     TEXT,
    details     TEXT    NOT NULL DEFAULT '{}',
    page        TEXT,
    ip          TEXT,
    status      TEXT    NOT NULL DEFAULT 'new',
    comment     TEXT    NOT NULL DEFAULT '',
    created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  );
  CREATE INDEX IF NOT EXISTS leads_created_idx ON leads (created_at);
  CREATE INDEX IF NOT EXISTS leads_type_status_idx ON leads (type, status);

  CREATE TABLE IF NOT EXISTS sessions (
    id          TEXT PRIMARY KEY,
    login       TEXT NOT NULL,
    expires_at  INTEGER NOT NULL
  );
`;

export function openDb(file) {
  if (file !== ':memory:') {
    mkdirSync(dirname(file), { recursive: true });
  }

  const db = new Database(file);
  db.pragma('journal_mode = WAL');
  db.exec(SCHEMA);

  return db;
}

function toLead(row) {
  return row && { ...row, details: JSON.parse(row.details) };
}

function where({ type, status, q }) {
  const clauses = [];
  const params = {};

  if (type) {
    clauses.push('type = @type');
    params.type = type;
  }

  if (status) {
    clauses.push('status = @status');
    params.status = status;
  }

  if (q) {
    clauses.push(`(name LIKE @q OR phone LIKE @q OR email LIKE @q OR message LIKE @q OR details LIKE @q
                   OR comment LIKE @q)`);
    params.q = `%${q}%`;
  }

  return { sql: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', params };
}

export function leadRepository(db) {
  return {
    insert(lead) {
      const info = db.prepare(`
        INSERT INTO leads (type, name, phone, email, message, details, page, ip)
        VALUES (@type, @name, @phone, @email, @message, @details, @page, @ip)
      `).run({
        name: null,
        phone: null,
        email: null,
        message: null,
        page: null,
        ip: null,
        ...lead,
        details: JSON.stringify(lead.details ?? {}),
      });

      return this.get(info.lastInsertRowid);
    },

    get(id) {
      return toLead(db.prepare('SELECT * FROM leads WHERE id = ?').get(id));
    },

    list(filter, { limit, offset }) {
      const { sql, params } = where(filter);
      const items = db.prepare(`SELECT * FROM leads ${sql} ORDER BY created_at DESC, id DESC LIMIT @limit OFFSET @offset`)
        .all({ ...params, limit, offset })
        .map(toLead);
      const { total } = db.prepare(`SELECT count(*) AS total FROM leads ${sql}`).get(params);

      return { items, total };
    },

    update(id, { status, comment }) {
      const info = db.prepare(`
        UPDATE leads
        SET status = coalesce(@status, status),
            comment = coalesce(@comment, comment),
            updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
        WHERE id = @id
      `).run({ id, status: status ?? null, comment: comment ?? null });

      return info.changes ? this.get(id) : null;
    },

    countNewByType() {
      return Object.fromEntries(
        db.prepare("SELECT type, count(*) AS n FROM leads WHERE status = 'new' GROUP BY type").all()
          .map(({ type, n }) => [type, n]));
    },
  };
}

export function sessionRepository(db) {
  return {
    create(id, login, ttlMs) {
      db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(Date.now());
      db.prepare('INSERT INTO sessions (id, login, expires_at) VALUES (?, ?, ?)').run(id, login, Date.now() + ttlMs);
    },

    find(id) {
      const row = db.prepare('SELECT * FROM sessions WHERE id = ? AND expires_at > ?').get(id, Date.now());
      return row ?? null;
    },

    delete(id) {
      db.prepare('DELETE FROM sessions WHERE id = ?').run(id);
    },
  };
}
