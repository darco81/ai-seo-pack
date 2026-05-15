# AI-SEO Pack - kompletny zestaw "AI-friendly portfolio"

Zestaw plików i wzorców, które pozycjonują portfolio nie tylko dla Google,
ale też dla LLM-ów (ChatGPT, Claude, Perplexity, Gemini, AI Overview).

Stack referencyjny: **Astro 5 + TypeScript + content collections (Zod)**.
Większość rzeczy działa też w Next.js / Nuxt - komentarze wskazują co
podstawić.

---

## Co jest w środku i po co

| Plik                              | Rola                                                         | Po co to                                                                                                                |
| --------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `robots.txt`                      | Static plik w `public/`                                      | Explicit allow-list dla AI crawlerów (GPTBot, ClaudeBot, PerplexityBot…). Domyślnie wielu nie ma w Disallow, ale **explicit Allow** to silny sygnał. |
| `endpoints/llms.txt.ts`           | Endpoint `/llms.txt` (llmstxt.org standard 2025)             | LLM-y po niego sięgają zamiast crawlować HTML. Lista artykułów + linki do canonical.                                   |
| `endpoints/llms-full.txt.ts`      | Endpoint `/llms-full.txt`                                    | Pełny dump treści w plain text → RAG-ready. Jeden fetch i AI ma cały portfolio.                                        |
| `endpoints/mcp.ts`                | Endpoint `/mcp` (HTTP JSON-RPC, simplified)                  | Claude Desktop / Cursor / inne MCP clients podłączą portfolio jako "knowledge source". Read-only tools.                |
| `endpoints/rss.xml.ts`            | Endpoint `/rss.xml`                                          | Klasyk, ale agregatory (Feedly, NetNewsWire, AI news bots) wciąż konsumują.                                            |
| `endpoints/og-default.png.ts`     | Endpoint `/og-default.png`                                   | Build-time generated OG image (1200×630) jako fallback dla pages bez własnego OG.                                       |
| `endpoints/og-per-slug.ts`        | Endpoint `/og/[...slug].png`                                 | Per-artykuł OG image (title + series badge + reading time). Silnie zwiększa CTR z LinkedIn / Twittera.                  |
| `head/BaseHead.astro`             | Komponent `<head>` z pełnym kompletem meta                  | Canonical, hreflang, OG, Twitter Card, JSON-LD (WebSite + Article + Person), `<link rel="llm">`.                       |
| `head/JSON-LD-examples.md`        | Snippet'y JSON-LD do wklejenia                               | Article / Person / Organization / FAQPage / BreadcrumbList. Google bierze to do rich results + AI Overview.            |
| `config/astro.config.snippet.ts`  | Fragment `astro.config.ts`                                   | Sitemap integration z i18n (hreflang per URL), filter excluding `/mcp` / `/api/`.                                       |
| `endpoints/well-known-llms.txt.ts.example` | Endpoint `/.well-known/llms.txt`                  | Alias do `/llms.txt`. Niektóre MCP-aware tools (Cursor, Continue, custom agents) sprawdzają `.well-known/` jako pierwsze (RFC 8615). Cheap insurance, ~5 min implementacji. |

---

## Kolejność wdrożenia (od najtańszego do najbardziej zaawansowanego)

### Tier 0 - must-have, 30 min roboty

1. **`robots.txt`** → wrzuć do `public/` i podmień domenę w `Sitemap:`.
2. **Sitemap** (`@astrojs/sitemap` integration) - patrz `config/astro.config.snippet.ts`.
3. **`BaseHead.astro`** w każdej stronie (canonical + OG + Twitter Card + JSON-LD WebSite).
4. **GSC + Bing Webmaster** - submituj sitemap.

### Tier 0.5 - cheap insurance, 5 min

4a. **`/.well-known/llms.txt`** - alias/redirect do `/llms.txt`. Niektóre
    MCP-aware tools (Cursor, Continue, custom agents) sprawdzają
    `.well-known/` jako pierwsze (RFC 8615) zanim spadną na root.
    Snippet: `endpoints/well-known-llms.txt.ts.example`.

### Tier 1 - wyróżnia portfolio od reszty, 2-4h

5. **`/llms.txt`** + **`/llms-full.txt`** - endpoint y zwracające plain text.
6. **OG images** - per-artykuł generowany build-time (Astro + satori w `@lib/og`).
7. **JSON-LD Article schema** - w każdym MDX layoucie (patrz przykład w `head/JSON-LD-examples.md`).

### Tier 2 - manifestacja "AI-native portfolio"

8. **`/mcp` endpoint** - Claude Desktop / Cursor podpinają jako data source.
9. **`<link rel="llm">`** w `<head>` - niestandardowe, ale wskazuje agentom gdzie jest llms.txt.
10. **`/rss.xml`** - klasyk dla agregatorów + Telegram/Slack RSS bots.

---

## Założenia configu (do podstawienia)

W Astro referencyjnym jest plik `src/config/site.ts` ze strukturą `SITE` -
w plikach poniżej zobaczysz `SITE.url`, `SITE.author.name` etc. Twój kolega
musi mieć podobny config lub zhardkodować wartości. Minimum:

