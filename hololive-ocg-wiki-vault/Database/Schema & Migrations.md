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
data/cards.json → migrate.js → migrations/migration_batch_*.sql → D1
```

1. **Source:** `data/cards.json` contains all card data with translations
2. **Generate:** `node cloudflare/migrate.js` reads the JSON and generates batched SQL
3. **Execute:** `./run-migration.sh` runs all batch files against D1

### Why Batches?

D1 has query limits per execution. The migration system splits large datasets into batch files (`migration_batch_0.sql`, `migration_batch_1.sql`, etc.) to stay within limits.

## Common Operations

### Initial Setup (Local)

```bash
cd cloudflare

# Apply schema
npx wrangler d1 execute hololive-ocg-db --local --file=./schema.sql

# Generate migrations from card data
node migrate.js

# Run all batches
./run-migration.sh --env local
```

### Update Card Data

```bash
cd cloudflare

# Regenerate migrations after updating cards.json
node migrate.js

# Run on production (resets schema with --start 0)
./run-migration.sh --env production

# Resume from a specific batch if interrupted
./run-migration.sh --env production --start 76
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
