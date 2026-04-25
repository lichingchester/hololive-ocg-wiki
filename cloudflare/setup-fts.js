#!/usr/bin/env node
/**
 * setup-fts.js — Sets up FTS5 virtual table, populates it, and creates sync triggers.
 *
 * Bypasses wrangler's --file / --command statement splitter, which incorrectly
 * breaks CREATE TRIGGER … BEGIN … END blocks on every semicolon.
 *
 * Execution strategies:
 *   --local   node:sqlite  →  .wrangler/state/v3/d1/<database_id>/db.sqlite
 *   --remote  Cloudflare D1 REST API  (requires env vars below)
 *
 * Remote env vars:
 *   CLOUDFLARE_ACCOUNT_ID   Your Cloudflare account ID
 *   CLOUDFLARE_API_TOKEN    An API token with D1 Edit permissions
 */

import { DatabaseSync } from "node:sqlite";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── CLI args ──────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const isLocal = args.includes("--local");
const isRemote = args.includes("--remote");

if (!isLocal && !isRemote) {
  console.error("Usage: node setup-fts.js [--local|--remote]");
  process.exit(1);
}

// ── Read wrangler.toml ────────────────────────────────────────────────────────

const toml = readFileSync(resolve(__dirname, "wrangler.toml"), "utf-8");
const dbId = toml.match(/database_id\s*=\s*"([^"]+)"/)?.[1];
const dbName =
  toml.match(/database_name\s*=\s*"([^"]+)"/)?.[1] ?? "hololive-ocg-db";
if (!dbId) {
  console.error("❌ database_id not found in wrangler.toml");
  process.exit(1);
}

// ── SQL definitions ───────────────────────────────────────────────────────────

const LOCALES = ["tc", "sc", "ja", "en", "id", "ko", "th", "es"];

const DROP_STATEMENTS = [
  "DROP TRIGGER IF EXISTS cards_fts_tags_update",
  "DROP TRIGGER IF EXISTS cards_fts_oshi_skills_delete",
  "DROP TRIGGER IF EXISTS cards_fts_oshi_skills_update",
  "DROP TRIGGER IF EXISTS cards_fts_delete",
  "DROP TRIGGER IF EXISTS cards_fts_update",
  "DROP TRIGGER IF EXISTS cards_fts_insert",
  "DROP TABLE IF EXISTS cards_fts",
];

const CREATE_FTS = `CREATE VIRTUAL TABLE cards_fts USING fts5(
  card_id, card_number, name, card_type, color, set_name, ability_text,
  oshi_skill_name, oshi_skill_effect, sp_oshi_skill_name, sp_oshi_skill_effect,
  tags, locale
)`;

/** One INSERT per locale keeps each statement well under D1 row limits. */
const insertForLocale = (locale) => `INSERT INTO cards_fts(
  card_id, card_number, name, card_type, color, set_name, ability_text,
  oshi_skill_name, oshi_skill_effect, sp_oshi_skill_name, sp_oshi_skill_effect,
  tags, locale
)
SELECT
  c.id, c.card_number,
  ct.name, ct.card_type, ct.color, ct.set_name, ct.ability_text,
  oshi.name, oshi.effect,
  sp_oshi.name, sp_oshi.effect,
  c.tags, ct.locale
FROM cards c
LEFT JOIN card_translations ct    ON c.id = ct.card_id       AND ct.locale       = '${locale}'
LEFT JOIN oshi_skills oshi        ON c.id = oshi.card_id     AND oshi.skill_type    = 'oshi'    AND oshi.locale    = '${locale}'
LEFT JOIN oshi_skills sp_oshi     ON c.id = sp_oshi.card_id  AND sp_oshi.skill_type = 'sp_oshi' AND sp_oshi.locale = '${locale}'
WHERE ct.locale IS NOT NULL`;

/**
 * Triggers use proper SQLite syntax (semicolon before END inside the body).
 * node:sqlite and the D1 REST API both pass the SQL to the SQLite C library
 * directly, so they handle BEGIN…END correctly — unlike wrangler's splitter.
 */
