/**
 * /mcp - Model Context Protocol endpoint (HTTP JSON-RPC simplified).
 *
 * Pozwala MCP clients (Claude Desktop, Cursor, własne skrypty AI) podpiąć
 * portfolio jako read-only data source. User w ChatGPT/Claude pyta:
 * "co Dariusz pisał o testowaniu API?" → AI strzela do /mcp?tool=search&query=...
 *
 * 7 tools (read-only):
 *   list_articles, read_article, search, list_projects,
 *   list_ecosystem, get_about, get_metrics
 *
 * Astro: `src/pages/mcp.ts` + `prerender = false` (SSR).
 *
 * UWAGA: To uproszczona wersja. Pełny MCP SDK używa SSE transport - tu mamy
 * HTTP GET (?tool=...) + POST JSON-RPC. Większość clients to przyjmie.
 *
 * Implementacja tools: `src/lib/mcp/tools.ts` - wrappery na getCollection.
 */

import type { APIRoute } from 'astro';
import {
  listArticles,
  readArticle,
  search,
  listProjects,
  listEcosystem,
  getAbout,
  getMetrics,
} from '@lib/mcp/tools';

export const prerender = false;

const TOOLS = [
  {
    name: 'list_articles',
    description: 'List articles. Filter by collection, language, tag.',
    args: ['collection', 'language', 'tag', 'limit'],
  },
  {
    name: 'read_article',
    description: 'Read full article + metadata by slug.',
    args: ['slug', 'collection', 'language'],
  },
  {
    name: 'search',
    description: 'Full-text search (title, description, tags).',
    args: ['query', 'limit'],
  },
  {
    name: 'list_projects',
    description: 'List public projects with metadata.',
    args: [],
  },
  {
    name: 'list_ecosystem',
    description: 'List ecosystem highlights / showcase items.',
    args: [],
  },
  {
    name: 'get_about',
    description: 'Author bio, availability, contact.',
    args: ['language'],
  },
  {
    name: 'get_metrics',
    description: 'Scale metrics (LOC, projects, etc.).',
    args: [],
  },
];

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=60, s-maxage=300',
    },
  });
}

async function dispatch(tool: string, args: Record<string, unknown>) {
  switch (tool) {
    case 'list_articles':
      return listArticles(args);
    case 'read_article':
      if (typeof args.slug !== 'string') throw new Error('slug required');
      return readArticle({ slug: args.slug, ...args } as never);
    case 'search':
      if (typeof args.query !== 'string') throw new Error('query required');
      return search({ query: args.query, ...args } as never);
    case 'list_projects':
      return listProjects();
    case 'list_ecosystem':
      return listEcosystem();
    case 'get_about':
      return getAbout(args as never);
    case 'get_metrics':
      return getMetrics();
    default:
      throw new Error(`Unknown tool: ${tool}`);
  }
}

export const GET: APIRoute = async ({ url }) => {
  const tool = url.searchParams.get('tool');

  // Discovery (no tool param) - zwraca opis i listę tools
  if (!tool) {
    return jsonResponse({
      server: 'portfolio-mcp',
      description: 'Read-only MCP-like endpoint over portfolio content.',
      transport: 'http',
      tools: TOOLS,
      usage: {
        http: '/mcp?tool=<name>&<arg>=<value>',
        post: 'POST /mcp { "method": "tools/call", "params": { "name": "...", "arguments": {...} } }',
      },
    });
  }

  // Parse args from query params
  const args: Record<string, unknown> = {};
  url.searchParams.forEach((v, k) => {
    if (k === 'tool') return;
    if (k === 'limit') args[k] = Number(v);
    else args[k] = v;
  });

  try {
    return jsonResponse(await dispatch(tool, args));
  } catch (err) {
    return jsonResponse({ error: (err as Error).message }, 400);
  }
};

export const POST: APIRoute = async ({ request }) => {
  let body: { method?: string; params?: { name?: string; arguments?: Record<string, unknown> } };
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400);
  }

  if (body.method !== 'tools/call' || !body.params?.name) {
    return jsonResponse(
      { error: 'Expected JSON-RPC: { method: "tools/call", params: { name, arguments } }' },
      400,
    );
  }

  try {
    return jsonResponse(await dispatch(body.params.name, body.params.arguments ?? {}));
  } catch (err) {
    return jsonResponse({ error: (err as Error).message }, 400);
  }
};
