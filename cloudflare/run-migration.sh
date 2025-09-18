#!/bin/bash

# Hololive OCG Wiki - D1 Migration Script
# This script automates the process of running all migration batches

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="local"
DATABASE_NAME="hololive-ocg-db"
DRY_RUN=false

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    cat << EOF
Usage: $0 [OPTIONS]

OPTIONS:
    -e, --env ENVIRONMENT    Target environment: 'local' or 'production' (default: local)
    -d, --database NAME      Database name (default: hololive-ocg-db)
    -n, --dry-run           Show commands that would be executed without running them
    -h, --help              Show this help message

EXAMPLES:
    $0                                    # Run migration for local environment
    $0 --env production                   # Run migration for production
    $0 --env local --dry-run             # Show what would be executed locally
    $0 --env production --database my-db # Use custom database name for production

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -d|--database)
            DATABASE_NAME="$2"
            shift 2
            ;;
        -n|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate environment
if [[ "$ENVIRONMENT" != "local" && "$ENVIRONMENT" != "production" ]]; then
    print_error "Environment must be 'local' or 'production'"
    exit 1
fi

# Check if we're in the correct directory
if [[ ! -f "wrangler.toml" ]]; then
    print_error "wrangler.toml not found. Please run this script from the cloudflare directory."
    exit 1
fi

# Check if migration files exist
if [[ ! -d "migrations" ]]; then
    print_error "migrations directory not found. Please run 'node migrate.js' first to generate migration files."
    exit 1
fi

# Count migration files
MIGRATION_COUNT=$(find migrations -name "migration_batch_*.sql" | wc -l | tr -d ' ')

if [[ $MIGRATION_COUNT -eq 0 ]]; then
    print_error "No migration batch files found in migrations directory."
    print_warning "Please run 'node migrate.js' first to generate migration files."
    exit 1
fi

print_status "Found $MIGRATION_COUNT migration batch files"

# Build base command
if [[ "$ENVIRONMENT" == "local" ]]; then
    BASE_CMD="npx wrangler d1 execute $DATABASE_NAME --local"
    print_status "Running migration for LOCAL environment"
else
    BASE_CMD="npx wrangler d1 execute $DATABASE_NAME"
    print_status "Running migration for PRODUCTION environment"
fi

print_status "Database: $DATABASE_NAME"

if [[ "$DRY_RUN" == true ]]; then
    print_warning "DRY RUN MODE - Commands will be shown but not executed"
fi

echo ""

# Run initial migration.sql if it exists
if [[ -f "migration.sql" ]]; then
    CMD="$BASE_CMD --file=./migration.sql"
    
    if [[ "$DRY_RUN" == true ]]; then
        echo "$CMD"
    else
        print_status "Running initial migration.sql..."
        if eval "$CMD"; then
            print_success "Initial migration completed"
        else
            print_error "Initial migration failed"
            exit 1
        fi
    fi
    echo ""
fi

# Function to run a single migration batch
run_migration_batch() {
    local batch_file="$1"
    local batch_number=$(echo "$batch_file" | grep -o '[0-9]\+')
    
    CMD="$BASE_CMD --file=./migrations/$batch_file"
    
    if [[ "$DRY_RUN" == true ]]; then
        echo "$CMD"
    else
        print_status "Running migration batch $batch_number..."
        if eval "$CMD"; then
            print_success "Batch $batch_number completed"
        else
            print_error "Batch $batch_number failed"
            return 1
        fi
    fi
}

# Get sorted list of migration files
MIGRATION_FILES=($(find migrations -name "migration_batch_*.sql" -exec basename {} \; | sort -V))

print_status "Starting migration of ${#MIGRATION_FILES[@]} batch files..."
echo ""

# Track progress
COMPLETED=0
FAILED=0

# Run all migration batches
for batch_file in "${MIGRATION_FILES[@]}"; do
    if run_migration_batch "$batch_file"; then
        ((COMPLETED++))
    else
        ((FAILED++))
        if [[ "$DRY_RUN" != true ]]; then
            print_error "Migration failed at batch $batch_file"
            break
        fi
    fi
done

echo ""

if [[ "$DRY_RUN" == true ]]; then
    print_warning "DRY RUN completed. $MIGRATION_COUNT commands would be executed."
    print_warning "Run without --dry-run to execute the migration."
else
    if [[ $FAILED -eq 0 ]]; then
        print_success "All migrations completed successfully!"
        print_success "Completed: $COMPLETED/$MIGRATION_COUNT batches"
        
        # Verify data was inserted
        echo ""
        print_status "Verifying migration..."
        VERIFY_CMD="$BASE_CMD --command=\"SELECT COUNT(*) as total_cards FROM cards;\""
        print_status "Running: $VERIFY_CMD"
        eval "$VERIFY_CMD"
        
    else
        print_error "Migration completed with errors."
        print_error "Completed: $COMPLETED/$MIGRATION_COUNT batches"
        print_error "Failed: $FAILED batches"
        exit 1
    fi
fi

echo ""
print_status "Migration script completed."
