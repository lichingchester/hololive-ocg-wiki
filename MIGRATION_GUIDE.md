# Hololive OCG Wiki - API Migration Guide

This guide will help you migrate from frontend-only filtering to a Cloudflare Worker + D1 database architecture for better performance with thousands of cards.

## Overview

The new architecture consists of:

- **Cloudflare D1 Database**: Stores card data with optimized schema and full-text search
- **Cloudflare Worker**: REST API for card filtering, search, and pagination
- **Nuxt Frontend**: Updated to use API calls instead of local data processing

(Updates: Removed local i18n data card implementation.)

## Migration Steps

### 1. Set up Cloudflare Worker and D1 Database

```bash
cd cloudflare

# Install dependencies
npm install

# Create D1 database (replace 'your-database-name' with your preferred name)
npx wrangler d1 create hololive-ocg-db

# Update wrangler.toml with the database ID returned from the previous command
# Copy the database_id from the output and update wrangler.toml

# Create database schema
npx wrangler d1 execute hololive-ocg-db --local --file=./schema.sql
npx wrangler d1 execute hololive-ocg-db --remote --file=./schema.sql  # For production
```

### 2. Migrate Data to D1

```bash
# Navigate to cloudflare directory first
cd cloudflare

# Generate migration SQL from cards.json
node migrate.js

# Run migration for local development (default)
./run-migration.sh

# Run migration for production
./run-migration.sh --env production

# Test what would be executed without actually running (dry run)
./run-migration.sh --dry-run

# Use a custom database name
./run-migration.sh --database my-custom-db

# Get help
./run-migration.sh --help
```

or run manually

```bash
# Execute migration in batches (D1 has query limits)
# For local development:
npx wrangler d1 execute hololive-ocg-db --local --file=./migration.sql
npx wrangler d1 execute hololive-ocg-db --local --file=./migration_batch_1.sql
npx wrangler d1 execute hololive-ocg-db --local --file=./migration_batch_2.sql
# ... continue for all batch files

# For production:
npx wrangler d1 execute hololive-ocg-db --file=./migration_batch_1.sql
npx wrangler d1 execute hololive-ocg-db --file=./migration_batch_2.sql
# ... continue for all batch files
```

### 3. Set up Full-Text Search (FTS) for Optimal Performance

After migrating your data, set up FTS for lightning-fast search performance:

```bash
# Navigate to cloudflare directory
cd cloudflare

# Make the FTS setup scripts executable
chmod +x setup-fts.sh
chmod +x reset-fts.sh

# Set up FTS for local development (fresh setup)
./setup-fts.sh hololive-ocg-db

# If you get "already exists" errors, use the reset script instead
./reset-fts.sh hololive-ocg-db

# For production, specify the production database name
./setup-fts.sh your-production-database-name
./reset-fts.sh your-production-database-name  # If resetting existing FTS
```

The FTS setup will:

- Create a `cards_fts` virtual table using SQLite FTS5
- Populate it with searchable content from cards, translations, and oshi skills
- Set up triggers to automatically keep FTS data synchronized
- Enable fast full-text search across card names, abilities, skills, and tags

**Benefits of FTS:**

- **10x faster searches** compared to LIKE queries
- **Relevance ranking** - most relevant results first
- **Multi-language support** - works with Japanese, English, and other locales
- **Automatic fallback** - gracefully degrades to LIKE queries if FTS unavailable

