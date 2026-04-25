# Update Card Data

Step-by-step process for updating card data and deploying changes.

## Steps

### 1. Update Source Data

- Update `data/cards.json` from data grab
- Update card images from data grab

### 2. Compress Card Images

```bash
imagemin ./source --out-dir=webp --plugin.webp.quality=95
```

Copy both PNG and WebP versions to `public/card_images/`.

### 3. Update Translations

Update field/name translations from data grab into `data/cards_i18n.json` and locale files in `i18n/locales/`.

### 4. Deploy Frontend

```bash
# Ensure .env has production values
npm run generate

cd cloudflare

# Preview deployment
npx wrangler pages deploy ../.output/public --project-name=hololive-ocg-wiki

# Production deployment
npx wrangler pages deploy ../.output/public --project-name=hololive-ocg-wiki --branch main
```

### 5. Migrate Data to D1

```bash
cd cloudflare

# Generate migration SQL (diff — only changed cards)
node migrate.js

# Run locally first to verify
./run-migration.sh

# Verify locally
npx wrangler d1 execute hololive-ocg-db --local --yes \
  --command="SELECT COUNT(*) as total_cards FROM cards;"

npx wrangler d1 execute hololive-ocg-db --local --yes \
  --command="SELECT locale, COUNT(*) FROM card_translations GROUP BY locale;"

# Deploy to production (batched)
./run-migration.sh --env production

# Resume from specific batch if interrupted
./run-migration.sh --env production --start 76
```

> **Tip:** For typical updates (5–10 cards), diff mode generates ~1 batch instead of 128+. Check the `migrate.js` output for the estimated write count.

### 6. Rebuild Full-Text Search

```bash
# Copy cloudflare/.env.example → cloudflare/.env and fill in credentials (first time only)
cd cloudflare
./setup-fts.sh --remote hololive-ocg-db
```

> **Note:** The script uses the Cloudflare D1 REST API directly (`setup-fts.js`) to work around a wrangler limitation where `CREATE TRIGGER … BEGIN … END` blocks are incorrectly split on `;`. Do not use `reset-fts.sh` or `--file=setup-fts.sql` — these are broken for trigger creation.

### 7. Verify

```bash
# Test API locally
curl "http://localhost:8787/api/cards/filter?locale=en&limit=5"

# Test API production
curl "https://hololive-ocg-wiki.lichingchester.dev/api/cards/filter?locale=en&limit=5"

# Check card count (local)
npx wrangler d1 execute hololive-ocg-db --local --command="SELECT COUNT(*) FROM cards;"

# Check card count (production)
npx wrangler d1 execute hololive-ocg-db --remote --command="SELECT COUNT(*) FROM cards;"

# Check FTS count
npx wrangler d1 execute hololive-ocg-db --local --command="SELECT COUNT(*) FROM cards_fts;"

# Check translations per locale
npx wrangler d1 execute hololive-ocg-db --local \
  --command="SELECT locale, COUNT(*) FROM card_translations GROUP BY locale;"
```

## Related

- [[Database/Schema & Migrations|Schema & Migrations]] — Migration system details
- [[Database/Full-Text Search|Full-Text Search]] — FTS rebuild process
- [[Deployment/Deploy to Production|Deploy to Production]] — Full deployment workflow
