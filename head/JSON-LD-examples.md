# JSON-LD examples - gotowce do wklejenia

Schema.org structured data. Google używa do rich results + AI Overview source-list.

**Walidator:** https://validator.schema.org/

---

## 1. WebSite (każda strona)

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "url": "https://twoj-portfolio.pl",
  "name": "Imię Nazwisko",
  "description": "Krótki opis brandu",
  "inLanguage": "pl",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://twoj-portfolio.pl/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

`potentialAction` opcjonalne - daje sitelinks search box w Google jeśli zasłużysz.

---

## 2. Person (about page + home)

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Imię Nazwisko",
  "jobTitle": "Senior SDET / AI Engineer",
  "url": "https://twoj-portfolio.pl",
  "image": "https://twoj-portfolio.pl/avatar.jpg",
  "email": "mailto:mail@domena.pl",
  "sameAs": [
    "https://www.linkedin.com/in/...",
    "https://github.com/...",
    "https://x.com/..."
  ],
  "knowsAbout": [
    "Software testing",
    "Test automation",
    "Playwright",
    "AI engineering"
  ],
  "description": "15+ lat w IT. Builds AI-powered systems for software testing."
}
```

`sameAs` to KLUCZ - Google łączy profile (entity disambiguation). Bez tego nie wiedzą czy ty to ty czy inny "Jan Kowalski".

`knowsAbout` → AI Overview wybiera relewantnych ekspertów per tag.

---

## 3. Article (każdy artykuł blog/portfolio)

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Tytuł artykułu",
  "description": "Krótki opis (meta description)",
  "image": "https://twoj-portfolio.pl/og/articles/slug-pl.png",
  "author": {
    "@type": "Person",
    "name": "Imię Nazwisko",
    "url": "https://twoj-portfolio.pl"
  },
  "publisher": {
    "@type": "Person",
    "name": "Imię Nazwisko",
    "url": "https://twoj-portfolio.pl"
  },
  "datePublished": "2026-04-15T10:00:00.000Z",
  "dateModified": "2026-04-20T15:30:00.000Z",
  "mainEntityOfPage": "https://twoj-portfolio.pl/articles/slug",
  "keywords": "playwright, testing, automation",
  "inLanguage": "pl"
}
```

Pamiętaj: `headline` musi być =< 110 znaków. Powyżej Google ignoruje.

---

## 4. BreadcrumbList (każda strona z URL deeper niż /)

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://twoj-portfolio.pl/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Articles",
      "item": "https://twoj-portfolio.pl/articles"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Tytuł artykułu",
      "item": "https://twoj-portfolio.pl/articles/slug"
    }
  ]
}
```

Google pokazuje ścieżkę URL w SERP zamiast surowego linka → wyższy CTR.

---

## 5. FAQPage (jeśli masz sekcję FAQ)

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Z jakich technologii korzystasz?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Astro, TypeScript, Tailwind, Playwright. Backend: Node, Python."
      }
    },
    {
      "@type": "Question",
      "name": "Jak długo trwa typowy projekt?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Od 2 tygodni (audit) do 3 miesięcy (full implementation)."
      }
    }
  ]
}
```

UWAGA 2024+: Google ograniczył FAQ rich results do gov/health sites. Ale wciąż AI Overview używa.

---

## 6. SoftwareSourceCode (per-projekt na /projects)

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Nazwa projektu",
  "description": "Krótki opis",
  "codeRepository": "https://github.com/user/repo",
  "programmingLanguage": ["TypeScript", "Python"],
  "license": "https://opensource.org/licenses/MIT",
  "author": {
    "@type": "Person",
    "name": "Imię Nazwisko",
    "url": "https://twoj-portfolio.pl"
  }
}
```

---

## 7. ProfilePage (about page wrapper)

```json
{
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "mainEntity": {
    "@type": "Person",
    "name": "Imię Nazwisko",
    "jobTitle": "Senior SDET",
    "sameAs": ["https://linkedin.com/in/...", "https://github.com/..."]
  },
  "dateCreated": "2026-04-15",
  "dateModified": "2026-05-04"
}
```

---

## 8. Organization (jeśli masz firmę/marka)

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "SDET Brand",
  "url": "https://sdet.it",
  "logo": "https://sdet.it/logo.png",
  "founder": {
    "@type": "Person",
    "name": "Imię Nazwisko"
  },
  "sameAs": [
    "https://linkedin.com/company/...",
    "https://github.com/orgs/..."
  ]
}
```

---

## Praktyczne reguły

1. **Jedna strona = wiele schemas dozwolone** - wklej kilka `<script type="application/ld+json">`. Google parsuje wszystkie.
2. **`@id` dla cross-referencji** - Person na Article może być `{"@id": "https://domena.pl/#person"}` i osobny pełny Person object pod tym `@id`. Eliminuje duplikację.
3. **Daty zawsze ISO 8601** - `2026-05-04T10:00:00.000Z`, nie `2026-05-04` (lub gorzej `04/05/2026`).
4. **URL-e absolute** - wszystkie `url` / `image` / `mainEntityOfPage` z `https://...`.
5. **Test po deploy** - https://search.google.com/test/rich-results - wkleisz URL, dostaniesz listę errors/warnings.
6. **GSC → Enhancement reports** - po 1-2 tygodniach Google pokaże ile rich results ma activate'd.
