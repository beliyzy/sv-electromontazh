# Сайт электрика + админка заявок

- `web/` — публичный сайт (React + Vite): 8 страниц, формы заявок.
- `admin/` — админка заявок (React + Vite), открывается по `/admin/`.
- `server/` — API на Fastify + SQLite: приём заявок, вход в админку, работа с заявками.

## Тексты и данные компании

Все тексты, название, телефон, адрес, услуги и цены — плейсхолдеры в `web/src/content.js`. Замените их своими.
Фото работ кладутся в `web/public/photos/` и прописываются в `web/src/pages/Photo.jsx`. Отзывы — в `web/src/pages/Reviews.jsx`.

## Локальный запуск

```bash
npm install
cp .env.example .env
npm run hash-password -- 'ваш пароль'   # вставьте хэш в ADMIN_PASSWORD_HASH
# и задайте SESSION_SECRET в .env
npm run dev
```

- сайт: http://localhost:5173
- админка: http://localhost:5174/admin/
- API: http://localhost:3000

## Формы

| Тип | Где | Поля |
|---|---|---|
| `estimate` | блок «Расчёт сметы» на главной, ценах, услугах, фото, о нас | имя, телефон |
| `contact` | Контакты | имя, телефон, email, сообщение |
| `review` | Отзывы | имя, email, отзыв |
| `vacancy` | Вакансии | имя, фамилия, телефон, email, анкета |

Защита: валидация на сервере, согласие на обработку данных, honeypot-поле, лимит 5 заявок в минуту с одного IP.

## Админка

Вход по логину и паролю из `.env`, сессия в httpOnly-cookie на 7 дней.
Список заявок с вкладками по типу и счётчиком новых, фильтр по статусу, поиск, карточка заявки со статусом и комментарием, выгрузка в CSV.

## Продакшен

```bash
npm run build
NODE_ENV=production npm start   # сервер раздаёт сайт на / и админку на /admin/
```

Или Docker:

```bash
docker build -t sv-electromontazh .
docker run -p 3000:3000 -v sv-electromontazh-data:/data \
  -e ADMIN_LOGIN=admin -e ADMIN_PASSWORD_HASH='...' -e SESSION_SECRET='...' sv-electromontazh
```

В продакшене ставьте сервер за HTTPS-прокси (nginx, Caddy): cookie админки помечены `Secure`.

## SEO

При сборке (`npm run build`) каждая страница пререндерится в готовый HTML (`web/scripts/prerender.mjs`):
поисковики получают полный текст страницы без выполнения JavaScript. Мета-данные страниц — в `web/src/seo.js`.

- свои `title`, `description`, `canonical`, Open Graph на каждой странице;
- структурированные данные JSON-LD: `Electrician` (адрес, телефон, часы, районы, услуги), `FAQPage` на главной,
  `BreadcrumbList` на внутренних страницах;
- `sitemap.xml` и `robots.txt` (админка и API закрыты), `404.html` с кодом 404 и `noindex`.

Сборка для своего домена:

```bash
SITE_URL=https://ваш-домен.ru \
YANDEX_VERIFICATION=код-из-вебмастера GOOGLE_VERIFICATION=код-из-search-console \
npm run build
```

`SITE_URL` обязателен: из него строятся canonical, sitemap и robots. Демо-сборка (`VITE_DEMO=true`) и `NOINDEX=true`
закрывают сайт от индексации.

## Демо на GitHub

### GitHub Pages — постоянная ссылка

При каждом пуше в `main` workflow `.github/workflows/pages.yml` прогоняет тесты, собирает сайт и админку в демо-режиме
(`VITE_DEMO=true`) и публикует их:

- сайт: `https://<user>.github.io/sv-electromontazh/`
- админка: `https://<user>.github.io/sv-electromontazh/admin/` — логин `admin`, пароль `demo`

Демо закрыто от индексации (`noindex`, `robots.txt: Disallow: /`): в нём плейсхолдеры, и оно не должно
конкурировать с основным доменом в поиске. Сервера на Pages нет: в демо-режиме заявки сохраняются в `localStorage` браузера, админка читает их оттуда же.
Валидация та же, что на сервере. Заявки видит только тот, кто их отправил, в том же браузере.

Один раз нужно включить: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

### Codespaces — полный проект с сервером

**Code → Codespaces → Create codespace on main.** При создании ставятся зависимости и создаётся `.env`
(логин `admin`, пароль `demo`), затем запускается `npm run dev`. Сайт откроется на порту 5173,
админка — на порту 5174 по пути `/admin/` (вкладка **Ports**).

## Тесты

```bash
npm test
```
