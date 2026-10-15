import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { headTags } from '../seo.js';
import { SEO_OPTIONS } from '../seoOptions.js';

/** Keeps <head> in sync with the page on client-side navigation; the first page comes prerendered. */
export default function Seo() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.head.querySelectorAll('[data-seo]').forEach((element) => element.remove());

    for (const { tag, attrs, text } of headTags(pathname, SEO_OPTIONS)) {
      const element = document.createElement(tag);
      Object.entries(attrs).forEach(([name, value]) => element.setAttribute(name, value));
      element.setAttribute('data-seo', '');
      if (text) {
        element.textContent = text;
      }
      document.head.appendChild(element);
    }
  }, [pathname]);

  return null;
}
