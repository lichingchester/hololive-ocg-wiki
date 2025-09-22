# Cloudflare Pages + Worker Service Binding Setup Guide

This guide explains how to deploy the Hololive OCG Wiki using Cloudflare Pages with a bound Worker service for the API.

## Overview

The new architecture uses:

- **Cloudflare Pages** for hosting the Nuxt.js frontend
- **Cloudflare Worker** (bound as a service) for the API
- **Cloudflare D1** for the database
- **Service Binding** to connect Pages and Worker on the same domain

## Benefits

1. **Same Domain**: No CORS issues - API and frontend served from same domain
2. **Better Performance**: Reduced latency between frontend and API
3. **Simplified Deployment**: Single domain to manage
4. **Cost Effective**: Optimized resource usage
5. **Better Caching**: Improved edge caching capabilities

## File Structure

```
├── functions/
│   └── api/
│       └── [[path]].ts          # Pages function to proxy API calls
├── cloudflare/
│   ├── worker.ts                # Worker API logic (unchanged)
│   ├── wrangler.service.toml    # Worker service configuration
│   ├── wrangler.pages.toml     # Pages configuration with service binding
│   └── ...                     # Other worker files
├── deploy-pages.sh              # New deployment script
├── dev-local.sh                 # Local development script
└── nuxt.config.ts               # Updated with relative API URLs
```

## Setup Instructions

### 1. Prerequisites

Ensure you have:

- Node.js 18+ installed
- Cloudflare account with Workers/Pages enabled
- Wrangler CLI installed and authenticated: `npm install -g wrangler`

### 2. Database Setup

If you haven't already set up the database:

```bash
cd cloudflare

# Create D1 database
wrangler d1 create hololive-ocg-db

# Copy the database_id from output and update both:
# - wrangler.service.toml
# - wrangler.pages.toml

# Set up schema
wrangler d1 execute hololive-ocg-db --file=./schema.sql

# Run migrations (if you have data to migrate)
node migrate.js
# Then execute all migration batches:
for file in migrations/migration_batch_*.sql; do
  wrangler d1 execute hololive-ocg-db --file="$file"
done
```

### 3. Deploy Worker Service

First, deploy the worker that will be bound as a service:

```bash
cd cloudflare
wrangler deploy --config wrangler.service.toml
```

This creates the `hololive-ocg-api-service` worker that Pages will bind to.

### 4. Deploy to Pages

Build and deploy the frontend with service binding:

```bash
# From project root
npm run build

cd cloudflare
wrangler pages deploy ../.output/public --project-name=hololive-ocg-wiki --config wrangler.pages.toml
```

### 5. Automated Deployment

Use the provided script for easier deployment:

```bash
./deploy-pages.sh
```

## Local Development

### Option 1: Use the development script

```bash
./dev-local.sh
```

This starts both the worker and Nuxt dev servers with proper configuration.

### Option 2: Manual setup

Start the worker API:

```bash
cd cloudflare
npx wrangler dev --config wrangler.service.toml --port 8787
```

In another terminal, start Nuxt:

```bash
export NUXT_PUBLIC_API_URL="http://localhost:8787"
npm run dev
```

## Configuration Details

### Service Binding Configuration

In `wrangler.pages.toml`:

```toml
[[services]]
binding = "API"
service = "hololive-ocg-api-service"
environment = "production"
```

This binds the worker service to the Pages function as `env.API`.

### Pages Function

The `functions/api/[[path]].ts` file handles all `/api/*` routes by:

1. Receiving the request from the frontend
2. Forwarding it to the bound worker service via `env.API.fetch(request)`
3. Returning the worker's response

### API URL Configuration

In production:

- `NUXT_PUBLIC_API_URL = ""` (empty string uses relative URLs)
- API calls go to `/api/*` on the same domain
- Pages function proxies to the bound worker service

In development:

- `NUXT_PUBLIC_API_URL = "http://localhost:8787"`
- API calls go directly to the worker dev server

## Environment Variables

### Production (Pages)

```bash
# In wrangler.pages.toml
NUXT_PUBLIC_API_URL = ""  # Use relative URLs
```

### Development

```bash
# Local .env or export
NUXT_PUBLIC_API_URL="http://localhost:8787"
```

## Troubleshooting

### Common Issues

1. **"Service not found" error**

   - Ensure the worker service is deployed before Pages
   - Check service name matches in both configurations

2. **API calls failing**

   - Verify the Pages function is correctly proxying requests
   - Check browser dev tools for 500 errors in `/api/*` calls

3. **Database not accessible**

   - Ensure D1 bindings are identical in both config files
   - Verify database_id is correct

4. **CORS errors in development**
   - Ensure `NUXT_PUBLIC_API_URL` points to worker dev server
   - Check worker CORS configuration allows localhost

### Debugging

1. **Check Pages function logs**:

   ```bash
   wrangler pages deployment tail
   ```

2. **Check worker service logs**:

   ```bash
   wrangler tail hololive-ocg-api-service
   ```

3. **Test API directly**:
   ```bash
   curl "https://hololive-ocg-wiki.lichingchester.dev/api/cards/filter?locale=en&limit=5"
   ```

## Migration from Standalone Worker

If migrating from the previous standalone worker setup:

1. **Update DNS** (if using custom domain):

   - Remove old worker route
   - Point domain to Pages

2. **Update environment variables**:

   - Remove `CORS_ORIGIN` and `ALLOWED_ORIGINS` (not needed)
   - Set `NUXT_PUBLIC_API_URL=""` for production

3. **Test thoroughly**:
   - Verify all API endpoints work
   - Check that search and filtering functions correctly
   - Test across all supported locales

## Production Deployment Checklist

- [ ] Worker service deployed successfully
- [ ] Pages deployed with correct service binding
- [ ] Database schema and migrations applied
- [ ] API endpoints responding correctly
- [ ] Frontend loads and functions properly
- [ ] All locales working
- [ ] Search functionality operational
- [ ] No console errors in browser

## Performance Optimization

The service binding architecture provides several performance benefits:

1. **Reduced Latency**: No external HTTP calls between frontend and API
2. **Better Caching**: Cloudflare can optimize caching across the entire application
3. **Connection Reuse**: Persistent connections between Pages and Worker
4. **Geographic Distribution**: Both frontend and API benefit from Cloudflare's global network

## Security Considerations

1. **Same Origin**: Eliminates CORS attack vectors
2. **Internal Communication**: API calls don't traverse the public internet
3. **Unified Security Policy**: Single domain for security headers and policies
4. **Rate Limiting**: Can be applied at the Pages level

## Cost Optimization

- **Reduced Requests**: Internal service calls don't count toward external request limits
- **Shared Resources**: Pages and Worker share the same Cloudflare infrastructure
- **Efficient Scaling**: Better resource utilization across the application

## Next Steps

After successful deployment:

1. **Monitor Performance**: Use Cloudflare Analytics to track performance
2. **Set Up Alerts**: Configure monitoring for API errors and performance issues
3. **Custom Domain**: Point your custom domain to the Pages deployment
4. **CDN Optimization**: Configure Cloudflare caching rules for optimal performance

For additional help, refer to:

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Cloudflare Workers Service Bindings](https://developers.cloudflare.com/workers/configuration/bindings/services/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
