/**
 * /rss.xml - klasyczny RSS feed.
 *
 * Mimo że "umarł", agregatory typu Feedly, NetNewsWire, AI news bots, Telegram
 * RSS feeders wciąż konsumują. Niski koszt, dystrybucja.
 *
 * Format: summary (description) bez full content - żeby zachęcić kliki na stronę.
 *
 * Astro: `src/pages/rss.xml.ts` + `pnpm add @astrojs/rss`.
 *
 * Po deployu: dodaj `<link rel="alternate" type="application/rss+xml">` w <head>
 * (patrz BaseHead.astro).
 */

import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { SITE } from '@config/site';

export async function GET(context: APIContext) {
  const articles = await getCollection(
    'articles',
    ({ data }) => !data.draft && data.language === SITE.defaultLang,
  );

  const items = articles
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
    .slice(0, 30)
    .map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.date,
      link: `/articles/${entry.id}`,
      categories: entry.data.tags ?? [],
    }));

  return rss({
    title: `${SITE.brand.name} - ${SITE.brand.tagline.en}`,
    description: SITE.description[SITE.defaultLang],
    site: context.site ?? SITE.url,
    items,
    customData: `<language>${SITE.defaultLang}</language>`,
  });
}
