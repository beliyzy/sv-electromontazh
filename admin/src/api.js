import { adminApi, DEMO, leadsCsv } from '../../shared/demoStore.js';

export class UnauthorizedError extends Error {}

export { DEMO };

export async function api(path, options = {}) {
  if (DEMO) {
    try {
      return adminApi(path, options);
    } catch (e) {
      if (e.status === 401) {
        throw new UnauthorizedError();
      }
      throw new Error(e.body?.error ?? Object.values(e.body?.errors ?? {})[0] ?? e.message);
    }
  }

  const { method = 'GET', body } = options;

  const response = await fetch(`/api/admin${path}`, {
    method,
    credentials: 'same-origin',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401) {
    throw new UnauthorizedError();
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error ?? Object.values(data.errors ?? {})[0] ?? `Ошибка ${response.status}`);
  }

  return data;
}


/** Downloads leads of the filter (query string) as CSV. */
export function exportCsv(query) {
  if (!DEMO) {
    window.location.href = `/api/admin/leads.csv?${query}`;
    return;
  }

  const url = URL.createObjectURL(new Blob([leadsCsv(query)], { type: 'text/csv;charset=utf-8' }));
  const link = Object.assign(document.createElement('a'), { href: url, download: 'leads.csv' });
  link.click();
  URL.revokeObjectURL(url);
}
