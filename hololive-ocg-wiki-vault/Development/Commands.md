# Commands

Quick reference for common development, deployment, and database commands.

## Development

```bash
# Start frontend (port 3000)
npm run dev

# Start worker API (port 8787)
cd cloudflare && npx wrangler dev --config wrangler.service.toml --port 8787

# Start frontend with explicit API URL
export NUXT_PUBLIC_API_URL="http://localhost:8787"
npm run dev

# Generate static site (increase memory if needed)
NODE_OPTIONS="--max-old-space-size=8192" npm run generate
```

## Deployment

```bash
# Deploy worker service
cd cloudflare && wrangler deploy --config wrangler.service.toml

# Build and deploy Pages (preview)
npm run generate
cd cloudflare && npx wrangler pages deploy ../.output/public --project-name=hololive-ocg-wiki

# Build and deploy Pages (production)
npm run generate
cd cloudflare && npx wrangler pages deploy ../.output/public --project-name=hololive-ocg-wiki --branch main
```

## Database

```bash
cd cloudflare

# Create D1 database (first time only)
wrangler d1 create hololive-ocg-db

# Apply schema
wrangler d1 execute hololive-ocg-db --local --file=./schema.sql

# Generate migration SQL from cards.json
node migrate.js

# Run migrations (local)
./run-migration.sh --env local

# Run migrations (production)
./run-migration.sh --env production

# Resume from specific batch
./run-migration.sh --env production --start 76

# Query database
wrangler d1 execute hololive-ocg-db --local --command="SELECT COUNT(*) FROM cards;"
```

## Full-Text Search

```bash
cd cloudflare

# Set up FTS (local)
./setup-fts.sh hololive-ocg-db

# Reset and rebuild FTS
./reset-fts.sh hololive-ocg-db

# Verify FTS
wrangler d1 execute hololive-ocg-db --local --command="SELECT COUNT(*) FROM cards_fts;"
```

## Monitoring

```bash
# Watch worker logs
wrangler tail

# Watch Pages function logs
wrangler pages deployment tail

# Test API
curl "http://localhost:8787/api/cards/filter?locale=en&limit=10"
curl "https://hololive-ocg-wiki.lichingchester.dev/api/cards/filter?locale=en&limit=5"
```

## Related

- [[Local Setup]] — Full development environment setup
- [[Database/Schema & Migrations|Schema & Migrations]] — Database details
- [[Database/Full-Text Search|Full-Text Search]] — FTS setup and maintenance
