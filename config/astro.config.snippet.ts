/**
 * astro.config.ts - relewantne fragmenty dla AI/SEO setup.
 *
 * Pełny config może mieć więcej (Tailwind, MDX, integrations) - tu pokazane
 * minimum dla:
 * - SSG default + SSR per endpoint (/mcp, /api/*)
 * - i18n routing (en + pl)
 * - sitemap z hreflang per URL
 * - sitemap filter (exclude /mcp, /api, /og)
 *
 * Install:
 *   pnpm add @astrojs/sitemap @astrojs/node
 */

import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';

const DEFAULT_LANG = (process.env.DEFAULT_LANG ?? 'en') as 'en' | 'pl';
const SITE = process.env.PUBLIC_SITE_URL ?? 'https://twoj-portfolio.pl';

export default defineConfig({
  site: SITE,

  // Hybrid: 99% static (SSG), SSR per endpoint
  output: 'static',
  adapter: node({ mode: 'standalone' }),

  i18n: {
    defaultLocale: DEFAULT_LANG,
    locales: ['en', 'pl'],
    routing: {
      prefixDefaultLocale: false, // EN URL-e bez /en/ prefix
    },
  },

  integrations: [
    sitemap({
      // Filter - co NIE wchodzi do sitemap.xml
      filter: (page) => {
        const excluded = ['/mcp', '/api/', '/og/', '/404'];
        if (excluded.some((path) => page.includes(path))) return false;
        // Exclude default-lang prefix routes (EN build: /en/* duplikuje root /)
        if (page.includes(`/${DEFAULT_LANG}/`)) return false;
        return true;
      },
      // i18n hreflang - każdy URL dostaje xhtml:link rel="alternate"
      i18n: {
        defaultLocale: DEFAULT_LANG,
        locales: {
          en: 'en-US',
          pl: 'pl-PL',
        },
      },
    }),
  ],
});
