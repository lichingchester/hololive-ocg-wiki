#!/bin/bash

# Setup FTS for Hololive OCG Wiki
#
# Delegates to setup-fts.js which bypasses wrangler's statement splitter
# (wrangler incorrectly splits CREATE TRIGGER … BEGIN … END on every ';').
#
# Usage:
#   ./setup-fts.sh --local hololive-ocg-db
#   ./setup-fts.sh --remote hololive-ocg-db   # needs CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_API_TOKEN

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Collect --local / --remote flag (database name arg is ignored; wrangler.toml is used)
FLAG=""
for arg in "$@"; do
  case "$arg" in
    --local)  FLAG="--local"  ;;
    --remote) FLAG="--remote" ;;
  esac
done

if [[ -z "$FLAG" ]]; then
  echo "Usage: $0 [--local|--remote] [database-name]"
  echo "  $0 --local hololive-ocg-db"
  echo "  $0 --remote hololive-ocg-db"
  exit 1
fi

ENV_FILE="$SCRIPT_DIR/.env"
if [[ -f "$ENV_FILE" ]]; then
  node --no-warnings=ExperimentalWarning --env-file="$ENV_FILE" "$SCRIPT_DIR/setup-fts.js" "$FLAG"
else
  node --no-warnings=ExperimentalWarning "$SCRIPT_DIR/setup-fts.js" "$FLAG"
fi
