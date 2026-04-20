# Troubleshooting

Common issues and their solutions.

## API Issues

### API calls return 404

- Ensure Pages function exists at `functions/api/[[path]].ts`
- Verify service binding is configured in Cloudflare Dashboard
- Check that the worker service is deployed: `wrangler deploy --config wrangler.service.toml`

### API returns wrong locale / falls back to TC

- Check that the locale is in the worker's `allowedLocales` array (`cloudflare/worker.ts`)
- Ensure the worker was **redeployed** after adding the locale
- Verify translation data exists in D1:
  ```bash
  wrangler d1 execute hololive-ocg-db --command="SELECT locale, COUNT(*) FROM card_translations GROUP BY locale;"
  ```

### "Service not found" error

- Deploy the worker service **before** Pages
- Verify the service name matches between `wrangler.service.toml` and the Dashboard binding

### CORS errors in development

- Ensure `NUXT_PUBLIC_API_URL` points to worker dev server (`http://localhost:8787`)
- Check worker CORS configuration allows localhost

## Database Issues

### Migration batch fails

Resume from the failed batch:

```bash
./run-migration.sh --env production --start <batch_number>
```

### Diff migration shows "No changes detected" but data is wrong

The hash file may be out of sync. Force a full migration:

```bash
node migrate.js --full
./run-migration.sh --reset   # local
./run-migration.sh --env production --reset  # production
```

### "table already exists" on schema apply

This is expected when re-applying schema. The schema uses `CREATE TABLE IF NOT EXISTS`. If you need a clean reset:

```bash
# Reset schema + full migration
./run-migration.sh --reset
```

### Card count mismatch between locales

Check per-locale counts:

```bash
wrangler d1 execute hololive-ocg-db --local --command="SELECT locale, COUNT(*) FROM card_translations GROUP BY locale;"
```

If mismatched, re-run the full migration:

```bash
node migrate.js --full
./run-migration.sh --reset
```

## FTS Issues

### "FTS search failed, falling back to regular search"

Normal when FTS isn't set up. The API auto-falls back to LIKE queries. Fix:

```bash
cd cloudflare && ./setup-fts.sh hololive-ocg-db
```

### "trigger already exists" / "table already exists"

Use reset script:

```bash
cd cloudflare && ./reset-fts.sh hololive-ocg-db
```

### Search returning stale results

Rebuild FTS index:

```bash
cd cloudflare && ./reset-fts.sh hololive-ocg-db
```

## Build Issues

### Out of memory during `npm run generate`

Increase Node.js memory limit:

```bash
NODE_OPTIONS="--max-old-space-size=8192" npm run generate
```

### Deployment fails with wrong config

Make sure you're using the right config file:

- **Worker service:** `wrangler deploy --config wrangler.service.toml`
- **Pages:** `wrangler pages deploy ...`
- Do NOT use bare `wrangler deploy` in the cloudflare directory (uses wrong config)

## Development Issues

### Local API not connecting

1. Ensure worker is running: `cd cloudflare && npx wrangler dev`
2. Ensure frontend has API URL set: `export NUXT_PUBLIC_API_URL="http://localhost:8787"`
3. Check local D1 has data: `wrangler d1 execute hololive-ocg-db --local --command="SELECT COUNT(*) FROM cards;"`

### Locale not appearing in UI

1. Verify locale added to `nuxt.config.ts` i18n.locales array
2. Verify locale file exists in `i18n/locales/{locale}.json`
3. Verify locale added to `types/card.ts` Locales type
4. Verify locale added to worker's `allowedLocales` in `cloudflare/worker.ts`

## Related

- [[Development/Commands|Commands]] — All command references
- [[Database/Full-Text Search|Full-Text Search]] — FTS troubleshooting
- [[Deployment/Deploy to Production|Deploy to Production]] — Deployment checklist
