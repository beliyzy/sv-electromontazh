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

## Тесты

```bash
npm test
```
