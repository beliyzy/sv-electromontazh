// Demo mode (GitHub Pages, no server): leads are kept in localStorage of the browser. The site and the admin are on the
// same origin, so a lead sent from the site shows up in the admin. Validation is the same as on the server.
import { LEAD_TYPES, STATUSES, validateLead } from '../server/src/leadTypes.js';

export const DEMO = import.meta.env.VITE_DEMO === 'true';
export const DEMO_LOGIN = { login: 'admin', password: 'demo' };

const LEADS_KEY = 'sv-demo-leads';
const SESSION_KEY = 'sv-demo-session';

function read() {
  try {
    return JSON.parse(localStorage.getItem(LEADS_KEY)) ?? [];
  } catch {
    return [];
  }
}

function write(leads) {
  localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
}

class HttpError extends Error {
  constructor(status, body) {
    super(body.error ?? `HTTP ${status}`);
    this.status = status;
    this.body = body;
  }
}

export { HttpError as DemoHttpError };

/** POST /api/leads */
export function submitLead(body) {
  if (body.website) {
    return { ok: true };
  }

  if (body.consent !== true) {
    throw new HttpError(400, { errors: { consent: 'Нужно согласие на обработку данных' } });
  }

  const { lead, errors } = validateLead(body.type, body);

  if (errors) {
    throw new HttpError(400, { errors });
  }

  const leads = read();
  const now = new Date().toISOString();

  leads.push({
    id: leads.reduce((max, l) => Math.max(max, l.id), 0) + 1,
    name: null,
    phone: null,
    email: null,
    message: null,
    ...lead,
    page: body.page ?? null,
    status: 'new',
    comment: '',
    created_at: now,
    updated_at: now,
  });
  write(leads);

  return { ok: true };
}

function filtered({ type, status, q }) {
  const needle = q?.trim().toLowerCase();

  return read()
    .filter((lead) => !type || lead.type === type)
    .filter((lead) => !status || lead.status === status)
    .filter((lead) => !needle || JSON.stringify([lead.name, lead.phone, lead.email, lead.message, lead.details,
      lead.comment]).toLowerCase().includes(needle))
    .sort((a, b) => b.created_at.localeCompare(a.created_at) || b.id - a.id);
}

const loggedIn = () => sessionStorage.getItem(SESSION_KEY) === DEMO_LOGIN.login;

/** The admin API: same paths and responses as /api/admin on the server. */
export function adminApi(path, { method = 'GET', body } = {}) {
  const url = new URL(path, 'http://demo');

  if (url.pathname === '/login' && method === 'POST') {
    if (body?.login !== DEMO_LOGIN.login || body?.password !== DEMO_LOGIN.password) {
      throw new HttpError(401, { error: 'Неверный логин или пароль' });
    }
    sessionStorage.setItem(SESSION_KEY, body.login);
    return { login: body.login };
  }

  if (!loggedIn()) {
    throw new HttpError(401, { error: 'Unauthorized' });
  }

  if (url.pathname === '/logout') {
    sessionStorage.removeItem(SESSION_KEY);
    return { ok: true };
  }

  if (url.pathname === '/me') {
    return { login: DEMO_LOGIN.login };
  }

  if (url.pathname === '/meta') {
    const newByType = {};
    for (const lead of read().filter((l) => l.status === 'new')) {
      newByType[lead.type] = (newByType[lead.type] ?? 0) + 1;
    }

    return {
      types: Object.fromEntries(Object.entries(LEAD_TYPES).map(([type, spec]) => [type, {
        title: spec.title,
        fields: Object.fromEntries(Object.entries(spec.fields).map(([field, rule]) => [field, rule.label])),
      }])),
      statuses: STATUSES,
      newByType,
    };
  }

  if (url.pathname === '/leads') {
    const params = Object.fromEntries(url.searchParams);
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(params.pageSize) || 20));
    const all = filtered(params);

    return { items: all.slice((page - 1) * pageSize, page * pageSize), total: all.length, page, pageSize };
  }

  const match = url.pathname.match(/^\/leads\/(\d+)$/);

  if (match && method === 'PATCH') {
    if (body.status !== undefined && !STATUSES.includes(body.status)) {
      throw new HttpError(400, { errors: { status: 'Неизвестный статус' } });
    }

    const leads = read();
    const lead = leads.find((l) => l.id === Number(match[1]));

    if (!lead) {
      throw new HttpError(404, { error: 'Not found' });
    }

    Object.assign(lead, {
      status: body.status ?? lead.status,
      comment: body.comment ?? lead.comment,
      updated_at: new Date().toISOString(),
    });
    write(leads);

    return lead;
  }

  throw new HttpError(404, { error: 'Not found' });
}

/** Leads of the filter as CSV, the same format as the server export. */
export function leadsCsv(query) {
  const columns = ['id', 'created_at', 'type', 'status', 'name', 'phone', 'email', 'message', 'details', 'page', 'comment'];
  const cell = (value) => {
    let text = value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value);
    if (/^[=+\-@\t\r]/.test(text) && !/^[+-]?[\d\s().-]+$/.test(text)) {
      text = `'${text}`;
    }
    return `"${text.replaceAll('"', '""')}"`;
  };

  return '﻿' + [columns.join(';'),
    ...filtered(Object.fromEntries(new URLSearchParams(query))).map((l) => columns.map((c) => cell(l[c])).join(';'))]
    .join('\r\n');
}
