# Schema & Migrations

## Database Overview

The project uses **Cloudflare D1** (SQLite-based) with a normalized schema.

- **Database name:** `hololive-ocg-db`
- **Schema file:** `cloudflare/schema.sql`
- **Migration generator:** `cloudflare/migrate.js`

## Tables

| Table                  | Purpose                                   |
| ---------------------- | ----------------------------------------- |
| `cards`                | Core card data (number, type, color, HP…) |
| `card_translations`    | Localized names, effects, ability text    |
| `arts`                 | Card art attacks (cost, damage, effects)  |
| `art_translations`     | Localized art names and effects           |
| `oshi_skills`          | Oshi/SP oshi skills                       |
| `keywords`             | Keyword abilities                         |
| `keyword_translations` | Localized keyword names                   |
| `qa_items`             | Q&A entries per card                      |
| `cards_fts`            | FTS5 virtual table for full-text search   |

### Key Indexes

- `idx_cards_card_type` — Card type filtering
- `idx_cards_color_codes` — Color filtering
- `idx_cards_rarity_code` — Rarity filtering
- `idx_cards_bloom_level_code` — Bloom level filtering

## Data Pipeline

```
data/cards.json → migrate.js → migration.sql + migrations/*.sql → D1
```

1. **Source:** `data/cards.json` contains all card data with translations
2. **Generate:** `node cloudflare/migrate.js` reads the JSON and generates SQL
3. **Execute:** `./run-migration.sh` runs the SQL against D1

### Migration Modes

| Mode       | Command                    | When to use                                                                                                  |
| ---------- | -------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Diff**   | `node migrate.js`          | Default. Only generates SQL for new/changed/removed cards using SHA-256 hash comparison (`cards_hash.json`). |
| **Full**   | `node migrate.js --full`   | Generates SQL for all cards. Use for first-time setup or when `cards_hash.json` is missing.                  |
| **Strict** | `node migrate.js --strict` | Aborts if estimated writes exceed 80% of D1 daily limit (100k writes).                                       |

### Execution Modes

| Environment    | Behavior                                                       | Speed                    |
| -------------- | -------------------------------------------------------------- | ------------------------ |
| **Local**      | Executes entire `migration.sql` in a single `wrangler` command | ~40s for full migration  |
| **Production** | Executes in batches of 500 statements (D1 API limits)          | ~6min for full migration |

### How Diff Detection Works

1. `migrate.js` computes a SHA-256 hash for each card in `cards.json`
2. Compares against previously saved hashes in `cards_hash.json`
3. Only generates SQL for cards whose hash changed, are new, or were removed
4. Updates `cards_hash.json` after generation

This reduces a typical update (5–10 cards changed) from **63,610 writes** to **~70–140 writes** — a ~450x reduction.

### Upsert Strategy

- **`cards` table:** `INSERT ... ON CONFLICT(id) DO UPDATE` — true upsert
- **Child tables** (translations, arts, skills, etc.): `DELETE` per card + re-`INSERT` — ensures clean state per card without dropping all data

### Why Batches?

D1 has query limits per API execution. The migration system splits large datasets into batch files (`migration_batch_0.sql`, `migration_batch_1.sql`, etc.) for production. Locally, the full `migration.sql` is used directly since there are no API limits.

## Common Operations

### Initial Setup (Local)

```bash
cd cloudflare

# Generate full migration (all cards)
node migrate.js --full

# Reset schema + run migration
./run-migration.sh --reset
```

### Update Card Data (Diff)

```bash
cd cloudflare

# Regenerate only changed cards
node migrate.js

# Apply changes
./run-migration.sh
```

### Update Card Data (Production)

```bash
cd cloudflare

# Generate diff migration
node migrate.js

# Run batched migration on production
./run-migration.sh --env production

# Resume from a specific batch if interrupted
./run-migration.sh --env production --start 76
```

### Full Reset (Local)

```bash
cd cloudflare

# Force full migration of all cards
node migrate.js --full

# Reset schema and run
./run-migration.sh --reset
```

### Verify Migration

```bash
cd cloudflare

# Card count (expect 2053)
wrangler d1 execute hololive-ocg-db --local \
  --command="SELECT COUNT(*) as total FROM cards;"

# Translations per locale (expect 2053 each)
wrangler d1 execute hololive-ocg-db --local \
  --command="SELECT locale, COUNT(*) FROM card_translations GROUP BY locale;"

# Child table counts
wrangler d1 execute hololive-ocg-db --local \
  --command="SELECT 'arts' as tbl, COUNT(*) as cnt FROM arts UNION ALL SELECT 'oshi_skills', COUNT(*) FROM oshi_skills UNION ALL SELECT 'art_translations', COUNT(*) FROM art_translations;"
```

### Direct Queries

```bash
# List tables
wrangler d1 execute hololive-ocg-db --command="SELECT name FROM sqlite_master WHERE type='table';"

# Count cards
wrangler d1 execute hololive-ocg-db --command="SELECT COUNT(*) FROM cards;"

# Count translations per locale
wrangler d1 execute hololive-ocg-db --command="SELECT locale, COUNT(*) FROM card_translations GROUP BY locale;"

# Check specific card
wrangler d1 execute hololive-ocg-db --command="SELECT * FROM cards WHERE card_number='HOL-001';"
```

### Schema Changes

1. Update `cloudflare/schema.sql`
2. Create migration in `cloudflare/migrations/`
3. Update TypeScript types in `types/card.ts`
4. Modify Worker response formatting in `cloudflare/worker.ts`

## JSON Array Fields

Some columns store JSON arrays (e.g., `color_codes`, `baton_touch_types`, `card_sets`, `tags`). The worker parses these with `JSON.parse()` before returning them in API responses. Database queries filter them using `LIKE '%"value"%'`.

## Related

- [[Full-Text Search]] — FTS setup for fast search
- [[Development/Commands|Commands]] — Database command reference
- [[Guides/Update Card Data|Update Card Data]] — End-to-end data update process