const TRIGGERS = [
  `CREATE TRIGGER cards_fts_insert AFTER INSERT ON card_translations BEGIN
    INSERT INTO cards_fts(
      card_id, card_number, name, card_type, color, set_name, ability_text,
      oshi_skill_name, oshi_skill_effect, sp_oshi_skill_name, sp_oshi_skill_effect,
      tags, locale
    )
    SELECT
      NEW.card_id, c.card_number,
      NEW.name, NEW.card_type, NEW.color, NEW.set_name, NEW.ability_text,
      oshi.name, oshi.effect, sp_oshi.name, sp_oshi.effect,
      c.tags, NEW.locale
    FROM cards c
    LEFT JOIN oshi_skills oshi    ON c.id = oshi.card_id    AND oshi.skill_type    = 'oshi'    AND oshi.locale    = NEW.locale
    LEFT JOIN oshi_skills sp_oshi ON c.id = sp_oshi.card_id AND sp_oshi.skill_type = 'sp_oshi' AND sp_oshi.locale = NEW.locale
    WHERE c.id = NEW.card_id;
  END`,

  `CREATE TRIGGER cards_fts_update AFTER UPDATE ON card_translations BEGIN
    UPDATE cards_fts SET
      name         = NEW.name,
      card_type    = NEW.card_type,
      color        = NEW.color,
      set_name     = NEW.set_name,
      ability_text = NEW.ability_text
    WHERE card_id = NEW.card_id AND locale = NEW.locale;
  END`,

  `CREATE TRIGGER cards_fts_delete AFTER DELETE ON card_translations BEGIN
    DELETE FROM cards_fts WHERE card_id = OLD.card_id AND locale = OLD.locale;
  END`,

  `CREATE TRIGGER cards_fts_oshi_skills_update AFTER INSERT ON oshi_skills BEGIN
    UPDATE cards_fts SET
      oshi_skill_name      = CASE WHEN NEW.skill_type = 'oshi'    THEN NEW.name   ELSE oshi_skill_name      END,
      oshi_skill_effect    = CASE WHEN NEW.skill_type = 'oshi'    THEN NEW.effect ELSE oshi_skill_effect    END,
      sp_oshi_skill_name   = CASE WHEN NEW.skill_type = 'sp_oshi' THEN NEW.name   ELSE sp_oshi_skill_name   END,
      sp_oshi_skill_effect = CASE WHEN NEW.skill_type = 'sp_oshi' THEN NEW.effect ELSE sp_oshi_skill_effect END
    WHERE card_id = NEW.card_id AND locale = NEW.locale;
  END`,

  `CREATE TRIGGER cards_fts_oshi_skills_delete AFTER DELETE ON oshi_skills BEGIN
    UPDATE cards_fts SET
      oshi_skill_name      = CASE WHEN OLD.skill_type = 'oshi'    THEN '' ELSE oshi_skill_name      END,
      oshi_skill_effect    = CASE WHEN OLD.skill_type = 'oshi'    THEN '' ELSE oshi_skill_effect    END,
      sp_oshi_skill_name   = CASE WHEN OLD.skill_type = 'sp_oshi' THEN '' ELSE sp_oshi_skill_name   END,
      sp_oshi_skill_effect = CASE WHEN OLD.skill_type = 'sp_oshi' THEN '' ELSE sp_oshi_skill_effect END
    WHERE card_id = OLD.card_id AND locale = OLD.locale;
  END`,

  `CREATE TRIGGER cards_fts_tags_update AFTER UPDATE ON cards BEGIN
    UPDATE cards_fts SET tags = NEW.tags WHERE card_id = NEW.id;
  END`,
];

// ── Executor: local ───────────────────────────────────────────────────────────

/**
 * Wrangler stores local D1 databases under:
 *   .wrangler/state/v3/d1/miniflare-D1DatabaseObject/<hash>.sqlite
 *
 * The hash is deterministic but opaque, so we find it by listing the directory.
 */