```ts
// src/config/site.ts
export const SITE = {
  url: 'https://twoj-portfolio.pl',
  defaultLang: 'pl' as const,
  brand: {
    name: 'Imię Nazwisko',
    tagline: { en: 'Tagline', pl: 'Hasło przewodnie' },
    headline: { en: 'Headline', pl: 'Główne hasło' },
  },
  author: {
    name: 'Imię Nazwisko',
    email: 'mail@domena.pl',
    jobTitle: { en: 'Job title', pl: 'Stanowisko' },
  },
  social: {
    linkedin: 'https://linkedin.com/in/...',
    github: 'https://github.com/...',
  },
  description: { en: 'EN description', pl: 'PL description' },
  ogImage: { width: 1200, height: 630 },
  features: { rss: true },
};
```

---

## Zasady-kluczowe (pułapki)

1. **Canonical zawsze absolute URL** - `https://...`, nie `/path`. Inaczej Google interpretuje per-domena.
2. **hreflang dwukierunkowy** - jeśli EN page wskazuje na PL alternate, to PL page MUSI wskazywać EN z powrotem. Inaczej Google ignoruje.
3. **`x-default`** - wskazuje wersję default dla nieokreślonego locale (zwykle EN).
4. **JSON-LD `inLanguage`** - kod lang per artykuł (`en`, `pl`, nie `en-US`).
5. **OG images musi być absolute URL** w meta tagu - LinkedIn / Twitter parsuje meta przed renderingiem strony.
6. **`Cache-Control: public, max-age=...`** na endpoint'ach `/llms*` i `/mcp` - żeby nie zarżnęły serwera przy crawl-spike.
7. **`/mcp` i `/api/*`** muszą być w `robots.txt` Disallow + sitemap filter - nie chcesz indeksować RPC endpoint'ów.
8. **GSC URL Inspection → Request Indexing** - po pierwszym deploy ręcznie poproś o indeksację top 5-10 URLi (homepage + flagship artykuły). Bez tego Google leci 3-7 dni naturalnym crawlem.
9. **AI crawler caching** - niektóre boty (PerplexityBot) cache'ują content na 7-14 dni. Update llms-full.txt build-time, nie SSR per-request.
10. **`/llms.txt` "Last updated" auto-stamp** - zawsze stampuj z build date (`new Date().toISOString().slice(0,10)` w SSG-baked endpoint'cie), nigdy manualnie. Manual data driftuje przy każdym deployu, sygnalizuje stale content. PerplexityBot cache'uje 7-14 dni - świeży `Last updated` zachęca do re-fetch.
11. **Per-domain `Sitemap:` URL w robots.txt dla dual-domain** - jeśli serwujesz portfolio na 2 domenach (np. `.pl` + `.com`), static `Sitemap: https://only-one-domain/...` w `public/robots.txt` zawiedzie: jedna domena dostanie cross-domain URL, GSC zaraportuje "URL submitted is not on this site." Fix: konwersja `public/robots.txt` → dynamiczny `src/pages/robots.txt.ts` używający `SITE.url` per build.

---

## Verification po deployu

```bash
# robots
curl -s https://domena.pl/robots.txt | head -20

# llms.txt format check
curl -s https://domena.pl/llms.txt | head -30

# Sitemap valid?
curl -s https://domena.pl/sitemap-index.xml | xmllint --format -

# OG meta scrape
curl -s https://domena.pl/ | grep -E 'og:|twitter:|canonical|hreflang' | head -20

# JSON-LD valid?
curl -s https://domena.pl/ | grep -A 30 'application/ld+json'
# → wklej JSON do https://validator.schema.org/

# MCP smoke test
curl -s https://domena.pl/mcp | jq .
curl -s 'https://domena.pl/mcp?tool=list_articles&language=pl' | jq .

# Mniejsze AI boty dostają 200 (nie 403/blocked)
for UA in "Bytespider/1.0" "Amazonbot/0.1" "OAI-SearchBot/1.0" \
          "DuckAssistBot/1.0" "Meta-ExternalAgent/1.1" \
          "FacebookExternalHit/1.1"; do
  curl -A "$UA" -s -o /dev/null -w "$UA -> %{http_code}\n" \
    https://domena.pl/
done

# /llms.txt + /.well-known/llms.txt servuja identyczny content
curl -s https://domena.pl/llms.txt -o /tmp/a.txt
curl -s https://domena.pl/.well-known/llms.txt -o /tmp/b.txt
diff /tmp/a.txt /tmp/b.txt && echo "OK: identical content"
```

External tools:
- https://validator.schema.org/ - JSON-LD
- https://www.opengraph.xyz/ - OG preview na FB/LinkedIn/Twitter
- https://search.google.com/test/rich-results - Google rich results
- https://www.google.com/ping?sitemap=https://domena.pl/sitemap-index.xml - submit sitemap (dziś już deprecated, ale GSC ręcznie też)

---

## Dlaczego "AI-friendly" matters w 2026

- **Google AI Overview** - odpowiada przed kliknięciem. Bez JSON-LD nie wejdziesz do source-list.
- **ChatGPT Browse / Search** - bot crawluje, przygotowuje summary. Bez `llms.txt` bierze losowe strony.
- **Claude Desktop + MCP** - user może podpiąć portfolio jako knowledge source. Bez `/mcp` jesteś niewidzialny.
- **Perplexity citation** - cytuje portfolio jako źródło → brand authority.
- **LinkedIn share previews** - bez per-artykuł OG image post wygląda mdło → CTR na portfolio spada.

To nie jest "więcej SEO". To **distribution layer** - portfolio jako data source dla AI.

---

## Licencja / atrybucja

Te wzorce są generyczne - używaj swobodnie. Komentarze "Per US-XX" / "T66" /
"Faza X" w plikach to references do wewnętrznej dokumentacji projektu źródłowego;
można usunąć.
