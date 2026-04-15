# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Cloudflare Edge                       │
│                                                         │
│  ┌─────────────────────┐    ┌───────────────────────┐   │
│  │   Cloudflare Pages  │    │   Cloudflare Worker   │   │
│  │  (hololive-ocg-wiki)│───▶│  (hololive-ocg-api)   │   │
│  │                     │    │                       │   │
│  │  - Nuxt 3 SPA       │    │  - REST API           │   │
│  │  - Static assets     │    │  - FTS5 search        │   │
│  │  - Pages Functions   │    │  - Filter/pagination  │   │
│  └─────────────────────┘    └───────────┬───────────┘   │
│                                         │               │
│                              ┌──────────▼──────────┐    │
│                              │   Cloudflare D1     │    │
│                              │  (hololive-ocg-db)  │    │
│                              │                     │    │
│                              │  - SQLite-based     │    │
│                              │  - Normalized schema│    │
│                              │  - FTS5 virtual tbl │    │
│                              └─────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## Request Flow

1. Browser requests `https://hololive-ocg-wiki.lichingchester.dev`
2. **Cloudflare Pages** serves the Nuxt 3 SPA (static HTML/JS/CSS)
3. Frontend makes API calls to `/api/*` (same domain, relative URLs)
4. **Pages Function** (`functions/api/[[path]].ts`) catches the request
5. Function forwards via **service binding**: `env.API.fetch(request)`
6. **Worker** (`worker.ts`) processes the query against D1
7. Response flows back through the same chain

## Frontend Architecture

### Nuxt 3 + Vue 3 Composition API

- **SSR disabled** (`ssr: false`) — runs as SPA
- **Multi-language** via `@nuxtjs/i18n` — 7 locales: tc, ja, en, id, ko, th, es
- **UI framework:** Shadcn-vue components built on Reka UI primitives
- **State management:** `useState()` composables (no Pinia/Vuex)

### Key Component Structure

```
components/
├── card-list/          # Card display (CardListView, CardListViewAPI)
├── cards/              # Individual card components
├── detail-page/        # Card detail view
├── filter/             # Search & filter UI (Filter, FilterAPI)
├── ui/                 # Shadcn-vue base components
└── ...

composables/
├── useCardStore.ts     # Client-side filtering (local JSON)
├── useCardStoreAPI.ts  # Server-side filtering (API calls)
├── filter-states.ts    # UI filter state management
├── decks-states.ts     # Deck builder state
└── useTranslation.ts   # Translation helpers
```

### Data Loading Strategies

Two parallel strategies exist:

| Strategy    | Composable          | Data Source | Use Case             |
| ----------- | ------------------- | ----------- | -------------------- |
| Client-side | `useCardStore()`    | Local JSON  | Offline/fallback     |
| API-based   | `useCardStoreAPI()` | Worker API  | Production (primary) |

### Filter Flow

1. User interacts with filter UI → `composables/filter-states.ts` updates
2. `useCardStoreAPI()` debounces (300ms) and calls `/api/cards/filter`
3. Worker queries D1 with filters, returns paginated results
4. Component renders card list

## Backend Architecture

### Cloudflare Stack

| Component        | Service Name        | Config File                        |
| ---------------- | ------------------- | ---------------------------------- |
| Pages (frontend) | `hololive-ocg-wiki` | `cloudflare/wrangler.toml`         |
| Worker (API)     | `hololive-ocg-api`  | `cloudflare/wrangler.service.toml` |
| Database         | `hololive-ocg-db`   | D1 binding in both configs         |

### Database Schema

Normalized across multiple tables:

- `cards` → `card_translations` (1:N per locale)
- `cards` → `arts` → `art_translations` (1:N:N)
- `cards` → `oshi_skills` (1:N)
- `cards` → `keywords` → `keyword_translations` (1:N:N)
- `cards` → `qa_items` (1:N)
- `cards_fts` (FTS5 virtual table for search)

### Performance Features

- **FTS5 search** — 10x faster than LIKE, with relevance ranking
- **Database indexes** on frequently filtered columns
- **Debounced API calls** (300ms) to reduce load
- **Pagination** with LIMIT/OFFSET
- **Edge computing** — Worker runs close to user globally

## File Organization

```
/
├── pages/              # Nuxt pages (index, deck, how-to-use)
├── components/         # Vue components
├── composables/        # Shared state & API logic
├── types/              # TypeScript interfaces
├── i18n/locales/       # UI translations (tc, ja, en, id, ko, th, es)
├── data/               # Card data JSON
├── assets/css/         # Tailwind + app styles
├── cloudflare/
│   ├── worker.ts       # API logic
│   ├── schema.sql      # Database schema
│   ├── migrate.js      # Migration generator
│   ├── functions/api/  # Pages function proxy
│   └── migrations/     # Generated batch SQL files
└── public/             # Static assets (images, icons)
```

## Related

- [[Deployment/Deploy to Production|Deploy to Production]] — Deployment workflow
- [[Deployment/Worker Service|Worker Service]] — Worker details
- [[Database/Schema & Migrations|Schema & Migrations]] — Database schema
- [[API/API Documentation|API Documentation]] — Endpoint reference
