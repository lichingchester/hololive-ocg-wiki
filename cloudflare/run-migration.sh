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
START_BATCH=0
RESET_SCHEMA=false

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
    -s, --start BATCH        Start from specific batch number (default: 0)
    -r, --reset             Reset schema (DROP + CREATE tables) before migration.
                            Only needed for schema changes or first-time setup.
    -n, --dry-run           Show commands that would be executed without running them
    -h, --help              Show this help message

EXAMPLES:
    $0                                    # Run upsert migration for local environment
    $0 --env production                   # Run upsert migration for production
    $0 --reset                            # Reset schema + full migration (local)
    $0 --env production --reset           # Reset schema + full migration (production)
    $0 --env local --dry-run             # Show what would be executed locally
    $0 --env production --database my-db # Use custom database name for production
    $0 --env production --start 50       # Resume migration from batch 50

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
        -s|--start)
            START_BATCH="$2"
            shift 2
            ;;
        -r|--reset)
            RESET_SCHEMA=true
            shift
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

# Validate start batch number
if ! [[ "$START_BATCH" =~ ^[0-9]+$ ]]; then
    print_error "Start batch must be a non-negative integer"
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
    BASE_CMD="npx wrangler d1 execute $DATABASE_NAME --local --yes"
    print_status "Running migration for LOCAL environment"
else
    BASE_CMD="npx wrangler d1 execute $DATABASE_NAME --remote --yes"
    print_status "Running migration for PRODUCTION environment"
fi

print_status "Database: $DATABASE_NAME"

if [[ $START_BATCH -gt 1 ]]; then
    print_warning "Starting from batch $START_BATCH (skipping batches 1-$((START_BATCH-1)))"
fi

if [[ "$DRY_RUN" == true ]]; then
    print_warning "DRY RUN MODE - Commands will be shown but not executed"
fi

echo ""

# Step 1: Optionally reset schema (DROP + CREATE tables)
# Only when --reset flag is used (for schema changes or first-time setup)
if [[ "$RESET_SCHEMA" == true ]]; then
    if [[ ! -f "schema.sql" ]]; then
        print_error "schema.sql not found. Cannot reset database schema."
        exit 1
    fi

    CMD="$BASE_CMD --file=./schema.sql"

    if [[ "$DRY_RUN" == true ]]; then
        echo "[SCHEMA RESET] $CMD"
    else
        print_status "Resetting schema (DROP + CREATE tables)..."
        if eval "$CMD"; then
            print_success "Schema reset completed"
        else
            print_error "Schema reset failed"
            exit 1
        fi
    fi
    echo ""
elif [[ $START_BATCH -gt 0 ]]; then
    print_warning "Resuming from batch $START_BATCH"
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

# ── Local fast mode: execute migration.sql in a single command ──────────────
# Local D1 is just SQLite — no API batch limits, no need for 128 separate
# wrangler invocations. This is ~50x faster than the batched approach.
if [[ "$ENVIRONMENT" == "local" && "$DRY_RUN" != true && $START_BATCH -eq 0 ]]; then
    if [[ -f "migration.sql" ]]; then
        print_status "Local fast mode: executing migration.sql in a single command..."
        CMD="$BASE_CMD --file=./migration.sql"
        if eval "$CMD"; then
            print_success "All migrations completed successfully!"
            print_success "Executed migration.sql ($MIGRATION_COUNT batches worth of statements)"
        else
            print_error "Single-file migration failed. Falling back to batch mode..."
            FALLBACK_TO_BATCH=true
        fi
    else
        print_warning "migration.sql not found, using batch mode"
        FALLBACK_TO_BATCH=true
    fi
else
    FALLBACK_TO_BATCH=true
fi

# ── Batch mode: for production or fallback ──────────────────────────────────
if [[ "${FALLBACK_TO_BATCH:-false}" == true ]]; then

# Get sorted list of migration files
MIGRATION_FILES=($(find migrations -name "migration_batch_*.sql" -exec basename {} \; | sort -V))

print_status "Starting migration of ${#MIGRATION_FILES[@]} batch files..."
echo ""

# Track progress
COMPLETED=0
FAILED=0

# Run all migration batches
for batch_file in "${MIGRATION_FILES[@]}"; do
    batch_number=$(echo "$batch_file" | grep -o '[0-9]\+')
    
    # Skip batches before the start batch
    if [[ $batch_number -lt $START_BATCH ]]; then
        continue
    fi
    
    if run_migration_batch "$batch_file"; then
        ((COMPLETED++))
        # Show progress
        if [[ "$DRY_RUN" != true ]]; then
            TOTAL_TO_RUN=$((MIGRATION_COUNT - START_BATCH))
            echo -e "  ${BLUE}Progress: $COMPLETED/$TOTAL_TO_RUN${NC}"
        fi
    else
        ((FAILED++))
        if [[ "$DRY_RUN" != true ]]; then
            print_error "Migration failed at batch $batch_file"
            print_status "You can resume from this batch with: $0 --env $ENVIRONMENT --start $batch_number"
            break
        fi
    fi
done

echo ""

if [[ "$DRY_RUN" == true ]]; then
    # Count how many batches would be executed
    BATCHES_TO_RUN=0
    for batch_file in "${MIGRATION_FILES[@]}"; do
        batch_number=$(echo "$batch_file" | grep -o '[0-9]\+')
        if [[ $batch_number -ge $START_BATCH ]]; then
            ((BATCHES_TO_RUN++))
        fi
    done
    
    print_warning "DRY RUN completed. $BATCHES_TO_RUN commands would be executed (starting from batch $START_BATCH)."
    print_warning "Run without --dry-run to execute the migration."
else
    if [[ $FAILED -eq 0 ]]; then
        print_success "All migrations completed successfully!"
        print_success "Completed: $COMPLETED/$MIGRATION_COUNT batches"
    else
        print_error "Migration completed with errors."
        print_error "Completed: $COMPLETED/$MIGRATION_COUNT batches"
        print_error "Failed: $FAILED batches"
        exit 1
    fi
fi

fi  # end FALLBACK_TO_BATCH

# ── Verify ──────────────────────────────────────────────────────────────────
if [[ "$DRY_RUN" != true ]]; then
    echo ""
    print_status "Verifying migration..."
    VERIFY_CMD="$BASE_CMD --command=\"SELECT COUNT(*) as total_cards FROM cards;\""
    print_status "Running: $VERIFY_CMD"
    eval "$VERIFY_CMD"
fi

echo ""
print_status "Migration script completed."
