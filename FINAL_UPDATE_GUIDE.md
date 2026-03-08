# Final update new data patch steps

1. Update `data/cards.json` from data grab

2. Update card images from data grab
   1. Compress to webp

      ```bash
      imagemin ./source --out-dir=webp --plugin.webp.quality=95
      ```

   2. Copy PNG, Webp

3. Update fields, names translations from data grab

4. Deploy Web

   ```bash
   # ensure .env set production value
   npm run generate

   cd cloudflare

   # preview
   npx wrangler pages deploy --project-name=hololive-ocg-wiki

   # production
   npx wrangler pages deploy --project-name=hololive-ocg-wiki --branch main
   ```

5. Migrate Data to D1

   ```bash
   # Navigate to cloudflare directory first
   cd cloudflare

   # Generate migration SQL from cards.json
   node migrate.js

   # Run migration SQL on production (Deprecated)
   # npx wrangler d1 execute hololive-ocg-db --remote --file=./migration.sql

   # Run batch migrations on production when the migration.sql is too large
   ./run-migration.sh --env production
   ```

# TODOs

- [ ] Update Deploy Guidelines
- [ ] Fix worker api local dev
