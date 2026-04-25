# Deploy to Production

Complete deployment workflow for the Cloudflare Pages + Worker Service Binding architecture.

## Architecture

```
Browser → Cloudflare Pages (frontend)
              ↓ /api/* requests
         Service Binding (env.API.fetch)
              ↓
         Cloudflare Worker (hololive-ocg-api)
              ↓
         D1 Database (hololive-ocg-db)
```

- **Pages project:** `hololive-ocg-wiki`
- **Worker service:** `hololive-ocg-api`
- **Database:** `hololive-ocg-db`
- **Domain:** `https://hololive-ocg-wiki.lichingchester.dev`

## Deployment Steps

### 1. Deploy Worker Service

```bash
cd cloudflare
wrangler deploy --config wrangler.service.toml
```

> Always deploy the worker **before** Pages if both have changes.

### 2. Build and Deploy Pages

```bash
# From project root
npm run generate

cd cloudflare

# Preview deployment
npx wrangler pages deploy ../.output/public --project-name=hololive-ocg-wiki

# Production deployment
npx wrangler pages deploy ../.output/public --project-name=hololive-ocg-wiki --branch main
```

### 3. Verify

```bash
DOMAIN="https://hololive-ocg-wiki.lichingchester.dev"

# Test API
curl "$DOMAIN/api/cards/filter?locale=en&limit=5"

# Test search
curl "$DOMAIN/api/cards/search?q=marine&locale=en"

# Test card details
curl "$DOMAIN/api/cards/[CARD_ID]?locale=en"

# Test filter options
curl "$DOMAIN/api/filter-options?locale=en"
```

## Production Checklist

- [ ] Worker service deployed successfully
- [ ] Pages deployed with correct service binding
- [ ] Database schema and migrations applied
- [ ] FTS rebuilt after migration (`./setup-fts.sh --remote hololive-ocg-db`)
- [ ] API endpoints responding correctly
- [ ] Frontend loads and functions properly
- [ ] All locales working (tc, ja, en, id, ko, th, es)
- [ ] Search functionality operational
- [ ] No console errors in browser

## Environment Variables

### Production (Pages)

```
NUXT_PUBLIC_API_URL = ""  # Empty = relative URLs (same domain)
```

### Development

```
NUXT_PUBLIC_API_URL = "http://localhost:8787"
```

## Service Binding Configuration

Pages function at `functions/api/[[path]].ts` proxies all `/api/*` requests to the bound worker:

```typescript
env.API.fetch(request);
```

Configured via Cloudflare Dashboard:

- **Workers & Pages → hololive-ocg-wiki → Settings → Functions**
- Service Binding: `API` → `hololive-ocg-api`
- D1 Binding: `DB` → `hololive-ocg-db`

## Benefits

- **Same domain** — No CORS configuration needed
- **Lower latency** — Internal service calls, no public internet round-trips
- **Simplified URLs** — API at `/api/*` instead of separate domain
- **Unified security** — Single domain for all security headers and policies

## Monitoring

```bash
# Pages function logs
wrangler pages deployment tail

# Worker service logs
wrangler tail hololive-ocg-api

# Cloudflare Analytics for performance metrics
```

## Rollback

If deployment fails:

1. Redeploy previous worker version:
   ```bash
   cd cloudflare && wrangler rollback --config wrangler.service.toml
   ```
2. Redeploy previous Pages build from Cloudflare Dashboard.

## Related

- [[Worker Service]] — Worker-specific configuration
- [[Development/Commands|Commands]] — All deployment commands
- [[Architecture/Overview|Architecture Overview]] — Full architecture details
