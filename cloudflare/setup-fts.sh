#!/bin/bash

# Setup FTS for Hololive OCG Wiki
# This script applies the FTS setup to your D1 database

echo "Setting up Full-Text Search (FTS) for Hololive OCG Wiki..."

# Check if wrangler is available
if ! command -v npx wrangler &> /dev/null; then
    echo "Error: wrangler CLI not found. Please install it first."
    exit 1
fi

# Parse command line arguments
DATABASE_NAME=""
ENVIRONMENT=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --local)
            ENVIRONMENT="--local"
            shift
            ;;
        --remote)
            ENVIRONMENT="--remote"
            shift
            ;;
        -*)
            echo "Unknown option: $1"
            echo "Usage: $0 [--local|--remote] <database-name>"
            echo "Example: $0 --local hololive-ocg-db"
            echo "Example: $0 --remote hololive-ocg-db"
            exit 1
            ;;
        *)
            if [ -z "$DATABASE_NAME" ]; then
                DATABASE_NAME="$1"
            else
                echo "Error: Multiple database names provided"
                echo "Usage: $0 [--local|--remote] <database-name>"
                exit 1
            fi
            shift
            ;;
    esac
done

# Check if D1 database name is provided
if [ -z "$DATABASE_NAME" ]; then
    echo "Usage: $0 [--local|--remote] <database-name>"
    echo "Examples:"
    echo "  $0 --local hololive-ocg-db    # Setup FTS on local D1 database"
    echo "  $0 --remote hololive-ocg-db   # Setup FTS on remote D1 database"
    echo "  $0 hololive-ocg-db            # Setup FTS on remote D1 database (default)"
    exit 1
fi

# Default to remote if no environment specified
if [ -z "$ENVIRONMENT" ]; then
    ENVIRONMENT="--remote"
    echo "No environment specified, defaulting to --remote"
fi

echo "Applying FTS setup to database: $DATABASE_NAME ($ENVIRONMENT)"

# Apply the FTS setup SQL
npx wrangler d1 execute "$DATABASE_NAME" $ENVIRONMENT --file=./setup-fts.sql

if [ $? -eq 0 ]; then
    echo "✅ FTS setup completed successfully on $ENVIRONMENT environment!"
    echo ""
    echo "The following has been set up:"
    echo "  - Created cards_fts virtual table"
    echo "  - Populated FTS table with existing data"
    echo "  - Created triggers to keep FTS in sync"
    echo ""
    if [ "$ENVIRONMENT" = "--local" ]; then
        echo "You should now see improved search performance in your local development environment!"
    else
        echo "You should now see improved search performance in production and no more FTS fallback messages!"
    fi
else
    echo "❌ FTS setup failed on $ENVIRONMENT environment. Please check the error messages above."
    exit 1
fi
