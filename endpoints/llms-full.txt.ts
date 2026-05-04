/**
 * /llms-full.txt - pełny dump treści w plain text (RAG-ready).
 *
 * Różnica vs llms.txt: tam są LINKI, tu jest TREŚĆ. LLM jednym fetchem
 * dostaje cały portfolio bez konieczności crawlowania per-strona.
 *
 * Każdy artykuł oznaczony **Language:** + canonical URL.
 *
 * Astro: `src/pages/llms-full.txt.ts`.
 *
 * Performance: ten endpoint może być ciężki (cały content). Build-time generation
 * jeśli Astro w SSG mode (po prostu w build folderze ląduje plain file).
 */

import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE } from '@config/site';

function formatArticle(entry: { id: string; body?: string; data: any }, collection: string): string {
  const { data } = entry;
  const date = data.date.toISOString().slice(0, 10);
  const updated = data.updated ? ` (updated ${data.updated.toISOString().slice(0, 10)})` : '';
  const tags = data.tags?.length > 0 ? `\nTags: ${data.tags.join(', ')}` : '';
  const tldr = data.tldr ? `\n\n**TL;DR:** ${data.tldr}` : '';
  const body = entry.body ?? '';
  const url = `${SITE.url}/${collection}/${entry.id}`;

  return `
## ${data.title}

**URL:** ${url}
**Published:** ${date}${updated}
**Language:** ${data.language ?? SITE.defaultLang}${tags}${tldr}

${data.description}

${body}

---
`;
}

export const GET: APIRoute = async () => {
  const articles = (await getCollection('articles', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );

  const projects = await getCollection('projects');

  const output = `# ${SITE.brand.name} - Full Content

${SITE.brand.tagline.en}

> Pełna treść portfolio dla LLM consumption.
> Pojedyncze strony HTML pozostają canonical dla ludzi.
>
> Last updated: ${new Date().toISOString()}
> This file: ${SITE.url}/llms-full.txt

---

# Author

**${SITE.author.name}** - ${SITE.author.jobTitle.en}

[Tu wklej rozszerzone bio: 5-10 zdań. Kim jesteś, jaka teza, co budujesz,
co odróżnia Cię od reszty rynku.]

**Contact:**
- Email: ${SITE.author.email}
- LinkedIn: ${SITE.social.linkedin}
- GitHub: ${SITE.social.github}

---

# Articles (${articles.length})

${articles.map((a) => formatArticle(a, 'articles')).join('\n')}

---

# Projects (${projects.length})

${
  projects
    .sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0))
    .map(
      (p) => `
## ${p.data.title?.en ?? p.data.title}

**Category:** ${p.data.category}
**Status:** ${p.data.status}
${p.data.githubRepo ? `**GitHub:** https://github.com/${p.data.githubRepo}\n` : ''}${p.data.stack?.length > 0 ? `**Stack:** ${p.data.stack.join(', ')}\n` : ''}

${p.data.description?.en ?? p.data.description}
`,
    )
    .join('\n')
}

---

# End of content

For programmatic access, use MCP endpoint: ${SITE.url}/mcp
For HTML pages, start from: ${SITE.url}/
`;

  return new Response(output, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=3600',
    },
  });
};
