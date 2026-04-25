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
chmod +x setup-fts.sh

# Local
./setup-fts.sh --local hololive-ocg-db

# Production (requires API credentials)
# Copy .env.example → .env and fill in your credentials, then:
./setup-fts.sh --remote hololive-ocg-db
```

The script delegates to `setup-fts.js` (Node 22 `node:sqlite` for local, Cloudflare D1 REST API for remote). This bypasses wrangler's statement splitter which incorrectly breaks `CREATE TRIGGER … BEGIN … END` blocks on every `;`.

### Reset / Rebuild

`setup-fts.sh` always drops and recreates everything — re-run it instead of using `reset-fts.sh`:

```bash
# Local
./setup-fts.sh --local hololive-ocg-db

# Production — copy .env.example → .env, fill in credentials, then:
./setup-fts.sh --remote hololive-ocg-db
```

> **Do not use** `reset-fts.sh`, `--file=setup-fts.sql`, or `wrangler d1 execute --command` for trigger creation — these all fail due to the wrangler semicolon-splitting bug.

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
# Copy cloudflare/.env.example → cloudflare/.env and fill in credentials, then:
cd cloudflare && ./setup-fts.sh --remote hololive-ocg-db
```

### "trigger already exists" / "table already exists"

`setup-fts.sh` runs `DROP IF EXISTS` on all FTS components first — just re-run it:

```bash
cd cloudflare && ./setup-fts.sh --local hololive-ocg-db   # or --remote
```

### Search returning stale results

Rebuild the FTS index by re-running the setup script:

```bash
cd cloudflare && ./setup-fts.sh --local hololive-ocg-db   # or --remote
```

## Maintenance

FTS auto-syncs via triggers for normal CRUD operations. After bulk data migrations, rebuild:

```bash
cd cloudflare
./setup-fts.sh --remote hololive-ocg-db
```

## Related

- [[Schema & Migrations]] — Database schema and migration system
- [[Deployment/Worker Service|Worker Service]] — How the worker uses FTS
- [[Development/Commands|Commands]] — FTS command reference
