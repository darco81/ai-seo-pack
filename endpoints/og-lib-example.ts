/**
 * Przykładowa implementacja generatora OG image - `src/lib/og.ts`.
 *
 * Stack: satori (JSX → SVG) + @resvg/resvg-js (SVG → PNG).
 *
 * Install:
 *   pnpm add satori @resvg/resvg-js
 *
 * Czcionkę musisz mieć w `public/fonts/` lub fetch przy starcie.
 * Tu przykład z Inter Variable Font.
 */

import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

interface OGOptions {
  title: string;
  seriesBadge?: string;
  readingTime?: number;
  date?: string;
}

let cachedFont: ArrayBuffer | null = null;

async function loadFont(): Promise<ArrayBuffer> {
  if (cachedFont) return cachedFont;
  const fontPath = path.resolve(process.cwd(), 'public/fonts/Inter-Bold.ttf');
  const buffer = await readFile(fontPath);
  cachedFont = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;
  return cachedFont;
}

export async function generateOGImage({
  title,
  seriesBadge,
  readingTime,
  date,
}: OGOptions): Promise<Buffer> {
  const fontData = await loadFont();

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '1200px',
          height: '630px',
          background: '#0a0a0a',
          color: '#f8f8f8',
          padding: '80px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          fontFamily: 'Inter',
        },
        children: [
          // Top: badge
          seriesBadge
            ? {
                type: 'div',
                props: {
                  style: {
                    display: 'inline-block',
                    fontSize: '24px',
                    color: '#9affad',
                    border: '1px solid #9affad',
                    padding: '8px 20px',
                    borderRadius: '4px',
                    letterSpacing: '4px',
                  },
                  children: seriesBadge,
                },
              }
            : null,
          // Center: title
          {
            type: 'div',
            props: {
              style: {
                fontSize: '72px',
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: '-2px',
              },
              children: title,
            },
          },
          // Bottom: meta
          {
            type: 'div',
            props: {
              style: {
                fontSize: '24px',
                color: '#888',
                display: 'flex',
                gap: '16px',
              },
              children: [date, readingTime ? `${readingTime} min read` : null]
                .filter(Boolean)
                .join('  ·  '),
            },
          },
        ].filter(Boolean),
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [{ name: 'Inter', data: fontData, weight: 800, style: 'normal' }],
    },
  );

  const resvg = new Resvg(svg, { background: '#0a0a0a' });
  return resvg.render().asPng();
}
