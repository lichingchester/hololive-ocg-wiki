#!/bin/bash

# Setup FTS for Hololive OCG Wiki
# This script applies the FTS setup to your D1 database

echo "Setting up Full-Text Search (FTS) for Hololive OCG Wiki..."

# Check if wrangler is available
if ! command -v npx wrangler &> /dev/null; then
    echo "Error: wrangler CLI not found. Please install it first."
    exit 1
fi

# Check if D1 database name is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <database-name>"
    echo "Example: $0 hololive-ocg-wiki"
    exit 1
fi

DATABASE_NAME="$1"

echo "Applying FTS setup to database: $DATABASE_NAME"

# Apply the FTS setup SQL
npx wrangler d1 execute "$DATABASE_NAME" --file=./setup-fts.sql

if [ $? -eq 0 ]; then
    echo "✅ FTS setup completed successfully!"
    echo ""
    echo "The following has been set up:"
    echo "  - Created cards_fts virtual table"
    echo "  - Populated FTS table with existing data"
    echo "  - Created triggers to keep FTS in sync"
    echo ""
    echo "You should now see improved search performance and no more FTS fallback messages!"
else
    echo "❌ FTS setup failed. Please check the error messages above."
    exit 1
fi
