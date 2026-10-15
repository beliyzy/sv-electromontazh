export class UnauthorizedError extends Error {}

export async function api(path, { method = 'GET', body } = {}) {
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
