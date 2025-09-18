# Hololive OCG Wiki - API Migration Guide

This guide will help you migrate from frontend-only filtering to a Cloudflare Worker + D1 database architecture for better performance with thousands of cards.

## Overview

The new architecture consists of:

- **Cloudflare D1 Database**: Stores card data with optimized schema and full-text search
- **Cloudflare Worker**: REST API for card filtering, search, and pagination
- **Nuxt Frontend**: Updated to use API calls instead of local data processing

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
npx wrangler d1 execute hololive-ocg-db --file=./schema.sql  # For production
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
wrangler d1 execute hololive-ocg-db --local --file=./migration.sql
wrangler d1 execute hololive-ocg-db --local --file=./migration_batch_1.sql
wrangler d1 execute hololive-ocg-db --local --file=./migration_batch_2.sql
# ... continue for all batch files

# For production:
wrangler d1 execute hololive-ocg-db --file=./migration_batch_1.sql
wrangler d1 execute hololive-ocg-db --file=./migration_batch_2.sql
# ... continue for all batch files
```

### 3. Deploy Cloudflare Worker

```bash
# Deploy to Cloudflare
wrangler deploy

# Note the deployed URL (e.g., https://hololive-ocg-worker.your-subdomain.workers.dev)

# Local Test
npx wrangler dev
```

### 4. Update Frontend Configuration

```bash
# In the main project directory
# Set the API URL environment variable
export NUXT_PUBLIC_API_URL="https://hololive-ocg-worker.your-subdomain.workers.dev"

# Or add to .env file:
echo "NUXT_PUBLIC_API_URL=https://hololive-ocg-worker.your-subdomain.workers.dev" >> .env
```

### 5. Switch to API-based Components

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

### 6. Test the Migration

```bash
# Test the API endpoints
curl "https://hololive-ocg-worker.your-subdomain.workers.dev/api/cards/filter?locale=en&limit=10"

# Test search
curl "https://hololive-ocg-worker.your-subdomain.workers.dev/api/cards/search?q=luna&locale=en"

# Test filter options
curl "https://hololive-ocg-worker.your-subdomain.workers.dev/api/filter-options?locale=en"

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
4. Clear any frontend caches

### Scale Up

- D1 can handle millions of records
- Worker has generous free tier limits
- Consider adding Redis/KV for heavy caching if needed

## Security Notes

- API is read-only (no write endpoints)
- CORS is configured for your domain
- No authentication required for public card data
- Rate limiting handled by Cloudflare
