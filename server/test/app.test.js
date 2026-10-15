import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';

import { buildApp } from '../src/app.js';
import { openDb } from '../src/db.js';

const ADMIN = { login: 'admin', passwordHash: bcrypt.hashSync('secret', 4), sessionSecret: 'x'.repeat(32) };

let app;

beforeEach(async () => {
  app = await buildApp({ db: openDb(':memory:'), admin: ADMIN, leadRateLimit: { max: 1000, timeWindow: '1 minute' } });
});

afterEach(() => app.close());

const submit = (payload) => app.inject({ method: 'POST', url: '/api/leads', payload: { consent: true, ...payload } });

async function login() {
  const res = await app.inject({ method: 'POST', url: '/api/admin/login', payload: { login: 'admin', password: 'secret' } });
  assert.equal(res.statusCode, 200);
  return { cookie: res.headers['set-cookie'] };
}

async function adminGet(url, headers) {
  const res = await app.inject({ method: 'GET', url, headers });
  return { status: res.statusCode, body: res.headers['content-type']?.includes('json') ? res.json() : res.body };
}

test('accepts an estimate request and shows it to the admin', async () => {
  const res = await submit({ type: 'estimate', name: ' Иван ', phone: '+7 900 000-00-00', page: '/prices' });
  assert.equal(res.statusCode, 201);

  const headers = await login();
  const { body } = await adminGet('/api/admin/leads', headers);

  assert.equal(body.total, 1);
  assert.equal(body.items[0].type, 'estimate');
  assert.equal(body.items[0].name, 'Иван');
  assert.equal(body.items[0].status, 'new');
  assert.equal(body.items[0].page, '/prices');
});

test('keeps type-specific fields of a vacancy in details', async () => {
  await submit({
    type: 'vacancy', name: 'Пётр', lastName: 'Петров', phone: '89000000000', education: 'Колледж',
  });

  const headers = await login();
  const { body } = await adminGet('/api/admin/leads', headers);

  assert.deepEqual(body.items[0].details, { lastName: 'Петров', education: 'Колледж' });
});

test('rejects invalid and incomplete requests', async () => {
  const missing = await submit({ type: 'estimate', name: 'Иван' });
  assert.equal(missing.statusCode, 400);
  assert.ok(missing.json().errors.phone);

  const badEmail = await submit({ type: 'review', name: 'Иван', email: 'nope', message: 'ok' });
  assert.equal(badEmail.statusCode, 400);
  assert.ok(badEmail.json().errors.email);

  const unknownType = await submit({ type: 'hack', name: 'Иван' });
  assert.equal(unknownType.statusCode, 400);

  const noConsent = await app.inject({
    method: 'POST', url: '/api/leads', payload: { type: 'estimate', name: 'Иван', phone: '89000000000' },
  });
  assert.equal(noConsent.statusCode, 400);
  assert.ok(noConsent.json().errors.consent);
});

test('silently drops requests with the honeypot filled in', async () => {
  const res = await submit({ type: 'estimate', name: 'Bot', phone: '89000000000', website: 'http://spam' });
  assert.equal(res.statusCode, 201);

  const headers = await login();
  const { body } = await adminGet('/api/admin/leads', headers);
  assert.equal(body.total, 0);
});

test('rate-limits lead submissions', async () => {
  await app.close();
  app = await buildApp({ db: openDb(':memory:'), admin: ADMIN, leadRateLimit: { max: 2, timeWindow: '1 minute' } });

  const lead = { type: 'estimate', name: 'Иван', phone: '89000000000' };
  assert.equal((await submit(lead)).statusCode, 201);
  assert.equal((await submit(lead)).statusCode, 201);
  assert.equal((await submit(lead)).statusCode, 429);
});

test('admin API requires a session', async () => {
  assert.equal((await adminGet('/api/admin/leads')).status, 401);
  assert.equal((await adminGet('/api/admin/leads', { cookie: 'admin_session=forged' })).status, 401);

  const wrong = await app.inject({ method: 'POST', url: '/api/admin/login', payload: { login: 'admin', password: 'no' } });
  assert.equal(wrong.statusCode, 401);
});

test('logout ends the session', async () => {
  const headers = await login();

  await app.inject({ method: 'POST', url: '/api/admin/logout', headers });

  assert.equal((await adminGet('/api/admin/me', headers)).status, 401);
});

test('admin changes status and comment, filters and searches', async () => {
  await submit({ type: 'estimate', name: 'Иван', phone: '89000000001' });
  await submit({ type: 'contact', name: 'Мария', phone: '89000000002', message: 'Нужна розетка' });

  const headers = await login();
  const { body: all } = await adminGet('/api/admin/leads', headers);
  const maria = all.items.find((lead) => lead.name === 'Мария');

  const patched = await app.inject({
    method: 'PATCH', url: `/api/admin/leads/${maria.id}`, headers, payload: { status: 'done', comment: 'Перезвонили' },
  });
  assert.equal(patched.statusCode, 200);
  assert.equal(patched.json().status, 'done');
  assert.equal(patched.json().comment, 'Перезвонили');

  const badStatus = await app.inject({
    method: 'PATCH', url: `/api/admin/leads/${maria.id}`, headers, payload: { status: 'archived' },
  });
  assert.equal(badStatus.statusCode, 400);

  assert.equal((await adminGet('/api/admin/leads?status=done', headers)).body.total, 1);
  assert.equal((await adminGet('/api/admin/leads?type=estimate', headers)).body.total, 1);
  assert.equal((await adminGet('/api/admin/leads?q=розетка', headers)).body.items[0].name, 'Мария');

  const { body: meta } = await adminGet('/api/admin/meta', headers);
  assert.deepEqual(meta.newByType, { estimate: 1 });
});

test('exports leads to CSV safely', async () => {
  await submit({ type: 'contact', name: '=HYPERLINK("x")', phone: '+7 900 000-00-00', message: 'Текст с "кавычками"' });

  const headers = await login();
  const { status, body } = await adminGet('/api/admin/leads.csv', headers);

  assert.equal(status, 200);
  assert.ok(body.startsWith('﻿id;created_at;'));
  assert.ok(body.includes(`"'=HYPERLINK(""x"")"`));
  assert.ok(body.includes('"Текст с ""кавычками"""'));
  assert.ok(body.includes('"+7 900 000-00-00"'));
});
