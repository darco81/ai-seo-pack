/**
 * /og/[...slug].png - per-artykuł OG image (1200×630).
 *
 * Build-time generated dla każdego artykułu w content collections. Zawiera:
 * tytuł + series badge (np. "ARTICLE", "FROM THE FIELD") + reading time + datę.
 *
 * Pattern URL: /og/<collection>/<slug>-<locale>.png
 *   np. /og/articles/cdat-pattern-en.png
 *       /og/articles/cdat-pattern-pl.png
 *
 * Astro: `src/pages/og/[...slug].png.ts` (note katalog `og/`).
 *
 * Wymagania:
 * - `src/lib/og.ts` z funkcją `generateOGImage` (satori + Resvg)
 * - Plik czcionki w `public/fonts/` lub embeded w og.ts
 *
 * Dlaczego per-artykuł OG: LinkedIn / Twitter share preview się zmienia per
 * link → CTR rośnie 2-3x vs jeden generic OG.
 */

import type { APIRoute } from 'astro';
import { generateOGImage } from '@lib/og';
import { getCollection } from 'astro:content';

type Locale = 'en' | 'pl';
type ArticleCollection = 'articles' | 'from-the-field' | 'how-i-do-it';

const COLLECTIONS: ArticleCollection[] = ['articles', 'from-the-field', 'how-i-do-it'];

const SERIES_BADGE: Record<ArticleCollection, string> = {
  articles: 'ARTICLE',
  'from-the-field': 'FROM THE FIELD',
  'how-i-do-it': 'HOW I DO IT',
};

interface OGProps {
  title: string;
  seriesBadge: string;
  readingTime?: number;
  date: string;
  locale: Locale;
}

export async function getStaticPaths() {
  const paths: { params: { slug: string }; props: OGProps }[] = [];

  for (const collection of COLLECTIONS) {
    const entries = await getCollection(collection, ({ data }) => !data.draft);

    for (const entry of entries) {
      const locale = entry.data.language ?? 'en';
      paths.push({
        params: {
          slug: `${collection}/${entry.id}-${locale}`,
        },
        props: {
          title: entry.data.title,
          seriesBadge: SERIES_BADGE[collection],
          ...(entry.data.readingTime !== undefined ? { readingTime: entry.data.readingTime } : {}),
          date: entry.data.date.toISOString(),
          locale,
        },
      });
    }
  }

  return paths;
}

export const GET: APIRoute = async ({ props }) => {
  const { title, seriesBadge, readingTime, date, locale } = props as OGProps;

  const formattedDate = new Intl.DateTimeFormat(locale === 'pl' ? 'pl-PL' : 'en-US', {
    year: 'numeric',
    month: 'short',
  }).format(new Date(date));

  try {
    const png = await generateOGImage({
      title,
      seriesBadge,
      ...(readingTime !== undefined ? { readingTime } : {}),
      date: formattedDate,
    });

    return new Response(new Uint8Array(png), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    console.error('OG generation failed:', err);
    return new Response('OG generation failed', { status: 500 });
  }
};
