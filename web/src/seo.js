// SEO of the pages: titles, descriptions and structured data. Used both at build time (prerendered HTML) and in the
// browser (navigation between pages), so search engines and users see the same <head>.
import { company, faq, nav, services } from './content.js';

const city = company.city; // «в Подольске»

export const routes = [
  {
    path: '/',
    title: `Электрик в ${city} — вызов на дом, цены | ${company.name}`,
    description: `Услуги электрика в ${city}: ремонт и замена проводки, подключение техники, установка счётчиков и автоматов. Выезд за 1–2 часа, гарантия до 3 лет. ☎ ${company.phone}`,
    priority: '1.0',
  },
  {
    path: '/prices',
    title: `Цены на услуги электрика в ${city} — прайс 2026 | ${company.name}`,
    description: `Прайс на электромонтажные работы в ${city}: розетки, освещение, щитки, проводка под ключ. Выезд ${company.callOutPrice}. Фиксированная цена до начала работ.`,
    priority: '0.9',
  },
  {
    path: '/services',
    title: `Услуги электрика в ${city}: проводка, счётчики, ремонт | ${company.name}`,
    description: `${services.map((s) => s.title).slice(0, 5).join(', ')} в ${city}. Работаем с квартирами, домами и организациями.`,
    priority: '0.9',
  },
  {
    path: '/photo',
    title: `Фото работ электриков в ${city} | ${company.name}`,
    description: `Примеры наших электромонтажных работ в ${city}: монтаж щитков, прокладка проводки, установка освещения.`,
    priority: '0.6',
  },
  {
    path: '/about',
    title: `О компании ${company.name} — электрики в ${city}`,
    description: `${company.name}: команда электриков в ${city}. Работаем по договору, даём гарантию, используем сертифицированные материалы.`,
    priority: '0.6',
  },
  {
    path: '/reviews',
    title: `Отзывы клиентов о ${company.name} в ${city}`,
    description: `Отзывы о работе электриков ${company.name} в ${city}. Оставьте свой отзыв о нашей работе.`,
    priority: '0.6',
  },
  {
    path: '/vacancies',
    title: `Вакансии: работа электриком в ${city} | ${company.name}`,
    description: `Ищем электриков в ${city}: стабильный поток заказов, гибкий график, своевременная оплата. Заполните анкету на сайте.`,
    priority: '0.4',
  },
  {
    path: '/contacts',
    title: `Контакты ${company.name} — электрик в ${city}`,
    description: `Телефон ${company.phone}, ${company.hours.toLowerCase()}. Адрес: ${company.address}. Оставьте заявку — перезвоним за 15 минут.`,
    priority: '0.7',
  },
];

const NOT_FOUND = {
  path: null,
  title: `Страница не найдена | ${company.name}`,
  description: 'Такой страницы нет. Перейдите на главную или позвоните нам.',
  noindex: true,
};

export function getRoute(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/';
  return routes.find((route) => route.path === path) ?? NOT_FOUND;
}

function business(siteUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Electrician',
    '@id': `${siteUrl}/#business`,
    name: company.name,
    url: `${siteUrl}/`,
    telephone: company.phoneHref.replace('tel:', ''),
    email: company.email,
    priceRange: company.priceRange,
    openingHours: company.openingHours,
    address: {
      '@type': 'PostalAddress',
      streetAddress: company.streetAddress,
      addressLocality: company.locality,
      addressRegion: company.region,
      postalCode: company.postalCode,
      addressCountry: 'RU',
    },
    areaServed: company.areaServed.map((name) => ({ '@type': 'City', name })),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Услуги электрика',
      itemListElement: services.map((service) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: service.title, description: service.short },
      })),
    },
  };
}

function breadcrumbs(route, siteUrl) {
  const label = nav.find((item) => item.to === route.path)?.label ?? route.title;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Главная', item: `${siteUrl}/` },
      { '@type': 'ListItem', position: 2, name: label, item: `${siteUrl}${route.path}` },
    ],
  };
}

function faqPage() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

/**
 * Tags of <head> for the page: [{ tag, attrs, text? }].
 * @param {string} pathname path without the base, e.g. "/prices"
 * @param {{ siteUrl: string, noindex?: boolean, verification?: { yandex?: string, google?: string } }} options
 */
export function headTags(pathname, { siteUrl, noindex = false, verification = {} }) {
  const route = getRoute(pathname);
  const url = route.path ? `${siteUrl}${route.path === '/' ? '/' : route.path}` : null;
  const robots = noindex || route.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large';

  const tags = [
    { tag: 'title', attrs: {}, text: route.title },
    { tag: 'meta', attrs: { name: 'description', content: route.description } },
    { tag: 'meta', attrs: { name: 'robots', content: robots } },
    { tag: 'meta', attrs: { property: 'og:type', content: 'website' } },
    { tag: 'meta', attrs: { property: 'og:locale', content: 'ru_RU' } },
    { tag: 'meta', attrs: { property: 'og:site_name', content: company.name } },
    { tag: 'meta', attrs: { property: 'og:title', content: route.title } },
    { tag: 'meta', attrs: { property: 'og:description', content: route.description } },
  ];

  if (url) {
    tags.push(
      { tag: 'link', attrs: { rel: 'canonical', href: url } },
      { tag: 'meta', attrs: { property: 'og:url', content: url } },
    );
  }

  if (verification.yandex) {
    tags.push({ tag: 'meta', attrs: { name: 'yandex-verification', content: verification.yandex } });
  }

  if (verification.google) {
    tags.push({ tag: 'meta', attrs: { name: 'google-site-verification', content: verification.google } });
  }

  if (!route.noindex) {
    const data = [business(siteUrl)];

    if (route.path === '/') {
      data.push(faqPage());
    } else {
      data.push(breadcrumbs(route, siteUrl));
    }

    tags.push({ tag: 'script', attrs: { type: 'application/ld+json' }, text: JSON.stringify(data) });
  }

  return tags;
}

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

/** Tags as an HTML string for the prerendered pages. */
export function headHtml(tags) {
  return tags.map(({ tag, attrs, text }) => {
    const attributes = Object.entries({ ...attrs, 'data-seo': '' })
      .map(([name, value]) => (value === '' ? ` ${name}` : ` ${name}="${escapeHtml(value)}"`)).join('');

    if (tag === 'meta' || tag === 'link') {
      return `<${tag}${attributes}>`;
    }

    // JSON in <script> must not close the tag.
    const body = tag === 'script' ? text.replaceAll('</', '<\\/') : escapeHtml(text);
    return `<${tag}${attributes}>${body}</${tag}>`;
  }).join('\n    ');
}
