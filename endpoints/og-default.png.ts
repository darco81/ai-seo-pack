/**
 * /og-default.png - generic brand fallback OG image (1200×630).
 *
 * Używany jako og:image fallback dla stron bez własnego OG (home, about,
 * contact). Per-artykuł OG nadpisuje przez /og/[...slug].png.
 *
 * Implementacja: `src/lib/og.ts` używa `satori` + JSX → PNG.
 * Alternative: `@vercel/og` w Next.js, lub Cloudinary on-the-fly.
 *
 * Cache: max-age=31536000 immutable - OG się nie zmienia, hash w URL przy update.
 */

import type { APIRoute } from 'astro';
import { generateOGImage } from '@lib/og';
import { SITE } from '@config/site';

export const GET: APIRoute = async () => {
  try {
    const png = await generateOGImage({
      title: SITE.brand.headline.en,
      seriesBadge: SITE.brand.tagline.en.toUpperCase(),
    });

    return new Response(new Uint8Array(png), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    console.error('og-default.png generation failed:', err);
    return new Response('OG generation failed', { status: 500 });
  }
};