**Manual FTS setup (if scripts don't work):**

```bash
# Apply FTS setup manually
npx wrangler d1 execute hololive-ocg-db --file=./setup-fts.sql

# For production
npx wrangler d1 execute your-production-db --file=./setup-fts.sql

# If you get "already exists" errors, manually drop existing components first
npx wrangler d1 execute hololive-ocg-db --command="DROP TRIGGER IF EXISTS cards_fts_insert;"
npx wrangler d1 execute hololive-ocg-db --command="DROP TRIGGER IF EXISTS cards_fts_update;"
npx wrangler d1 execute hololive-ocg-db --command="DROP TRIGGER IF EXISTS cards_fts_delete;"
npx wrangler d1 execute hololive-ocg-db --command="DROP TRIGGER IF EXISTS cards_fts_oshi_skills_update;"
npx wrangler d1 execute hololive-ocg-db --command="DROP TRIGGER IF EXISTS cards_fts_tags_update;"
npx wrangler d1 execute hololive-ocg-db --command="DROP TABLE IF EXISTS cards_fts;"
# Then run the setup file
npx wrangler d1 execute hololive-ocg-db --file=./setup-fts.sql

# Verify FTS is working
npx wrangler d1 execute hololive-ocg-db --command="SELECT COUNT(*) FROM cards_fts;"
```

### 4. Deploy Cloudflare Worker

```bash
# Deploy to Cloudflare
npx wrangler deploy --env production

# Note the deployed URL (e.g., https://hololive-ocg-worker.your-subdomain.workers.dev)

# Local Test
npx wrangler dev --env development
```

### 5. Update Frontend Configuration

```bash
# In the main project directory
# Set the API URL environment variable
export NUXT_PUBLIC_API_URL="https://hololive-ocg-worker.your-subdomain.workers.dev"
export NUXT_PUBLIC_API_URL="http://localhost:8787"

# Or add to .env file:
echo "NUXT_PUBLIC_API_URL=https://hololive-ocg-worker.your-subdomain.workers.dev" >> .env
echo "NUXT_PUBLIC_API_URL=http://localhost:8787" >> .env
```

### 6. Switch to API-based Components

Update your pages to use the new API-based components:

```vue
<!-- pages/index.vue -->
<script setup lang="ts"></script>

<template>
  <AppHeader>
    <!-- filter -->
    <Filter />

    <!-- search -->
    <SearchInputAPI />
    <!-- Use API-based search -->
  </AppHeader>

  <!-- Card List -->
  <div class="grow">
    <CardListViewAPI />
    <!-- Use API-based card list -->
  </div>

  <FloatingDeck />

  <AppFooter>
    <AppFooterCurrentDeck />
    <div class="ml-auto flex items-center gap-2">
      <AppFooterOptionsButton />
      <AppFooterDeckButton />
    </div>
  </AppFooter>
</template>
```

### 7. Test the Migration

```bash
# Test the API endpoints
curl "https://hololive-ocg-worker.your-subdomain.workers.dev/api/cards/filter?locale=en&limit=10"
curl "http://localhost:8787/api/cards/filter?locale=en&limit=10"

# Test search
curl "https://hololive-ocg-worker.your-subdomain.workers.dev/api/cards/search?q=luna&locale=en"
curl "http://localhost:8787/api/cards/search?q=luna&locale=en"

# Test filter options
curl "https://hololive-ocg-worker.your-subdomain.workers.dev/api/filter-options?locale=en"
curl "http://localhost:8787/api/filter-options?locale=en"

# Start the Nuxt development server
npm run dev
```

## API Endpoints

### GET /api/cards/filter

Filter cards with multiple criteria.

**Parameters:**

- `locale` (string): Language locale (en, ja, tc, etc.)
- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Number of cards per page (default: 50)
- `search` (string): Full-text search query
- `name` (string): Exact card name match
- `tag` (string): Tag filter
- `set` (string): Set name filter
- `colors` (string): Comma-separated color codes
- `cardTypes` (string): Comma-separated card type codes
- `rarity` (string): Comma-separated rarity codes
- `bloomLevel` (string): Comma-separated bloom level codes

### GET /api/cards/search

Full-text search across cards.

**Parameters:**

- `q` (string): Search query
- `locale` (string): Language locale
- `limit` (number): Maximum results (default: 100)

### GET /api/cards/:id

Get detailed card information by ID.

### GET /api/filter-options

Get available filter options for dropdowns.

**Parameters:**

- `locale` (string): Language locale

## Performance Benefits

- **Reduced Bundle Size**: No need to load thousands of cards on the frontend
- **Faster Initial Load**: Only load what's needed for the current view
- **Better Search**: Full-text search with SQLite FTS5
- **Optimized Filtering**: Database indexes for fast filtering
- **Pagination**: Load cards as needed instead of all at once
- **Caching**: Cloudflare edge caching for repeated requests

## Environment Variables

### Frontend (.env)

```bash
NUXT_PUBLIC_API_URL=https://hololive-ocg-worker.your-subdomain.workers.dev
```

### Cloudflare Worker (wrangler.toml)

```toml
[env.production.vars]
CORS_ORIGIN = "https://your-domain.com"

[env.development.vars]
CORS_ORIGIN = "http://localhost:3000"
```

## Monitoring and Debugging

### Check D1 Database

```bash
# List tables
wrangler d1 execute hololive-ocg-db --command="SELECT name FROM sqlite_master WHERE type='table';"

# Check record counts
wrangler d1 execute hololive-ocg-db --command="SELECT COUNT(*) FROM cards;"
wrangler d1 execute hololive-ocg-db --command="SELECT COUNT(*) FROM card_translations;"

# Verify FTS table
wrangler d1 execute hololive-ocg-db --command="SELECT COUNT(*) FROM cards_fts;"

# Test FTS search
wrangler d1 execute hololive-ocg-db --command="SELECT card_id, name FROM cards_fts WHERE cards_fts MATCH 'luna' LIMIT 5;"

# Check FTS triggers
wrangler d1 execute hololive-ocg-db --command="SELECT name FROM sqlite_master WHERE type='trigger' AND name LIKE '%fts%';"
```

### Worker Logs

```bash
# View live logs
wrangler tail

# View logs for specific deployment
wrangler tail --environment production
```

## Rollback Plan

If you need to rollback to the original frontend-only implementation:

1. Keep the original `useCardStore.ts` and `CardListView.vue` files
2. Revert the imports in `pages/index.vue`
3. Remove the API configuration from `nuxt.config.ts`

## Maintenance

### Update Card Data

1. Update `data/cards_i18n.json`
2. Run the migration script: `node cloudflare/migrate.js`
3. Execute the new migration SQL files in D1
4. **Rebuild FTS index**: `./cloudflare/setup-fts.sh hololive-ocg-db`
5. Clear any frontend caches

**FTS Maintenance:**

The FTS table automatically stays in sync with changes through database triggers. However, if you notice search performance issues or missing results:

```bash
# Rebuild FTS index from scratch (recommended method)
cd cloudflare
./reset-fts.sh hololive-ocg-db

# Or use the regular setup script if no conflicts
./setup-fts.sh hololive-ocg-db

# Manual cleanup if scripts fail
npx wrangler d1 execute hololive-ocg-db --command="DROP TABLE IF EXISTS cards_fts;"
npx wrangler d1 execute hololive-ocg-db --file=./setup-fts.sql
```

### Scale Up

- D1 can handle millions of records
- Worker has generous free tier limits
- Consider adding Redis/KV for heavy caching if needed

## Troubleshooting

### FTS Issues

**"FTS search failed, falling back to regular search" messages:**

This is normal behavior when FTS isn't set up yet. The API automatically falls back to LIKE queries. To resolve:

```bash
cd cloudflare
./setup-fts.sh hololive-ocg-db
```

**"trigger already exists" or "table already exists" errors:**

This happens when FTS components were previously created. Use the reset script instead:

```bash
cd cloudflare
./reset-fts.sh hololive-ocg-db
```

The reset script will:

1. Drop all existing FTS triggers individually
2. Drop the existing FTS table
3. Recreate everything from scratch

**Search returns no results:**

1. Verify FTS table exists and has data:

   ```bash
   npx wrangler d1 execute hololive-ocg-db --command="SELECT COUNT(*) FROM cards_fts;"
   ```

2. Test FTS directly:

   ```bash
   npx wrangler d1 execute hololive-ocg-db --command="SELECT * FROM cards_fts WHERE cards_fts MATCH 'test' LIMIT 1;"
   ```

3. If no results, rebuild FTS:
   ```bash
   ./reset-fts.sh hololive-ocg-db
   ```

**"no such column: cf" errors:**

This indicates the FTS table structure doesn't match the query. Rebuild FTS using the reset script:

```bash
cd cloudflare
./reset-fts.sh hololive-ocg-db
```

**Common FTS Setup Issues:**

1. **Components already exist**: Use `./reset-fts.sh` instead of `./setup-fts.sh`
2. **Partial setup**: If setup was interrupted, always use reset script to ensure clean state
3. **D1 quirks**: The `IF EXISTS` clause in SQL sometimes doesn't work as expected with triggers in D1, which is why the reset script drops components individually

**Verification Commands:**

```bash
# Check if FTS table exists and record count
npx wrangler d1 execute hololive-ocg-db --command="SELECT COUNT(*) FROM cards_fts;"

# Check if all triggers exist
npx wrangler d1 execute hololive-ocg-db --command="SELECT name FROM sqlite_master WHERE type='trigger' AND name LIKE '%fts%';"

# Test FTS search functionality
npx wrangler d1 execute hololive-ocg-db --command="SELECT card_id, name FROM cards_fts WHERE cards_fts MATCH 'luna' LIMIT 5;"
```

### General Issues

**API returns 500 errors:**

1. Check worker logs: `wrangler tail`
2. Verify database connection in `wrangler.toml`
3. Ensure all migration batches were executed successfully

**CORS errors:**

Update the `CORS_ORIGIN` environment variable in `wrangler.toml` to match your frontend domain.

## Security Notes

- API is read-only (no write endpoints)
- CORS is configured for your domain
- No authentication required for public card data
- Rate limiting handled by Cloudflare
