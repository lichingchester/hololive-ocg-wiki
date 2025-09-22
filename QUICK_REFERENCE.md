# Quick Reference: Pages + Service Binding Commands

## Development

```bash
# Start local development (both worker and frontend)
./dev-local.sh

# Start worker only (API development)
cd cloudflare && npx wrangler dev --config wrangler.service.toml --port 8787

# Start frontend only
export NUXT_PUBLIC_API_URL="http://localhost:8787"
npm run dev
```

## Deployment

```bash
# Full deployment (recommended)
./deploy-pages.sh

# Manual deployment
# 1. Deploy worker service
cd cloudflare && wrangler deploy --config wrangler.service.toml --env production

# 2. Build and deploy Pages
npm run generate
cd cloudflare && wrangler pages deploy ../.output/public --project-name=hololive-ocg-wiki

# 3. Configure service bindings via Cloudflare Dashboard:
#    - Go to Workers & Pages > hololive-ocg-wiki > Settings > Functions
#    - Add Service Binding: API -> hololive-ocg-api-service
#    - Add D1 Binding: DB -> hololive-ocg-db
```

## Database Operations

```bash
# Create database (first time only)
cd cloudflare && wrangler d1 create hololive-ocg-db

# Set up schema
wrangler d1 execute hololive-ocg-db --file=./schema.sql

# Run migrations
node migrate.js
for file in migrations/migration_batch_*.sql; do
  wrangler d1 execute hololive-ocg-db --file="$file"
done

# Query database
wrangler d1 execute hololive-ocg-db --command="SELECT COUNT(*) FROM cards;"
```

## Monitoring & Debugging

```bash
# Watch Pages function logs
wrangler pages deployment tail

# Watch worker service logs
wrangler tail hololive-ocg-api-service

# Test API endpoints
curl "https://hololive-ocg-wiki.lichingchester.dev/api/cards/filter?locale=en&limit=5"
```

## Configuration Files

- `cloudflare/wrangler.service.toml` - Worker service config
- `cloudflare/wrangler.pages.toml` - Pages + service binding config
- `functions/api/[[path]].ts` - Pages function for API routing
- `nuxt.config.ts` - Updated for relative API URLs

## Environment Variables

**Production**: `NUXT_PUBLIC_API_URL=""` (relative URLs)
**Development**: `NUXT_PUBLIC_API_URL="http://localhost:8787"`

## URLs

**Frontend**: `https://hololive-ocg-wiki.lichingchester.dev`
**API**: `https://hololive-ocg-wiki.lichingchester.dev/api/*`
