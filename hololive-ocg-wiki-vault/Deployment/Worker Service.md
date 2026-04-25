# Worker Service

The API is powered by a Cloudflare Worker deployed as a **service binding** to Cloudflare Pages.

## Configuration

### `wrangler.service.toml`

Worker service configuration file. Key settings:

- **name:** `hololive-ocg-api`
- **main:** `worker.ts`
- **D1 binding:** `DB` → `hololive-ocg-db`
- **workers_dev:** `false` (not publicly accessible; only via service binding)

### `functions/api/[[path]].ts`

Pages function that catches all `/api/*` routes and forwards them to the bound worker:

```typescript
export const onRequest: PagesFunction<{ API: Fetcher }> = async (context) => {
  return context.env.API.fetch(context.request);
};
```

## Deployment

```bash
cd cloudflare
wrangler deploy --config wrangler.service.toml
```

> **Important:** Use `--config wrangler.service.toml` — the default `wrangler.toml` is for Pages, not the worker service.

## Worker Logic (`worker.ts`)

The worker handles:

- `GET /api/cards/search` — Full-text search with FTS5 fallback to LIKE
- `GET /api/cards/filter` — Multi-criteria filter with pagination
- `GET /api/cards/:id` — Card detail with all translations, arts, skills, Q&A
- `GET /api/filter-options` — Dynamic filter options per locale
- `GET /api/static-filters` — Static filter values (colors, types, rarities)

### Edge Caching

All read endpoints use the **Cloudflare Cache API** (`caches.default`) to cache responses at the edge, keyed by the full request URL. This eliminates repeated D1 reads for identical requests.

| Endpoint              | TTL    | Rationale                                     |
| --------------------- | ------ | --------------------------------------------- |
| `/api/filter-options` | 30 min | Changes only on weekly card data updates      |
| `/api/static-filters` | 30 min | Same — types, rarities, colors rarely change  |
| `/api/cards/filter`   | 5 min  | Repeated filter states (navigation, debounce) |
| `/api/cards/search`   | 5 min  | Same search query repeated via debounce       |

Cache is stored with `Cache-Control: public, max-age=<TTL>` and written via `ctx.waitUntil(cache.put(...))` so the first request is not blocked.

> **Note:** `caches.default` is a no-op in local `wrangler dev` — caching only activates on Cloudflare's edge in production.

### Skip COUNT optimisation

`/api/cards/filter` accepts a `skip_count=true` query parameter. When set, the `SELECT COUNT(DISTINCT c.id)` full-table-scan query is skipped and `total: -1` is returned. The frontend (`useCardStoreAPI.ts`) passes this on page 2+ and retains the total from page 1, halving D1 row reads for paginated/infinite-scroll usage.

### Key Constants

- **DEFAULT_LOCALE:** `"tc"` (Traditional Chinese)
- **Allowed locales:** `tc`, `sc`, `ja`, `en`, `id`, `ko`, `th`, `es`

### Locale Validation

```typescript
function validateLocale(locale: string | null): string {
  const allowedLocales = ["tc", "sc", "ja", "en", "id", "ko", "th", "es"];
  return locale && allowedLocales.includes(locale) ? locale : DEFAULT_LOCALE;
}
```

If an invalid locale is provided, it falls back to `tc`.

## Debugging

```bash
# Watch live logs
wrangler tail hololive-ocg-api

# Test locally
cd cloudflare && npx wrangler dev --config wrangler.service.toml --port 8787
curl "http://localhost:8787/api/cards/filter?locale=en&limit=5"
```

## Related

- [[Deploy to Production]] — Full deployment workflow
- [[API/API Documentation|API Documentation]] — Complete endpoint reference
- [[Architecture/Overview|Architecture Overview]] — How Pages + Worker fit together
