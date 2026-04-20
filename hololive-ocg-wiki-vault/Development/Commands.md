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

# ── Migration ──

# Generate migration SQL (diff — only changed cards)
node migrate.js

# Generate migration SQL (full — all cards, use for first-time or reset)
node migrate.js --full

# Run migrations (local — fast mode, single command)
./run-migration.sh

# Reset schema + full migration (local, first-time setup)
./run-migration.sh --reset

# Run migrations (production — batched)
./run-migration.sh --env production

# Resume from specific batch (production)
./run-migration.sh --env production --start 76

# ── Verification ──

# Count cards
wrangler d1 execute hololive-ocg-db --local --command="SELECT COUNT(*) FROM cards;"

# Count translations per locale
wrangler d1 execute hololive-ocg-db --local --command="SELECT locale, COUNT(*) FROM card_translations GROUP BY locale;"

# Count all child tables
wrangler d1 execute hololive-ocg-db --local --command="SELECT 'arts' as tbl, COUNT(*) as cnt FROM arts UNION ALL SELECT 'oshi_skills', COUNT(*) FROM oshi_skills UNION ALL SELECT 'art_translations', COUNT(*) FROM art_translations;"
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
