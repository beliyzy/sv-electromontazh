// Creates .env for a Codespace on the first start: admin / demo, random session secret.
import { existsSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';

if (existsSync('.env')) {
  console.log('.env already exists, left as is');
} else {
  writeFileSync('.env', [
    'ADMIN_LOGIN=admin',
    `ADMIN_PASSWORD_HASH=${bcrypt.hashSync('demo', 12)}`,
    `SESSION_SECRET=${randomBytes(32).toString('hex')}`,
    'PORT=3000',
    '',
  ].join('\n'));
  console.log('Created .env: admin login is admin / demo');
}
