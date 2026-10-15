import { fileURLToPath } from 'node:url';

import { buildApp } from './app.js';
import { openDb } from './db.js';

const root = (path) => fileURLToPath(new URL(path, import.meta.url));

function required(name) {
  const value = process.env[name];

  if (!value) {
    console.error(`Environment variable ${name} is not set: see .env.example`);
    process.exit(1);
  }

  return value;
}

const production = process.env.NODE_ENV === 'production';

const app = await buildApp({
  db: openDb(process.env.DB_FILE || root('../data/leads.db')),
  admin: {
    login: required('ADMIN_LOGIN'),
    passwordHash: required('ADMIN_PASSWORD_HASH'),
    sessionSecret: required('SESSION_SECRET'),
  },
  secureCookies: production,
  staticDirs: { web: root('../../web/dist'), admin: root('../../admin/dist') },
  logger: { level: production ? 'info' : 'warn' },
});

await app.listen({ port: Number(process.env.PORT) || 3000, host: process.env.HOST || '127.0.0.1' });
console.log(`Server: http://localhost:${Number(process.env.PORT) || 3000}`);
