#!/usr/bin/env node
/**
 * Generate a status.json diff between an old cards.json and the current one.
 *
 * Usage:
 *   node diff-status.js --old /path/to/old-cards.json
 *
 * Output:
 *   Writes ../public/status.json with new/changed/qaUpdated/removed/skipped
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── CLI ────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const oldFlagIdx = args.indexOf("--old");
if (oldFlagIdx === -1 || !args[oldFlagIdx + 1]) {
  console.error("Usage: node diff-status.js --old /path/to/old-cards.json");
  process.exit(1);
}
const oldCardsPath = path.resolve(args[oldFlagIdx + 1]);
if (!fs.existsSync(oldCardsPath)) {
  console.error(`File not found: ${oldCardsPath}`);
  process.exit(1);
}

// ── Paths ──────────────────────────────────────────────────────────────────
const newCardsPath = path.join(__dirname, "..", "data", "cards.json");
const statusOutputPath = path.join(__dirname, "..", "public", "status.json");

// ── Hashing (same as migrate.js) ───────────────────────────────────────────
function stripTranslationMeta(t) {
  if (!t) return t;
  return Object.fromEntries(
    Object.entries(t).filter(([k]) => !k.startsWith("_")),
  );
}

function normalizeTranslations(card) {
  if (!card.translations) return card;
  return {
    ...card,
    translations: Object.fromEntries(
      Object.entries(card.translations).map(([locale, t]) => [
        locale,
        stripTranslationMeta(t),
      ]),
    ),
  };
}

function hashCard(card) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(normalizeTranslations(card)))
    .digest("hex");
}

function hashCardWithoutQA(card) {
  const normalized = normalizeTranslations(card);
  const stripped = {
    ...normalized,
    translations: Object.fromEntries(
      Object.entries(normalized.translations || {}).map(([locale, t]) => {
        if (!t) return [locale, t];
        const { qa_items: _qa, ...rest } = t;
        return [locale, rest];
      }),
    ),
  };
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(stripped))
    .digest("hex");
}

function getCardName(card) {
  return card.translations?.en?.name || card.translations?.ja?.name || null;
}

// ── Validation (same rules as migrate.js) ─────────────────────────────────
const REQUIRED_FIELDS = ["cardTypeCode", "rarityCode", "imagePath", "imageUrl"];

function isValid(card) {
  return REQUIRED_FIELDS.every((f) => card[f] != null && card[f] !== "");
}

// ── Load cards ─────────────────────────────────────────────────────────────
console.log(`Loading old cards from: ${oldCardsPath}`);
const oldCards = JSON.parse(fs.readFileSync(oldCardsPath, "utf8"));

console.log(`Loading new cards from: ${newCardsPath}`);
const newCards = JSON.parse(fs.readFileSync(newCardsPath, "utf8"));

// ── Build lookup maps ──────────────────────────────────────────────────────
/** @param {any[]} cards */
function buildHashMap(cards) {
  const map = {};
  cards.forEach((card) => {
    map[card.id] = {
      fullHash: hashCard(card),
      noQaHash: hashCardWithoutQA(card),
      cardNumber: card.cardNumber || null,
      imagePath: card.imagePath || null,
      name: getCardName(card),
      card,
    };
  });
  return map;
}

const oldMap = buildHashMap(oldCards);
const newMap = buildHashMap(newCards);

// ── Compute diff ───────────────────────────────────────────────────────────
const added = []; // in new, not in old
const changed = []; // in both, content changed (excl. QA)
const qaUpdated = []; // in both, only QA changed
const removed = []; // in old, not in new
const skipped = []; // in new, missing required fields

const validNewIds = new Set();

for (const [id, newEntry] of Object.entries(newMap)) {
  if (!isValid(newEntry.card)) {
    const missing = REQUIRED_FIELDS.filter(
      (f) => newEntry.card[f] == null || newEntry.card[f] === "",
    );
    skipped.push({
      id,
      cardNumber: newEntry.cardNumber,
      missingFields: missing,
    });
    continue;
  }
  validNewIds.add(id);

  const oldEntry = oldMap[id];
  if (!oldEntry) {
    added.push({
      id,
      cardNumber: newEntry.cardNumber,
      imagePath: newEntry.imagePath,
      name: newEntry.name,
    });
  } else if (oldEntry.fullHash !== newEntry.fullHash) {
    if (oldEntry.noQaHash !== newEntry.noQaHash) {
      changed.push({
        id,
        cardNumber: newEntry.cardNumber,
        imagePath: newEntry.imagePath,
        name: newEntry.name,
      });
    } else {
      qaUpdated.push({
        id,
        cardNumber: newEntry.cardNumber,
        imagePath: newEntry.imagePath,
        name: newEntry.name,
      });
    }
  }
}

for (const [id, oldEntry] of Object.entries(oldMap)) {
  if (!newMap[id]) {
    removed.push({
      id,
      cardNumber: oldEntry.cardNumber,
      imagePath: oldEntry.imagePath,
      name: oldEntry.name,
    });
  }
}

// ── Natural sort by card number ────────────────────────────────────────────
function byCardNumber(a, b) {
  const na = a.cardNumber || `~${a.id}`;
  const nb = b.cardNumber || `~${b.id}`;
  return na.localeCompare(nb, undefined, {
    numeric: true,
    sensitivity: "base",
  });
}
added.sort(byCardNumber);
changed.sort(byCardNumber);
qaUpdated.sort(byCardNumber);
removed.sort(byCardNumber);
skipped.sort((a, b) =>
  String(a.id).localeCompare(String(b.id), undefined, { numeric: true }),
);

// ── Summary ────────────────────────────────────────────────────────────────
const validCount = Object.values(newMap).filter((e) => isValid(e.card)).length;

console.log("\n── Diff Summary ──────────────────────────────────────────────");
console.log(`  Old source:   ${oldCards.length} cards`);
console.log(`  New source:   ${newCards.length} cards`);
console.log(`  Valid in DB:  ${validCount}`);
console.log(`  New:          ${added.length}`);
console.log(`  Changed:      ${changed.length}`);
console.log(`  FAQ Updated:  ${qaUpdated.length}`);
console.log(`  Removed:      ${removed.length}`);
console.log(`  Skipped:      ${skipped.length}`);
console.log("──────────────────────────────────────────────────────────────\n");

// ── Write status.json ──────────────────────────────────────────────────────
const status = {
  generatedAt: new Date().toISOString(),
  mode: "diff",
  source: {
    total: newCards.length,
    valid: validCount,
  },
  skipped,
  diff: {
    new: added,
    changed,
    qaUpdated,
    removed,
  },
};

fs.writeFileSync(statusOutputPath, JSON.stringify(status, null, 2));
console.log(`Written: ${statusOutputPath}`);
