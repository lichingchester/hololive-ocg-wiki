#!/bin/bash

# Deployment script for Hololive OCG Wiki API migration

set -e

echo "🚀 Deploying Hololive OCG Wiki API..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if cloudflare directory exists
if [ ! -d "cloudflare" ]; then
    echo "❌ Error: cloudflare directory not found"
    exit 1
fi

cd cloudflare

echo "📦 Installing Cloudflare Worker dependencies..."
npm install

echo "🗄️ Setting up D1 database..."
echo "Please run the following commands manually:"
echo "  wrangler d1 create hololive-ocg-db"
echo "  # Copy the database_id from the output and update wrangler.toml"
echo "  wrangler d1 execute hololive-ocg-db --file=./schema.sql"
echo ""
echo "📊 Migrating data..."
echo "Please run the following commands manually after setting up the database:"
echo "  node migrate.js"
echo "  # Then execute each migration_batch_X.sql file:"
echo "  for i in migration_batch_*.sql; do wrangler d1 execute hololive-ocg-db --file=\"\$i\"; done"
echo ""

read -p "Have you completed the database setup and migration? (y/N): " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "Please complete the database setup first, then run this script again."
    exit 0
fi

echo "🚚 Deploying Cloudflare Worker..."
wrangler deploy

echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Note your Worker URL from the deployment output"
echo "2. Update your .env file with: NUXT_PUBLIC_API_URL=<your-worker-url>"
echo "3. Test the API endpoints"
echo "4. Update your components to use the new API-based versions"
echo ""
echo "📖 See MIGRATION_GUIDE.md for detailed instructions"