function findLocalDbPath() {
  const d1Dir = resolve(
    __dirname,
    ".wrangler/state/v3/d1/miniflare-D1DatabaseObject",
  );
  if (!existsSync(d1Dir)) {
    throw new Error(
      `Local D1 state directory not found:\n  ${d1Dir}\n` +
        `Run 'npx wrangler dev' once to initialise the local database first.`,
    );
  }
  const sqliteFile = readdirSync(d1Dir).find(
    (f) => f.endsWith(".sqlite") && !f.endsWith("-shm") && !f.endsWith("-wal"),
  );
  if (!sqliteFile) {
    throw new Error(
      `No SQLite file found in:\n  ${d1Dir}\n` +
        `Run 'npx wrangler dev' once to initialise the local database first.`,
    );
  }
  return join(d1Dir, sqliteFile);
}

function runLocal(statements) {
  const dbPath = findLocalDbPath();
  const db = new DatabaseSync(dbPath);
  for (const sql of statements) {
    const preview = sql.replace(/\s+/g, " ").trim().slice(0, 70);
    console.log(`  → ${preview}…`);
    db.exec(sql);
  }
  db.close();
}

// ── Executor: remote (Cloudflare D1 REST API) ─────────────────────────────────

async function runRemote(statements) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !apiToken) {
    throw new Error(
      "Remote mode requires Cloudflare credentials. Create cloudflare/.env:\n\n" +
        "  CLOUDFLARE_ACCOUNT_ID=<your-account-id>\n" +
        "  CLOUDFLARE_API_TOKEN=<token-with-D1-edit>\n\n" +
        "Find these in your Cloudflare dashboard → My Profile → API Tokens.\n" +
        "(.env is gitignored — do not commit credentials)",
    );
  }
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${dbId}/query`;
  for (const sql of statements) {
    const preview = sql.replace(/\s+/g, " ").trim().slice(0, 70);
    console.log(`  → ${preview}…`);
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql }),
    });
    const data = await resp.json();
    if (!resp.ok || !data.success) {
      throw new Error(`D1 API error: ${JSON.stringify(data.errors ?? data)}`);
    }
  }
}

// ── Verify (read-only) ────────────────────────────────────────────────────────

function verifyLocal() {
  const dbPath = findLocalDbPath();
  const db = new DatabaseSync(dbPath);
  const row = db.prepare("SELECT COUNT(*) AS fts_rows FROM cards_fts").get();
  db.close();
  console.log(`  FTS rows in table: ${row.fts_rows}`);
}

async function verifyRemote() {
  await runRemote(["SELECT COUNT(*) AS fts_rows FROM cards_fts"]);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const mode = isLocal ? "local" : "remote";
  const run = isLocal
    ? (stmts) => {
        runLocal(stmts);
        return Promise.resolve();
      }
    : runRemote;

  console.log(`\nFTS setup on: ${dbName} (${mode})\n`);

  console.log("Step 1: Dropping existing FTS components...");
  await run(DROP_STATEMENTS);

  console.log("\nStep 2: Creating FTS virtual table...");
  await run([CREATE_FTS]);

  console.log("\nStep 3: Populating FTS table (one insert per locale)...");
  for (const locale of LOCALES) {
    console.log(`  Locale: ${locale}`);
    await run([insertForLocale(locale)]);
  }

  console.log("\nStep 4: Creating sync triggers...");
  await run(TRIGGERS);

  console.log("\nStep 5: Verifying...");
  if (isLocal) {
    verifyLocal();
  } else {
    await verifyRemote();
  }

  console.log(`\n✅ FTS setup complete on ${mode}!`);
  if (isRemote) {
    console.log("\nThe following is now set up in production:");
    console.log("  - cards_fts virtual table (FTS5)");
    console.log("  - Populated with all card translations");
    console.log("  - 6 sync triggers (auto-updates FTS on card data changes)");
  }
}

main().catch((err) => {
  console.error("\n❌", err.message);
  process.exit(1);
});
