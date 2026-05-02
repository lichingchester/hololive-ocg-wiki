# AI Coding Agent Instructions for Hololive OCG Wiki

## Project Overview

Hololive OCG Wiki is a fan-made web application for the Hololive Official Card Game. It's built with **Nuxt 3** + **Vue 3 Composition API** with a **Cloudflare D1 + Worker** backend for API services.

## Architecture & Key Components

### Frontend Structure (Nuxt 3)

- **SSR disabled** (`ssr: false`) - runs as SPA
- **Multi-language support** via `@nuxtjs/i18n` (tc/ja/en/id/ko/th locales)
- **Shadcn-vue UI components** in `components/ui/` using Reka UI primitives
- **State management** via Nuxt's `useState()` composables (no Pinia/Vuex)
- **Two data loading strategies**:
  - `useCardStore()` - client-side with local JSON file
  - `useCardStoreAPI()` - server-side via Cloudflare Worker API

### Backend Architecture (Cloudflare)

- **Worker API** (`cloudflare/worker.ts`) - TypeScript edge functions
- **D1 Database** - SQLite-based with normalized schema
- **Schema**: `cards` + `card_translations` + related tables (arts, skills, etc.)
- **Full-text search** via optional FTS tables with fallback to LIKE queries
- **Migration system**: Batched SQL execution due to D1 query limits
- **Data flow**: JSON → `migrate.js` → batched SQL files → D1 execution

## Development Workflows

### Local Development

```bash
# Frontend (port 3000)
npm run dev

# Backend API (separate terminal in cloudflare/)
npx wrangler dev

# Monitor worker logs
npx wrangler tail
```

### Key Environment Setup

- **Node.js ≥22** required
- **Frontend config**: Uses relative URLs for API calls (same-origin requests)
- **Backend config**: Copy `wrangler.toml.example` → `wrangler.toml` with D1 credentials
- **Environment variables**: `NUXT_PUBLIC_API_URL` no longer needed (API on same domain)

### Database Management

- **Migration workflow**: Update `data/cards_i18n.json` → run `node cloudflare/migrate.js` → execute migration batches
- **FTS setup**: Run `./cloudflare/setup-fts.sh` for 10x faster search performance
- **Database debugging**: Use `wrangler d1 execute` for direct SQL queries

## Critical Patterns & Conventions

### Data Flow Architecture

1. **Filter State**: `composables/filter-states.ts` manages UI filter selections
2. **Card Stores**: Two composables for different data sources:
   - `useCardStore()` - client-side filtering with Fuse.js search
   - `useCardStoreAPI()` - API calls with caching and pagination
3. **Component Communication**: Props down, events up + shared state via composables

### Component Structure

- **Card List Views**: `CardListView.vue` (local) vs `CardListViewAPI.vue` (API-based)
- **Filter Components**: `Filter.vue` + `FilterAPI.vue` with debounced API calls
- **UI Components**: Shadcn-vue pattern with `cn()` utility for conditional classes
- **i18n**: Use `$t()` in templates, `useI18n()` in script setup

### API Integration Patterns

```typescript
// API calls use this pattern:
const response = await apiCall<FilterResponse>("/api/cards/filter", {
  locale,
  search: "query",
  colors: ["red", "blue"],
});
```

### Database Query Optimization

- **Use indexes**: `idx_cards_card_type`, `idx_cards_color_codes`, etc.
- **JSON field searches**: Use `LIKE '%"value"%'` for JSON array matching
- **FTS fallback**: Worker tries FTS first, falls back to LIKE queries
- **API responses should be <500ms** - current 2.4s indicates optimization needed
- **FTS benefits**: 10x faster searches, relevance ranking, multi-language support
- **FTS maintenance**: Auto-sync via triggers, manual rebuild with `setup-fts.sh`

## Performance Considerations

### Frontend

- **Component lazy loading** - Nuxt auto-generates `Lazy*` components
- **Virtual scrolling** available via `CardListViewVirtualScroller.vue`
- **Debounced filters** (300ms) to reduce API calls
- **State caching** in composables to avoid re-computation

### Backend/Database

- **Add missing indexes** for frequently filtered fields
- **Use LIMIT/OFFSET** for pagination
- **Cache API responses** in Workers KV for production
- **Optimize JSON field queries** - consider separate normalized tables for performance

## File Organization

### Key Directories

- `components/card-list/` - Card display components
- `components/filter/` - Search and filter UI
- `components/ui/` - Shadcn-vue base components
- `composables/` - Shared state and API logic
- `types/` - TypeScript interfaces
- `cloudflare/` - Worker API and database schema

### Data Files

- `data/cards_i18n.json` - Main card data with translations
- `i18n/locales/*.json` - UI text translations

## Common Tasks

### Adding New Filters

1. Update `types/filter.ts` interface
2. Modify `composables/filter-states.ts` for state management
3. Add UI components in `components/filter/`
4. Update both `useCardStore()` and `useCardStoreAPI()` filtering logic
5. Add corresponding API endpoint parameters in `worker.ts`

### Database Operations

### Database Operations

- **Schema updates**: `cd cloudflare && npx wrangler d1 execute hololive-ocg-db --local --file=./schema.sql`
- **Data re-migration**: After schema changes, run `node migrate.js` then execute `migration.sql`
- **Migration batches**: Use `./run-migration.sh` for production deployments
- **FTS setup**: `./setup-fts.sh hololive-ocg-db` for optimal search performance
- **Testing queries**: `wrangler d1 execute DB_NAME --command="SELECT..."`
- **View logs**: `wrangler tail` for real-time Worker debugging

### Worker API Testing

- **Local worker runs automatically** - no need to manually start `npx wrangler dev`
- **Test API directly**: Use curl commands against `http://localhost:8787`
- **Example**: `curl "http://localhost:8787/api/cards/filter?locale=en&limit=10"`

### Performance Debugging

- Use `console.time()` in Worker for query timing
- Check `.nuxt/analyze` for bundle size analysis
- Monitor filter cache hit rates in browser dev tools
- Test API endpoints with curl for response times

### Database Schema Changes

1. Update `cloudflare/schema.sql`
2. Create migration in `cloudflare/migrations/`
3. Update TypeScript types in `types/card.ts`
4. Modify Worker response formatting

This project emphasizes **multilingual support**, **performance optimization**, and **dual data strategies** (local vs API) for flexibility.

## General Guidelines

- When making code updates, suggest the git commit message for the updates too.
