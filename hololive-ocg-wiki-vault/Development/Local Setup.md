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
2. Generate migration SQL batches from card data:
   ```bash
   node migrate.js
   ```
3. Run schema and migrations against local D1:

   ```bash
   ./run-migration.sh --env local
   ```

   Options: `--dry-run` to preview, `--start <N>` to resume from batch N.

4. _(Optional)_ Set up full-text search for faster queries:

   ```bash
   ./setup-fts.sh --local hololive-ocg-db
   ```

5. Start the local Worker API:

   ```bash
   npx wrangler dev
   ```

   API available at `http://localhost:8787`. Test:

   ```bash
   curl "http://localhost:8787/api/cards/filter?locale=en&limit=5"
   ```

6. In a separate terminal, start the Nuxt frontend:
   ```bash
   cd ..
   npm run dev
   ```

## Useful Database Commands

| Task                          | Command                                                                                   |
| ----------------------------- | ----------------------------------------------------------------------------------------- |
| Query local DB                | `npx wrangler d1 execute hololive-ocg-db --local --command="SELECT COUNT(*) FROM cards;"` |
| Re-apply schema only          | `npx wrangler d1 execute hololive-ocg-db --local --file=./schema.sql`                     |
| Resume migration from batch N | `./run-migration.sh --env local --start N`                                                |
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
