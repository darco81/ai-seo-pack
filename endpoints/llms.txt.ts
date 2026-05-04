/**
 * /llms.txt - llmstxt.org standard dla AI crawlerów.
 *
 * Format: Markdown z listą sekcji + linków do treści (canonical URLs).
 * LLM-y po niego sięgają zamiast crawlować HTML, więc daj tu wszystko
 * istotne: kim jesteś, co robisz, najnowsze artykuły, kontakt.
 *
 * Astro: umieść w `src/pages/llms.txt.ts`.
 * Next.js: route handler w `app/llms.txt/route.ts`.
 *
 * Cache: max-age=300 (5 min) + s-maxage=3600 (1h CDN). LLM-y odpytują rzadko.
 */

import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE } from '@config/site';

export const GET: APIRoute = async () => {
  const articles = (await getCollection('articles', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );

  const featured = articles.filter((a) => a.data.featured);

  function fmtItem(e: (typeof articles)[number]): string {
    const url = `${SITE.url}/articles/${e.id}`;
    return `- [${e.data.title}](${url}): ${e.data.description}`;
  }

  const output = `# ${SITE.brand.name} - Portfolio

> ${SITE.author.jobTitle.en}. ${SITE.brand.tagline.en}
> ${SITE.description.en}

## About the author

[Krótkie bio 2-3 zdania. Kim jesteś, co robisz, jaka teza/specjalizacja.]

Contact: ${SITE.author.email} · ${SITE.social.linkedin} · ${SITE.social.github}

## Main sections

- [Home](${SITE.url}/): overview and landing
- [About](${SITE.url}/about): full bio + stack + availability
- [Projects](${SITE.url}/projects): public GitHub + ecosystem
- [Articles](${SITE.url}/articles): technical content index
- [Contact](${SITE.url}/contact): get in touch

${featured.length > 0 ? `## Featured\n\n${featured.map(fmtItem).join('\n')}\n` : ''}

## Latest articles

${articles.slice(0, 12).map(fmtItem).join('\n')}

## Full content

Machine-readable full content dump: /llms-full.txt

## Programmatic access (MCP)

Model Context Protocol endpoint: /mcp
Tools: list_articles, read_article, search, list_projects, get_about.

---

Last updated: ${new Date().toISOString().slice(0, 10)}
This file: ${SITE.url}/llms.txt
`;

  return new Response(output, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=3600',
    },
  });
};
