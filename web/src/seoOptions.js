// Build-time settings of SEO (see vite.config.js): the public address of the site and verification codes.
export const SEO_OPTIONS = {
  siteUrl: __SITE_URL__,
  noindex: __NOINDEX__,
  verification: { yandex: __YANDEX_VERIFICATION__, google: __GOOGLE_VERIFICATION__ },
};
