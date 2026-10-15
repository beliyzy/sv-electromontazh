// Server entry used at build time to prerender every page to static HTML (scripts/prerender.mjs).
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';

import App from './App.jsx';

export { headHtml, headTags, routes } from './seo.js';
export { SEO_OPTIONS } from './seoOptions.js';

const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

export function render(pathname) {
  return renderToString(
    <StrictMode>
      <StaticRouter location={basename + pathname} basename={basename}>
        <App />
      </StaticRouter>
    </StrictMode>,
  );
}
