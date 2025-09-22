# Migration Guide: Standalone Worker → Pages + Service Binding

This guide helps you migrate from the current standalone Cloudflare Worker setup to Cloudflare Pages with Worker service binding.

## Current vs New Architecture

### Current (Standalone Worker)

```
Frontend (Pages) ←→ API (Worker) ←→ Database (D1)
https://site.pages.dev   https://worker.workers.dev
```

### New (Pages + Service Binding)

```
Frontend + API (Pages + Bound Worker) ←→ Database (D1)
https://site.pages.dev/api/*
```

## Migration Steps

### 1. Backup Current Setup

```bash
# Backup current configurations
cp cloudflare/wrangler.toml cloudflare/wrangler.toml.backup
cp nuxt.config.ts nuxt.config.ts.backup

# Export current database (optional)
wrangler d1 execute hololive-ocg-db --command="SELECT sql FROM sqlite_master WHERE type='table';" > db_schema_backup.sql
```

### 2. Test New Configuration Locally

```bash
# Use the new development script
./dev-local.sh
```

Verify:

- Frontend loads at http://localhost:3000
- API works at http://localhost:3000/api/\*
- Search and filtering functions work
- All locales are accessible

### 3. Deploy New Setup

```bash
# Deploy the new Pages + Service setup
./deploy-pages.sh
```

### 4. Verify Deployment

Test these endpoints on your new Pages domain:

```bash
# Replace with your actual Pages domain
DOMAIN="https://hololive-ocg-wiki.lichingchester.dev"

# Test basic API
curl "$DOMAIN/api/cards/filter?locale=en&limit=5"

# Test search
curl "$DOMAIN/api/cards/search?q=marine&locale=en"

# Test card details
curl "$DOMAIN/api/cards/[CARD_ID]?locale=en"

# Test filter options
curl "$DOMAIN/api/filter-options?locale=en"
```

### 5. Update Environment Variables

If you have any external services or monitoring tools:

- **Old API URL**: `https://hololive-ocg-worker.workers.dev`
- **New API URL**: `https://hololive-ocg-wiki.lichingchester.dev/api`

### 6. DNS Changes (If Using Custom Domain)

If you have a custom domain:

1. **Remove worker route** from Cloudflare dashboard
2. **Point domain to Pages** in Pages settings
3. **Update any CDN/proxy** configurations

### 7. Clean Up (Optional)

After confirming the new setup works:

```bash
# Remove old worker deployment
wrangler delete hololive-ocg-worker

# Remove backup files
rm cloudflare/wrangler.toml.backup nuxt.config.ts.backup
```

## Key Changes Summary

### Files Added

- `functions/api/[[path]].ts` - Pages function for API routing
- `cloudflare/wrangler.service.toml` - Worker service configuration
- `cloudflare/wrangler.pages.toml` - Pages configuration
- `deploy-pages.sh` - New deployment script
- `dev-local.sh` - Local development script
- `PAGES_DEPLOYMENT_GUIDE.md` - Comprehensive documentation

### Files Modified

- `nuxt.config.ts` - Updated API URL configuration for relative URLs
- No changes to `cloudflare/worker.ts` - API logic remains the same

### Files Preserved

- `cloudflare/worker.ts` - No changes needed
- `cloudflare/schema.sql` - Database schema unchanged
- All migration files remain the same
- Frontend components and composables unchanged

## Benefits After Migration

1. **Same Domain**: No more CORS configuration needed
2. **Better Performance**: Reduced latency between frontend and API
3. **Simplified URLs**: API at `/api/*` instead of separate domain
4. **Cost Optimization**: More efficient resource usage
5. **Easier Development**: Single domain for frontend and API

## Rollback Plan

If you need to rollback to the standalone worker:

1. **Restore configurations**:

   ```bash
   cp cloudflare/wrangler.toml.backup cloudflare/wrangler.toml
   cp nuxt.config.ts.backup nuxt.config.ts
   ```

2. **Redeploy standalone worker**:

   ```bash
   cd cloudflare
   wrangler deploy
   ```

3. **Update environment variables**:
   ```bash
   export NUXT_PUBLIC_API_URL="https://hololive-ocg-worker.workers.dev"
   ```

## Troubleshooting Migration Issues

### Issue: API calls return 404

**Solution**: Ensure the Pages function is deployed and service binding is correct

### Issue: Database not accessible

**Solution**: Verify D1 bindings match in both `wrangler.service.toml` and `wrangler.pages.toml`

### Issue: CORS errors

**Solution**: Check that `NUXT_PUBLIC_API_URL` is empty string in production

### Issue: Service binding fails

**Solution**: Deploy worker service first, then Pages

## Testing Checklist

Before completing migration:

- [ ] Homepage loads correctly
- [ ] Card search works
- [ ] Card filtering works
- [ ] Card details pages load
- [ ] All language switches work
- [ ] API endpoints respond correctly
- [ ] No console errors
- [ ] Performance is acceptable
- [ ] Database queries work

## Post-Migration Optimization

1. **Configure Caching**: Set up Cloudflare caching rules for API responses
2. **Monitor Performance**: Use Cloudflare Analytics to track improvements
3. **Set Up Alerts**: Configure monitoring for the new architecture
4. **Update Documentation**: Inform your team about the new URLs and setup

The migration maintains all existing functionality while providing better performance and easier management. Your database, API logic, and frontend remain unchanged - only the deployment architecture is improved.
