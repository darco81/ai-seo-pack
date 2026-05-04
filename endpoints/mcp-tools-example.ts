/**
 * Przykładowa implementacja MCP tools - `src/lib/mcp/tools.ts`.
 *
 * Każdy tool to czysta funkcja na content collections (Zod-validated).
 * Read-only - nie modyfikuje stanu.
 */

import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import { SITE } from '@config/site';

type Article = CollectionEntry<'articles'>;
type Project = CollectionEntry<'projects'>;

interface ListArticlesArgs {
  collection?: 'articles' | 'from-the-field';
  language?: 'en' | 'pl';
  tag?: string;
  limit?: number;
}

export async function listArticles(args: ListArticlesArgs = {}) {
  const limit = args.limit ?? 20;
  const all = await getCollection(args.collection ?? 'articles');

  const filtered = all
    .filter((a: Article) => !a.data.draft)
    .filter((a: Article) => !args.language || a.data.language === args.language)
    .filter((a: Article) => !args.tag || a.data.tags?.includes(args.tag))
    .sort((a: Article, b: Article) => b.data.date.valueOf() - a.data.date.valueOf())
    .slice(0, limit);

  return filtered.map((a: Article) => ({
    slug: a.id,
    title: a.data.title,
    description: a.data.description,
    date: a.data.date.toISOString().slice(0, 10),
    language: a.data.language,
    tags: a.data.tags ?? [],
    url: `${SITE.url}/articles/${a.id}`,
  }));
}

interface ReadArticleArgs {
  slug: string;
  collection?: 'articles' | 'from-the-field';
  language?: 'en' | 'pl';
}

export async function readArticle({ slug, collection = 'articles', language }: ReadArticleArgs) {
  const all = await getCollection(collection);
  const entry = all.find(
    (e: Article) => e.id === slug && (!language || e.data.language === language),
  );
  if (!entry) throw new Error(`Article not found: ${slug}`);

  return {
    slug: entry.id,
    title: entry.data.title,
    description: entry.data.description,
    tldr: entry.data.tldr,
    date: entry.data.date.toISOString().slice(0, 10),
    language: entry.data.language,
    tags: entry.data.tags ?? [],
    url: `${SITE.url}/articles/${entry.id}`,
    body: entry.body,
  };
}

interface SearchArgs {
  query: string;
  limit?: number;
}

export async function search({ query, limit = 10 }: SearchArgs) {
  const q = query.toLowerCase();
  const all = await getCollection('articles');

  const matches = all
    .filter((a: Article) => !a.data.draft)
    .map((a: Article) => {
      const haystack = [
        a.data.title,
        a.data.description,
        a.data.tldr ?? '',
        ...(a.data.tags ?? []),
      ]
        .join(' ')
        .toLowerCase();
      const score = haystack.includes(q) ? 1 : 0;
      return { entry: a, score };
    })
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return matches.map(({ entry }) => ({
    slug: entry.id,
    title: entry.data.title,
    description: entry.data.description,
    url: `${SITE.url}/articles/${entry.id}`,
  }));
}

export async function listProjects() {
  const projects = await getCollection('projects');
  return projects
    .sort((a: Project, b: Project) => (a.data.order ?? 0) - (b.data.order ?? 0))
    .map((p: Project) => ({
      slug: p.id,
      title: p.data.title,
      description: p.data.description,
      githubRepo: p.data.githubRepo,
      stack: p.data.stack ?? [],
      status: p.data.status,
    }));
}

export async function listEcosystem() {
  const ecosystem = await getCollection('ecosystem');
  return ecosystem.map((e: any) => ({
    slug: e.id,
    title: e.data.title,
    description: e.data.description,
    status: e.data.status,
    metrics: e.data.metrics ?? [],
  }));
}

export async function getAbout({ language = 'en' }: { language?: 'en' | 'pl' } = {}) {
  return {
    name: SITE.author.name,
    jobTitle: SITE.author.jobTitle[language],
    email: SITE.author.email,
    linkedin: SITE.social.linkedin,
    github: SITE.social.github,
    description: SITE.description[language],
  };
}

export async function getMetrics() {
  const articles = await getCollection('articles');
  const projects = await getCollection('projects');
  return {
    articlesCount: articles.length,
    projectsCount: projects.length,
    lastUpdated: new Date().toISOString(),
  };
}
