# Сайт электрика

`web/` — сайт-визитка (React + Vite), 7 страниц. Форм и бэкенда нет: на всех страницах кнопки «Позвонить»
со ссылкой `tel:`. После сборки — набор статических HTML-файлов, их можно разместить на любом хостинге.

## Тексты и данные компании

Все тексты, название, телефон, адрес, услуги и цены — плейсхолдеры в `web/src/content.js`. Замените их своими.
Фото работ кладутся в `web/public/photos/` и прописываются в `web/src/pages/Photo.jsx`. Отзывы — в `web/src/pages/Reviews.jsx`.

## Локальный запуск

```bash
npm install
npm run dev   # http://localhost:5173
```

## Продакшен

```bash
SITE_URL=https://ваш-домен.ru npm run build
```

Готовый сайт — в `web/dist/`: выложите его на любой статический хостинг или раздайте nginx
(конфиг — `nginx.conf`: страницы `/<page>/index.html`, `404.html` с кодом 404).

Или Docker (nginx со сборкой внутри):

```bash
docker build --build-arg SITE_URL=https://ваш-домен.ru -t sv-electromontazh .
docker run -p 8080:80 sv-electromontazh
```

## SEO

При сборке (`npm run build`) каждая страница пререндерится в готовый HTML (`web/scripts/prerender.mjs`):
поисковики получают полный текст страницы без выполнения JavaScript. Мета-данные страниц — в `web/src/seo.js`.

- свои `title`, `description`, `canonical`, Open Graph на каждой странице;
- структурированные данные JSON-LD: `Electrician` (адрес, телефон, часы, районы, услуги), `FAQPage` на главной,
  `BreadcrumbList` на внутренних страницах;
- `sitemap.xml` и `robots.txt`, `404.html` с кодом 404 и `noindex`.

Сборка для своего домена:

```bash
SITE_URL=https://ваш-домен.ru \
YANDEX_VERIFICATION=код-из-вебмастера GOOGLE_VERIFICATION=код-из-search-console \
npm run build
```

`SITE_URL` обязателен: из него строятся canonical, sitemap и robots. `NOINDEX=true` закрывает сайт
от индексации.

## Демо на GitHub

### GitHub Pages — постоянная ссылка

При каждом пуше в `main` workflow `.github/workflows/pages.yml` собирает сайт и публикует его
на `https://<user>.github.io/sv-electromontazh/`.

Демо закрыто от индексации (`NOINDEX=true`: `noindex`, `robots.txt: Disallow: /`): в нём плейсхолдеры, и оно
не должно конкурировать с основным доменом в поиске.

Один раз нужно включить: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

### Codespaces

**Code → Codespaces → Create codespace on main.** При создании ставятся зависимости и запускается `npm run dev`,
сайт откроется на порту 5173.
