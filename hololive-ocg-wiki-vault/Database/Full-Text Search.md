# Full-Text Search

The API uses **SQLite FTS5** for fast card search with relevance ranking.

## Overview

- **FTS table:** `cards_fts` (virtual table)
- **Searchable fields:** Card names, abilities, oshi skills, tags (all locales)
- **Auto-sync:** Database triggers keep FTS in sync with card data changes
- **Fallback:** If FTS is unavailable, the worker gracefully falls back to LIKE queries

## Benefits

- **~10x faster** searches compared to LIKE queries
- **Relevance ranking** — most relevant results first
- **Multi-language support** — works across all locales
- **Automatic maintenance** — triggers handle insert/update/delete

## Setup

### Fresh Setup

```bash
cd cloudflare

# Make scripts executable
chmod +x setup-fts.sh reset-fts.sh

# Set up FTS (local)
./setup-fts.sh hololive-ocg-db

# Set up FTS (production)
./setup-fts.sh your-production-database-name
```

### Reset / Rebuild

If you get "already exists" errors, use the reset script:

```bash
./reset-fts.sh hololive-ocg-db
```

### Manual Setup

```bash
# Apply FTS SQL directly
npx wrangler d1 execute hololive-ocg-db --file=./setup-fts.sql

# If tables/triggers already exist, drop them first:
npx wrangler d1 execute hololive-ocg-db --command="DROP TRIGGER IF EXISTS cards_fts_insert;"
npx wrangler d1 execute hololive-ocg-db --command="DROP TRIGGER IF EXISTS cards_fts_update;"
npx wrangler d1 execute hololive-ocg-db --command="DROP TRIGGER IF EXISTS cards_fts_delete;"
npx wrangler d1 execute hololive-ocg-db --command="DROP TRIGGER IF EXISTS cards_fts_oshi_skills_update;"
npx wrangler d1 execute hololive-ocg-db --command="DROP TRIGGER IF EXISTS cards_fts_tags_update;"
npx wrangler d1 execute hololive-ocg-db --command="DROP TABLE IF EXISTS cards_fts;"
# Then re-apply
npx wrangler d1 execute hololive-ocg-db --file=./setup-fts.sql
```

## Verification

```bash
# Check FTS row count
wrangler d1 execute hololive-ocg-db --command="SELECT COUNT(*) FROM cards_fts;"

# Test FTS search
wrangler d1 execute hololive-ocg-db --command="SELECT card_id, name FROM cards_fts WHERE cards_fts MATCH 'luna' LIMIT 5;"

# Check triggers exist
wrangler d1 execute hololive-ocg-db --command="SELECT name FROM sqlite_master WHERE type='trigger' AND name LIKE '%fts%';"
```

## Troubleshooting

### "FTS search failed, falling back to regular search"

Normal when FTS isn't set up yet. The API auto-falls back to LIKE queries. Fix:

```bash
cd cloudflare && ./setup-fts.sh hololive-ocg-db
```

### "trigger already exists" / "table already exists"

Use reset script instead of setup:

```bash
cd cloudflare && ./reset-fts.sh hololive-ocg-db
```

### Search returning stale results

Rebuild the FTS index:

```bash
cd cloudflare && ./reset-fts.sh hololive-ocg-db
```

## Maintenance

FTS auto-syncs via triggers for normal CRUD operations. After bulk data migrations, rebuild:

```bash
cd cloudflare
./reset-fts.sh hololive-ocg-db
```

## Related

- [[Schema & Migrations]] — Database schema and migration system
- [[Deployment/Worker Service|Worker Service]] — How the worker uses FTS
- [[Development/Commands|Commands]] — FTS command reference
