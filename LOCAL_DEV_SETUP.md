# Local Development Environment Setup

This guide walks you through setting up the full local development environment, including the Nuxt frontend and the Cloudflare Worker + D1 database backend.

---

## Prerequisites

| Tool    | Version           | Notes                      |
| ------- | ----------------- | -------------------------- |
| Node.js | ≥ 22              | Check with `node -v`       |
| npm     | bundled with Node | Check with `npm -v`        |
| Git     | any recent        | Check with `git --version` |

---

## 1. Clone & Install Frontend Dependencies

```bash
git clone https://github.com/lichingchester/hololive-ocg-wiki.git
cd hololive-ocg-wiki
npm install
```

The `postinstall` hook runs `nuxt prepare` automatically.

---

## 2. Set Up the Backend (Cloudflare Worker + D1)

All backend commands are run from the `cloudflare/` directory.

### 2a. Install Worker Dependencies

```bash
cd cloudflare
npm install
```

### 2b. Configure wrangler

Copy the example config and fill in your D1 credentials (only needed for remote/production deployments — local dev works without real IDs):

```bash
cp wrangler.toml.example wrangler.toml
```

For local development the default values in `wrangler.toml.example` are sufficient. The local D1 database is created automatically on first use.

### 2c. Apply the Database Schema

```bash
npx wrangler d1 execute hololive-ocg-db --local --file=./schema.sql
```

This creates the local SQLite-backed D1 database (persisted in `cloudflare/.wrangler/state/`).

### 2d. Generate & Run Data Migrations

Generate SQL migration batches from the card data JSON:

```bash
node migrate.js
```

Then apply them to the local database:

```bash
./run-migration.sh --env local
```

> **Tip:** Preview what will run without executing: `./run-migration.sh --env local --dry-run`  
> **Tip:** Resume from a specific batch if interrupted: `./run-migration.sh --env local --start <N>`

### 2e. (Optional but Recommended) Set Up Full-Text Search

FTS provides ~10x faster search and relevance ranking:

```bash
./setup-fts.sh --local hololive-ocg-db
```

### 2f. Verify the Database

```bash
npx wrangler d1 execute hololive-ocg-db --local --command="SELECT COUNT(*) FROM cards;"
```

---

## 3. Run the Local Worker API

```bash
# Still inside cloudflare/
npx wrangler dev
```

The API starts at `http://localhost:8787`. Verify it works:

```bash
curl "http://localhost:8787/api/cards/filter?locale=en&limit=5"
```

---

## 4. Run the Frontend

Open a **new terminal** and return to the project root:

```bash
cd /path/to/hololive-ocg-wiki
npm run dev
```

The Nuxt app starts at `http://localhost:3000`.

---

## Running Both Servers (Summary)

| Terminal   | Directory     | Command            |
| ---------- | ------------- | ------------------ |
| Terminal 1 | `cloudflare/` | `npx wrangler dev` |
| Terminal 2 | project root  | `npm run dev`      |

---

## Useful Commands

| Task                          | Command                                                                                   |
| ----------------------------- | ----------------------------------------------------------------------------------------- |
| Query local DB                | `npx wrangler d1 execute hololive-ocg-db --local --command="SELECT COUNT(*) FROM cards;"` |
| Re-apply schema               | `npx wrangler d1 execute hololive-ocg-db --local --file=./schema.sql`                     |
| Resume migration from batch N | `./run-migration.sh --env local --start N`                                                |
| Rebuild FTS index             | `./setup-fts.sh --local hololive-ocg-db`                                                  |
| Monitor worker logs           | `npx wrangler tail`                                                                       |

---

## Troubleshooting

**Cards not loading / API errors**  
Make sure `npx wrangler dev` is running in `cloudflare/` before opening the frontend.

**Empty card list**  
The migration may not have run. Repeat steps 2c–2d. Check the card count with the query above.

**`wrangler: command not found`**  
Use `npx wrangler` instead, or install globally: `npm install -g wrangler`.

**Port conflicts**

- Frontend default: `3000` — change with `npm run dev -- --port <N>`
- Worker default: `8787` — change in `wrangler.toml` under `[dev] port`

**Migration interrupted mid-way**  
Find the last successful batch number in the output, then resume:

```bash
./run-migration.sh --env local --start <last_successful_batch + 1>
```
