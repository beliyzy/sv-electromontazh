import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';
import fastifyStatic from '@fastify/static';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';
import { join, normalize, sep } from 'node:path';

import { leadRepository, sessionRepository } from './db.js';
import { LEAD_TYPES, STATUSES, validateLead } from './leadTypes.js';

const SESSION_COOKIE = 'admin_session';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_PAGE_SIZE = 100;

/**
 * @param {object} options
 * @param {import('better-sqlite3').Database} options.db
 * @param {{ login: string, passwordHash: string, sessionSecret: string }} options.admin
 * @param {boolean} [options.secureCookies] cookies only over HTTPS (production)
 * @param {{ max: number, timeWindow: string }} [options.leadRateLimit]
 * @param {{ web?: string, admin?: string }} [options.staticDirs] built frontends to serve
 */
export async function buildApp({ db, admin, secureCookies = false, leadRateLimit, staticDirs = {}, logger = false }) {
  const app = Fastify({ logger, trustProxy: true, bodyLimit: 64 * 1024 });

  const leads = leadRepository(db);
  const sessions = sessionRepository(db);

  await app.register(cookie, { secret: admin.sessionSecret });
  await app.register(rateLimit, { global: false });

  // ---------- Public API ----------

  app.get('/api/health', async () => ({ ok: true }));

  app.post('/api/leads', {
    config: { rateLimit: leadRateLimit ?? { max: 5, timeWindow: '1 minute' } },
  }, async (request, reply) => {
    const body = request.body ?? {};

    // Honeypot: the field is hidden from people, bots fill it in. Pretend success so they don't retry.
    if (body.website) {
      return reply.code(201).send({ ok: true });
    }

    if (body.consent !== true) {
      return reply.code(400).send({ errors: { consent: 'Нужно согласие на обработку данных' } });
    }

    const { lead, errors } = validateLead(body.type, body);

    if (errors) {
      return reply.code(400).send({ errors });
    }

    leads.insert({
      ...lead,
      page: typeof body.page === 'string' ? body.page.slice(0, 300) : null,
      ip: request.ip,
    });

    return reply.code(201).send({ ok: true });
  });

  // ---------- Admin API ----------

  const requireAdmin = async (request, reply) => {
    const raw = request.cookies[SESSION_COOKIE];
    const unsigned = raw ? request.unsignCookie(raw) : null;
    const session = unsigned?.valid ? sessions.find(unsigned.value) : null;

    if (!session) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    request.admin = session.login;
  };

  app.post('/api/admin/login', {
    config: { rateLimit: { max: 10, timeWindow: '15 minutes' } },
  }, async (request, reply) => {
    const { login, password } = request.body ?? {};

    const ok = typeof login === 'string'
      && typeof password === 'string'
      && login === admin.login
      && await bcrypt.compare(password, admin.passwordHash);

    if (!ok) {
      return reply.code(401).send({ error: 'Неверный логин или пароль' });
    }

    const id = randomBytes(32).toString('hex');
    sessions.create(id, login, SESSION_TTL_MS);

    return reply
      .setCookie(SESSION_COOKIE, id, {
        path: '/api/admin',
        httpOnly: true,
        sameSite: 'strict',
        secure: secureCookies,
        signed: true,
        maxAge: SESSION_TTL_MS / 1000,
      })
      .send({ login });
  });

  app.register(async (adminApi) => {
    adminApi.addHook('preHandler', requireAdmin);

    adminApi.post('/api/admin/logout', async (request, reply) => {
      const unsigned = request.unsignCookie(request.cookies[SESSION_COOKIE]);
      sessions.delete(unsigned.value);

      return reply.clearCookie(SESSION_COOKIE, { path: '/api/admin' }).send({ ok: true });
    });

    adminApi.get('/api/admin/me', async (request) => ({ login: request.admin }));

    adminApi.get('/api/admin/meta', async () => ({
      types: Object.fromEntries(Object.entries(LEAD_TYPES).map(([type, spec]) => [type, {
        title: spec.title,
        fields: Object.fromEntries(Object.entries(spec.fields).map(([field, rule]) => [field, rule.label])),
      }])),
      statuses: STATUSES,
      newByType: leads.countNewByType(),
    }));

    adminApi.get('/api/admin/leads', async (request) => {
      const filter = parseFilter(request.query);
      const page = Math.max(1, Number.parseInt(request.query.page, 10) || 1);
      const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number.parseInt(request.query.pageSize, 10) || 20));

      const { items, total } = leads.list(filter, { limit: pageSize, offset: (page - 1) * pageSize });

      return { items, total, page, pageSize };
    });

    adminApi.get('/api/admin/leads.csv', async (request, reply) => {
      const { items } = leads.list(parseFilter(request.query), { limit: 100_000, offset: 0 });

      return reply
        .header('Content-Type', 'text/csv; charset=utf-8')
        .header('Content-Disposition', 'attachment; filename="leads.csv"')
        // BOM: Excel opens UTF-8 CSV correctly only with it.
        .send('﻿' + toCsv(items));
    });

    adminApi.get('/api/admin/leads/:id', async (request, reply) => {
      const lead = leads.get(Number(request.params.id));
      return lead ?? reply.code(404).send({ error: 'Not found' });
    });

    adminApi.patch('/api/admin/leads/:id', async (request, reply) => {
      const { status, comment } = request.body ?? {};

      if (status !== undefined && !STATUSES.includes(status)) {
        return reply.code(400).send({ errors: { status: 'Неизвестный статус' } });
      }

      if (comment !== undefined && (typeof comment !== 'string' || comment.length > 3000)) {
        return reply.code(400).send({ errors: { comment: 'Не больше 3000 символов' } });
      }

      const lead = leads.update(Number(request.params.id), { status, comment });
      return lead ?? reply.code(404).send({ error: 'Not found' });
    });
  });

  // ---------- Built frontends (production) ----------

  if (staticDirs.admin && existsSync(staticDirs.admin)) {
    await app.register(fastifyStatic, { root: staticDirs.admin, prefix: '/admin/', decorateReply: false });
  }

  if (staticDirs.web && existsSync(staticDirs.web)) {
    await app.register(fastifyStatic, {
      root: staticDirs.web,
      prefix: '/',
      // Hashed build assets never change: let browsers cache them for a year.
      setHeaders: (res, path) => {
        if (path.includes(`${sep}assets${sep}`)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      },
    });
  }

  app.setNotFoundHandler((request, reply) => {
    if (request.method !== 'GET' || request.url.startsWith('/api/')) {
      return reply.code(404).send({ error: 'Not found' });
    }

    const pathname = decodeURIComponent(request.url.split('?')[0]);

    // The admin is a single page: every path under /admin/ loads it.
    if (pathname === '/admin' || pathname.startsWith('/admin/')) {
      return staticDirs.admin && existsSync(staticDirs.admin)
        ? reply.sendFile('index.html', staticDirs.admin)
        : reply.code(404).send({ error: 'Not found' });
    }

    const dir = staticDirs.web;

    if (!dir || !existsSync(dir)) {
      return reply.code(404).send({ error: 'Not found' });
    }

    // Pages of the site are prerendered to <page>/index.html; "/prices" and "/prices/" are the same page.
    const page = normalize(join(pathname, 'index.html')).replace(/^[/\\]+/, '');

    if (!page.startsWith('..') && existsSync(join(dir, page))) {
      return reply.sendFile(page, dir);
    }

    // A real 404 status, not a page with 200: search engines must not index missing pages.
    return existsSync(join(dir, '404.html'))
      ? reply.code(404).sendFile('404.html', dir)
      : reply.sendFile('index.html', dir);
  });

  return app;
}

function parseFilter(query) {
  return {
    type: LEAD_TYPES[query.type] ? query.type : undefined,
    status: STATUSES.includes(query.status) ? query.status : undefined,
    q: typeof query.q === 'string' && query.q.trim() ? query.q.trim().slice(0, 100) : undefined,
  };
}

const CSV_COLUMNS = ['id', 'created_at', 'type', 'status', 'name', 'phone', 'email', 'message', 'details', 'page',
  'comment'];

function toCsv(items) {
  const cell = (value) => {
    let text = value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value);

    // Formula injection: a cell starting with these is run as a formula by Excel. Phones and numbers ("+7 900 …",
    // "-5") are safe and stay as they are.
    if (/^[=+\-@\t\r]/.test(text) && !/^[+-]?[\d\s().-]+$/.test(text)) {
      text = `'${text}`;
    }

    return `"${text.replaceAll('"', '""')}"`;
  };

  return [CSV_COLUMNS.join(';'), ...items.map((lead) => CSV_COLUMNS.map((c) => cell(lead[c])).join(';'))]
    .join('\r\n');
}
