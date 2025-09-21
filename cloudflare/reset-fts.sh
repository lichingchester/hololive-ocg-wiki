#!/bin/bash

# Reset FTS for Hololive OCG Wiki
# This script removes existing FTS components and recreates them

echo "Resetting Full-Text Search (FTS) for Hololive OCG Wiki..."

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

echo "Resetting FTS for database: $DATABASE_NAME"

# Step 1: Drop existing triggers
echo "Step 1: Dropping existing FTS triggers..."
npx wrangler d1 execute "$DATABASE_NAME" --command="DROP TRIGGER cards_fts_insert;"
npx wrangler d1 execute "$DATABASE_NAME" --command="DROP TRIGGER cards_fts_update;"
npx wrangler d1 execute "$DATABASE_NAME" --command="DROP TRIGGER cards_fts_delete;"
npx wrangler d1 execute "$DATABASE_NAME" --command="DROP TRIGGER cards_fts_oshi_skills_update;"
npx wrangler d1 execute "$DATABASE_NAME" --command="DROP TRIGGER cards_fts_tags_update;"

# Step 2: Drop existing FTS table
echo "Step 2: Dropping existing FTS table..."
npx wrangler d1 execute "$DATABASE_NAME" --command="DROP TABLE cards_fts;"

# Step 3: Apply the FTS setup SQL
echo "Step 3: Creating new FTS components..."
npx wrangler d1 execute "$DATABASE_NAME" --file=./setup-fts.sql

if [ $? -eq 0 ]; then
    echo "✅ FTS reset completed successfully!"
    echo ""
    echo "The following has been set up:"
    echo "  - Recreated cards_fts virtual table"
    echo "  - Populated FTS table with existing data"
    echo "  - Recreated triggers to keep FTS in sync"
    echo ""
    echo "You should now see improved search performance and no more FTS fallback messages!"
else
    echo "❌ FTS reset failed. Please check the error messages above."
    exit 1
fi
