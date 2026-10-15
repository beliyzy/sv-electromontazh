// Renders every page of the site to dist/<page>/index.html with its own <head>, plus 404.html, sitemap.xml and
// robots.txt. Search engines get complete HTML without running JavaScript.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const ssr = join(root, 'dist-ssr');

const { render, routes, headTags, headHtml, SEO_OPTIONS } = await import(pathToFileURL(join(ssr, 'entry-server.js')));

const template = readFileSync(join(dist, 'index.html'), 'utf8');

if (!template.includes('<!--seo-head-->') || !template.includes('<div id="root"></div>')) {
  throw new Error('index.html must contain <!--seo-head--> and <div id="root"></div>');
}

function page(pathname) {
  return template
    .replace('<!--seo-head-->', headHtml(headTags(pathname, SEO_OPTIONS)))
    .replace('<div id="root"></div>', `<div id="root">${render(pathname)}</div>`);
}

for (const route of routes) {
  const file = route.path === '/' ? join(dist, 'index.html') : join(dist, route.path, 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, page(route.path));
}

writeFileSync(join(dist, '404.html'), page('/404'));

const { siteUrl, noindex } = SEO_OPTIONS;
const today = new Date().toISOString().slice(0, 10);

writeFileSync(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((route) => `  <url>
    <loc>${siteUrl}${route.path}</loc>
    <lastmod>${today}</lastmod>
    <priority>${route.priority}</priority>
  </url>`).join('\n')}
</urlset>
`);

writeFileSync(join(dist, 'robots.txt'), noindex
  ? 'User-agent: *\nDisallow: /\n'
  : `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: ${siteUrl}/sitemap.xml
`);

rmSync(ssr, { recursive: true, force: true });

console.log(`Prerendered ${routes.length} pages + 404 for ${siteUrl}${noindex ? ' (noindex)' : ''}`);
