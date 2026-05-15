# Changelog

## [Unreleased] - 2026-05-15

### Added

- 10 dodatkowych AI crawler User-Agents w `robots.txt` template
  (OAI-SearchBot, Bytespider, Amazonbot, DuckAssistBot, YouBot,
  cohere-ai, Diffbot, anthropic-ai legacy, FacebookExternalHit,
  Meta-ExternalAgent) z 1-linijkowymi komentarzami PO polsku.
- `endpoints/well-known-llms.txt.ts.example` - minimal Astro endpoint
  re-eksportujący GET handler z `/llms.txt`, aliasujący treść pod
  `/.well-known/llms.txt`.
- Sekcja "Tier 0.5 - cheap insurance" w README opisująca
  `.well-known/llms.txt` jako 5-minutowy must-have dla MCP discovery.
- Wpis o nowym endpoint w tabeli "Co jest w środku i po co" w README.
- Pułapka #10 (auto-stamp `Last updated` z build date, nigdy manualnie)
  i pułapka #11 (per-domain `Sitemap:` w robots.txt dla dual-domain
  setupów - inaczej GSC zaraportuje "URL submitted is not on this site").
- Verification smoke test dla 6 mniejszych botów + diff-check dla
  `/llms.txt` vs `/.well-known/llms.txt`.

### Source

Lessons learned z auditu portfolio.sdet.it / portfolio.sdet.pl
(`sdet-brand-drafts/2026-05-15-seo-crawler-audit-report.md`) oraz
implementacji small-bots + `.well-known/llms.txt` w portfolio-v2
(commits `fbc64f3`, `b2de642`, `a8f6c3e` on `darco81/portfolio-v2`,
deployed 2026-05-15).

Sprint 1 portfolio-v2 (P0/P1 sitemap cross-domain hreflang fixes) jest
specyficzny dla bilingual dual-domain setupu i NIE jest tu propagowany -
pułapka #11 dokumentuje samą obserwację, fix zostaje w referencyjnym
repo.
