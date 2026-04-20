# Local Setup

## Prerequisites

- Node.js v22 or higher
- npm
- Git

## Frontend Setup

1. Fork the repository on GitHub
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. The site runs at `http://localhost:3000/hololive-ocg-wiki`

## Backend Setup (Cloudflare D1 + Worker)

The card data is served from a Cloudflare D1 database via a Worker API.

1. Install worker dependencies:
   ```bash
   cd cloudflare
   npm install
   ```
2. Generate migration SQL from card data:

   ```bash
   # First-time setup: generate all cards
   node migrate.js --full

   # Subsequent updates: only changed cards
   node migrate.js
   ```

3. Run schema and migrations against local D1:

   ```bash
   # First-time: reset schema + migrate (single fast command locally)
   ./run-migration.sh --reset

   # Subsequent updates: upsert only changed data
   ./run-migration.sh
   ```

   > **Local fast mode:** For local environment, all SQL is executed in a single `wrangler` command (~40s) instead of running 128+ batches separately (~6min).

   Options: `--dry-run` to preview, `--start <N>` to resume from batch N, `--reset` to drop and recreate schema.

4. Verify the migration:

   ```bash
   # Check card count (expect 2053)
   npx wrangler d1 execute hololive-ocg-db --local --yes \
     --command="SELECT COUNT(*) as total_cards FROM cards;"

   # Check translations per locale (expect 2053 per locale)
   npx wrangler d1 execute hololive-ocg-db --local --yes \
     --command="SELECT locale, COUNT(*) FROM card_translations GROUP BY locale;"
   ```

5. _(Optional)_ Set up full-text search for faster queries:

   ```bash
   ./setup-fts.sh --local hololive-ocg-db
   ```

6. Start the local Worker API:

   ```bash
   npx wrangler dev
   ```

   API available at `http://localhost:8787`. Test:

   ```bash
   curl "http://localhost:8787/api/cards/filter?locale=en&limit=5"
   ```

7. In a separate terminal, start the Nuxt frontend:
   ```bash
   cd ..
   npm run dev
   ```

## Running the Full Application Locally

To run the complete application (frontend + API + database):

1. **Terminal 1 — Worker API:**
   ```bash
   cd cloudflare
   npx wrangler dev
   ```
2. **Terminal 2 — Nuxt frontend:**
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000/hololive-ocg-wiki` in the browser.

The frontend makes API calls to the worker at `http://localhost:8787`. Card search, filtering, and detail pages all use the D1 database through the worker.

## Useful Database Commands

| Task                          | Command                                                                                   |
| ----------------------------- | ----------------------------------------------------------------------------------------- |
| Query local DB                | `npx wrangler d1 execute hololive-ocg-db --local --command="SELECT COUNT(*) FROM cards;"` |
| Re-apply schema only          | `npx wrangler d1 execute hololive-ocg-db --local --file=./schema.sql`                     |
| Full migration (all cards)    | `node migrate.js --full && ./run-migration.sh --reset`                                    |
| Diff migration (changed only) | `node migrate.js && ./run-migration.sh`                                                   |
| Resume migration from batch N | `./run-migration.sh --start N`                                                            |
| View worker logs              | `npx wrangler tail`                                                                       |

Local D1 data is persisted in `cloudflare/.wrangler/state/` and survives restarts.

## Development Workflow

### Branch Guidelines

- `main` — Production-ready code
- `develop` — Development branch for new features
- `content/content-description` — Content branches (from `develop`)
- `feature/feature-name` — Feature branches (from `develop`)
- `fix/bug-description` — Bug fix branches (from `develop`)

### Commit Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation changes
- `style:` — Code style changes (formatting, etc.)
- `refactor:` — Code changes that neither fix bugs nor add features
- `test:` — Adding or modifying tests
- `content:` — Translation content updates

### Pull Request Process

1. Ensure code adheres to project style and standards
2. Update documentation as necessary
3. Make sure all tests pass
4. Submit PR to the `develop` branch
5. Request reviews from maintainers
6. Address feedback, then maintainer merges

## Related

- [[Commands]] — Quick reference for all common commands
- [[Architecture/Overview|Architecture Overview]] — System architecture details
