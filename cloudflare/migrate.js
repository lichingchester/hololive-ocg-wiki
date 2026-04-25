#!/usr/bin/env node

/**
 * Migration script to populate D1 database from cards.json
 *
 * Features:
 *   - Upsert-based: INSERT ... ON CONFLICT DO UPDATE for cards table,
 *     per-card DELETE + re-INSERT for child tables
 *   - Diff-based: Only generates SQL for new/changed/removed cards
 *     using a hash map (cards_hash.json)
 *   - Write estimation: Warns when approaching D1 free-tier limits
 *
 * Usage:
 *   node migrate.js              # Diff migration (only changed cards)
 *   node migrate.js --full       # Full migration (all cards)
 *   node migrate.js --strict     # Abort if estimated writes > 80% of limit
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";

// ── CLI flags ──────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const FULL_MODE = args.includes("--full");
const STRICT_MODE = args.includes("--strict");

// D1 free-tier daily write limit
const D1_WRITE_LIMIT = 100_000;
const WRITE_WARN_THRESHOLD = 0.8; // 80%

// ── Helpers ────────────────────────────────────────────────────────────────
function escapeSQL(str) {
  if (str == null) return "NULL";
  return `'${String(str).replace(/'/g, "''")}'`;
}

function escapeJSONArray(arr) {
  if (!arr) return "NULL";
  return escapeSQL(JSON.stringify(arr));
}

function hashCard(card) {
  const json = JSON.stringify(card);
  return crypto.createHash("sha256").update(json).digest("hex");
}

// ── File paths ─────────────────────────────────────────────────────────────
const cloudflareDir = process.cwd();
const cardsPath = path.join(cloudflareDir, "..", "data", "cards.json");
const hashPath = path.join(cloudflareDir, "cards_hash.json");
const migrationsDir = path.join(cloudflareDir, "migrations");

// ── Cleanup old migration files ────────────────────────────────────────────
function cleanupOldMigrations() {
  console.log("Cleaning up old migration files...");

  const files = fs.readdirSync(cloudflareDir);
  files.forEach((file) => {
    if (file === "migration.sql" || file.startsWith("migration_batch_")) {
      fs.unlinkSync(path.join(cloudflareDir, file));
    }
  });

  if (fs.existsSync(migrationsDir)) {
    fs.readdirSync(migrationsDir).forEach((file) => {
      fs.unlinkSync(path.join(migrationsDir, file));
    });
  } else {
    fs.mkdirSync(migrationsDir);
  }

  console.log("Cleanup completed.");
}

// ── Diff detection ─────────────────────────────────────────────────────────
function loadPreviousHashes() {
  if (!fs.existsSync(hashPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(hashPath, "utf8"));
  } catch {
    console.warn("Warning: Could not parse cards_hash.json, falling back to full migration.");
    return null;
  }
}

function saveHashes(cards) {
  const hashes = {};
  cards.forEach((card) => {
    hashes[card.id] = hashCard(card);
  });
  fs.writeFileSync(hashPath, JSON.stringify(hashes, null, 2));
  return hashes;
}

function diffCards(cards, prevHashes) {
  const newCards = [];
  const changedCards = [];
  const currentIds = new Set();

  cards.forEach((card) => {
    currentIds.add(card.id);
    const currentHash = hashCard(card);
    if (!prevHashes[card.id]) {
      newCards.push(card);
    } else if (prevHashes[card.id] !== currentHash) {
      changedCards.push(card);
    }
  });

  const removedIds = Object.keys(prevHashes).filter((id) => !currentIds.has(id));

  return { newCards, changedCards, removedIds };
}

// ── SQL generation for a single card ───────────────────────────────────────
function generateCardStatements(card, artIdBase) {
  const statements = [];

  // Upsert main card
  statements.push(`
    INSERT INTO cards (
      id, card_number, card_type_code, color_codes, rarity_code,
      bloom_level_code, image_path, image_url, hp, life, baton_touch_count,
      baton_touch_types, illustrator, card_sets, tags
    ) VALUES (
      ${escapeSQL(card.id)},
      ${escapeSQL(card.cardNumber || "null")},
      ${escapeSQL(card.cardTypeCode)},
      ${escapeJSONArray(card.colorCodes || [])},
      ${escapeSQL(card.rarityCode)},
      ${card.bloomLevelCode ? escapeSQL(card.bloomLevelCode) : "NULL"},
      ${escapeSQL(card.imagePath)},
      ${escapeSQL(card.imageUrl)},
      ${card.hp || "NULL"},
      ${card.life || "NULL"},
      ${card.batonTouchCount || "NULL"},
      ${card.batonTouchTypes ? escapeJSONArray(card.batonTouchTypes) : "NULL"},
      ${card.illustrator ? escapeSQL(card.illustrator) : "NULL"},
      ${card.cardSets ? escapeJSONArray(card.cardSets) : "NULL"},
      ${card.tags ? escapeJSONArray(card.tags) : "NULL"}
    ) ON CONFLICT(id) DO UPDATE SET
      card_number = excluded.card_number,
      card_type_code = excluded.card_type_code,
      color_codes = excluded.color_codes,
      rarity_code = excluded.rarity_code,
      bloom_level_code = excluded.bloom_level_code,
      image_path = excluded.image_path,
      image_url = excluded.image_url,
      hp = excluded.hp,
      life = excluded.life,
      baton_touch_count = excluded.baton_touch_count,
      baton_touch_types = excluded.baton_touch_types,
      illustrator = excluded.illustrator,
      card_sets = excluded.card_sets,
      tags = excluded.tags,
      updated_at = CURRENT_TIMESTAMP;
  `);

  // Delete child rows for this card (CASCADE from arts handles art_translations,
  // CASCADE from keywords handles keyword_translations)
  statements.push(`DELETE FROM card_translations WHERE card_id = ${escapeSQL(card.id)};`);
  statements.push(`DELETE FROM oshi_skills WHERE card_id = ${escapeSQL(card.id)};`);
  statements.push(`DELETE FROM arts WHERE card_id = ${escapeSQL(card.id)};`);
  statements.push(`DELETE FROM keywords WHERE card_id = ${escapeSQL(card.id)};`);
  statements.push(`DELETE FROM keyword_translations WHERE card_id = ${escapeSQL(card.id)};`);
  statements.push(`DELETE FROM qa_items WHERE card_id = ${escapeSQL(card.id)};`);

  // ── Arts (core data) ──
  let cardArtsData = [];
  if (card.arts && Array.isArray(card.arts)) {
    cardArtsData = card.arts;
  } else {
    const firstTranslation = Object.values(card.translations || {})[0];
    if (firstTranslation?.arts && Array.isArray(firstTranslation.arts)) {
      cardArtsData = firstTranslation.arts.map((art) => ({
        costCount: art.costCount,
        costTypes: art.costTypes,
        damage: art.damage,
        isPlus: art.isPlus,
        specialTargets: art.specialTargets,
        specialValues: art.specialValues,
      }));
    }
  }

  const cardArtIds = [];
  cardArtsData.forEach((art, artIndex) => {
    // Deterministic art ID: base + index (supports up to 10 arts per card)
    const artId = artIdBase + artIndex;
    cardArtIds.push(artId);

    statements.push(`
      INSERT OR REPLACE INTO arts (
        id, card_id, cost_count, cost_types, damage, is_plus, special_targets, special_values
      ) VALUES (
        ${artId},
        ${escapeSQL(card.id)},
        ${art.costCount || "NULL"},
        ${art.costTypes ? escapeJSONArray(art.costTypes) : "NULL"},
        ${art.damage || "NULL"},
        ${art.isPlus ? "TRUE" : "FALSE"},
        ${art.specialTargets ? escapeJSONArray(art.specialTargets) : "NULL"},
        ${art.specialValues ? escapeJSONArray(art.specialValues) : "NULL"}
      );
    `);
  });

  // ── Per-locale child rows ──
  Object.entries(card.translations || {}).forEach(([locale, translation]) => {
    if (!translation) return;

    // Card translations
    statements.push(`
      INSERT INTO card_translations (
        card_id, locale, name, card_type, color, rarity, set_name, ability_text, extra
      ) VALUES (
        ${escapeSQL(card.id)},
        ${escapeSQL(locale)},
        ${translation.name ? escapeSQL(translation.name) : "NULL"},
        ${translation.cardType ? escapeSQL(translation.cardType) : "NULL"},
        ${translation.color ? escapeSQL(translation.color) : "NULL"},
        ${translation.rarity ? escapeSQL(translation.rarity) : "NULL"},
        ${translation.set ? escapeSQL(translation.set) : "NULL"},
        ${translation.abilityText ? escapeSQL(translation.abilityText) : "NULL"},
        ${translation.extra ? escapeSQL(translation.extra) : "NULL"}
      );
    `);

    // Oshi skills
    if (translation.oshiSkill) {
      statements.push(`
        INSERT INTO oshi_skills (
          card_id, locale, skill_type, cost, timing_code, name, effect
        ) VALUES (
          ${escapeSQL(card.id)},
          ${escapeSQL(locale)},
          'oshi',
          ${translation.oshiSkill.cost || card.oshiSkill?.cost || "NULL"},
          ${
            translation.oshiSkill.timingCode || card.oshiSkill?.timingCode
              ? escapeSQL(translation.oshiSkill.timingCode || card.oshiSkill?.timingCode)
              : "NULL"
          },
          ${translation.oshiSkill.name ? escapeSQL(translation.oshiSkill.name) : "NULL"},
          ${translation.oshiSkill.effect ? escapeSQL(translation.oshiSkill.effect) : "NULL"}
        );
      `);
    }

    // SP Oshi skills
    if (translation.spOshiSkill) {
      statements.push(`
        INSERT INTO oshi_skills (
          card_id, locale, skill_type, cost, timing_code, name, effect
        ) VALUES (
          ${escapeSQL(card.id)},
          ${escapeSQL(locale)},
          'sp_oshi',
          ${translation.spOshiSkill.cost || card.spOshiSkill?.cost || "NULL"},
          ${
            translation.spOshiSkill.timingCode || card.spOshiSkill?.timingCode
              ? escapeSQL(translation.spOshiSkill.timingCode || card.spOshiSkill?.timingCode)
              : "NULL"
          },
          ${translation.spOshiSkill.name ? escapeSQL(translation.spOshiSkill.name) : "NULL"},
          ${translation.spOshiSkill.effect ? escapeSQL(translation.spOshiSkill.effect) : "NULL"}
        );
      `);
    }

    // QA items
    if (translation.qa_items && Array.isArray(translation.qa_items)) {
      translation.qa_items.forEach((qa) => {
        statements.push(`
          INSERT INTO qa_items (
            card_id, locale, title, question, answer, related_cards_html, related_card_numbers
          ) VALUES (
            ${escapeSQL(card.id)},
            ${escapeSQL(locale)},
            ${escapeSQL(qa.title)},
            ${escapeSQL(qa.question)},
            ${escapeSQL(qa.answer)},
            ${qa.related_cards?.raw_html ? escapeSQL(qa.related_cards.raw_html) : "NULL"},
            ${qa.related_cards?.card_number ? escapeJSONArray(qa.related_cards.card_number) : "NULL"}
          );
        `);
      });
    }

    // Keyword translations
    if (translation.keyword) {
      statements.push(`
        INSERT INTO keyword_translations (
          card_id, locale, name, effect
        ) VALUES (
          ${escapeSQL(card.id)},
          ${escapeSQL(locale)},
          ${translation.keyword.name ? escapeSQL(translation.keyword.name) : "NULL"},
          ${translation.keyword.effect ? escapeSQL(translation.keyword.effect) : "NULL"}
        );
      `);
    }

    // Art translations
    if (translation.arts && Array.isArray(translation.arts) && cardArtIds.length > 0) {
      translation.arts.forEach((art, artIndex) => {
        if (artIndex < cardArtIds.length && (art.name || art.effect)) {
          statements.push(`
            INSERT INTO art_translations (
              art_id, locale, name, effect
            ) VALUES (
              ${cardArtIds[artIndex]},
              ${escapeSQL(locale)},
              ${art.name ? escapeSQL(art.name) : "NULL"},
              ${art.effect ? escapeSQL(art.effect) : "NULL"}
            );
          `);
        }
      });
    }
  });

  // Keywords (top-level)
  if (card.keyword) {
    statements.push(`
      INSERT INTO keywords (card_id, type, type_code) VALUES (
        ${escapeSQL(card.id)},
        ${card.keyword.type ? escapeSQL(card.keyword.type) : "NULL"},
        ${card.keyword.typeCode ? escapeSQL(card.keyword.typeCode) : "NULL"}
      );
    `);
  }

  return statements;
}

// ── Write estimation ───────────────────────────────────────────────────────
function estimateWrites(cards) {
  let total = 0;
  cards.forEach((card) => {
    total += 1; // cards upsert
    total += 6; // DELETE statements for child tables

    // Arts inserts
    if (card.arts && Array.isArray(card.arts)) {
      total += card.arts.length;
    } else {
      const firstTranslation = Object.values(card.translations || {})[0];
      if (firstTranslation?.arts) total += firstTranslation.arts.length;
    }

    const locales = Object.keys(card.translations || {});
    locales.forEach((locale) => {
      const t = card.translations[locale];
      if (!t) return;
      total += 1; // card_translations
      if (t.oshiSkill) total += 1;
      if (t.spOshiSkill) total += 1;
      if (t.qa_items) total += t.qa_items.length;
      if (t.keyword) total += 1;
      if (t.arts) total += t.arts.filter((a) => a.name || a.effect).length;
    });

    if (card.keyword) total += 1;
  });
  return total;
}

// ── Main ───────────────────────────────────────────────────────────────────
const cardsData = JSON.parse(fs.readFileSync(cardsPath, "utf8"));
console.log(`Loaded ${cardsData.length} cards from cards.json`);

// Deterministic art ID base: cardId * 10 (supports up to 10 arts per card)
function getArtIdBase(cardId) {
  return parseInt(cardId, 10) * 10;
}

// Determine which cards to process
let cardsToProcess = [];
let removedIds = [];
let mode = "full";

const prevHashes = FULL_MODE ? null : loadPreviousHashes();

if (prevHashes && !FULL_MODE) {
  const diff = diffCards(cardsData, prevHashes);
  cardsToProcess = [...diff.newCards, ...diff.changedCards];
  removedIds = diff.removedIds;
  mode = "diff";

  console.log(`\nDiff mode:`);
  console.log(`  New cards:     ${diff.newCards.length}`);
  console.log(`  Changed cards: ${diff.changedCards.length}`);
  console.log(`  Removed cards: ${removedIds.length}`);
  console.log(`  Unchanged:     ${cardsData.length - diff.newCards.length - diff.changedCards.length}`);

  if (cardsToProcess.length === 0 && removedIds.length === 0) {
    console.log("\nNo changes detected. Nothing to migrate.");
    console.log("Use --full to force a full migration.");
    // Still update the hash file in case cards.json was reordered
    saveHashes(cardsData);
    process.exit(0);
  }
} else {
  cardsToProcess = cardsData;
  if (FULL_MODE) {
    console.log("\nFull mode (--full flag).");
  } else {
    console.log("\nNo previous hash file found. Running full migration.");
  }
}

// ── Write estimation check ─────────────────────────────────────────────────
const estimatedWrites = estimateWrites(cardsToProcess) + removedIds.length;
const writePercent = ((estimatedWrites / D1_WRITE_LIMIT) * 100).toFixed(1);

console.log(`\nEstimated writes: ${estimatedWrites.toLocaleString()} rows (${writePercent}% of ${D1_WRITE_LIMIT.toLocaleString()} daily limit)`);

if (estimatedWrites > D1_WRITE_LIMIT * WRITE_WARN_THRESHOLD) {
  const msg = `WARNING: Estimated writes exceed ${(WRITE_WARN_THRESHOLD * 100).toFixed(0)}% of D1 daily limit!`;
  if (STRICT_MODE) {
    console.error(`\n${msg}`);
    console.error("Aborting due to --strict mode. Use --full without --strict to override.");
    process.exit(1);
  } else {
    console.warn(`\n${msg}`);
    console.warn("Proceeding anyway. Use --strict to abort in this situation.");
  }
}

// ── Clean up & generate ────────────────────────────────────────────────────
cleanupOldMigrations();

const statements = [];

// Removals first
removedIds.forEach((id) => {
  statements.push(`DELETE FROM cards WHERE id = ${escapeSQL(id)};`);
});

// Generate upsert statements for each card
cardsToProcess.forEach((card) => {
  const artIdBase = getArtIdBase(card.id);
  statements.push(...generateCardStatements(card, artIdBase));
});

// ── Write output files ─────────────────────────────────────────────────────
const migrationSQL = statements.join("\n");
fs.writeFileSync(path.join(cloudflareDir, "migration.sql"), migrationSQL);
console.log(`\nGenerated migration.sql with ${statements.length} statements`);

// Create batch files
const batchSize = 500;
let batchCount = 0;

for (let i = 0; i < statements.length; i += batchSize) {
  const batch = statements.slice(i, i + batchSize);
  fs.writeFileSync(
    path.join(migrationsDir, `migration_batch_${batchCount}.sql`),
    batch.join("\n"),
  );
  batchCount++;
}

console.log(`Created ${batchCount} batch files in migrations/ (batch size: ${batchSize})`);

// ── Save hash file ─────────────────────────────────────────────────────────
saveHashes(cardsData);
console.log(`Updated cards_hash.json with ${cardsData.length} card hashes`);

// ── Summary ────────────────────────────────────────────────────────────────
console.log(`\n── Summary ──`);
console.log(`Mode:            ${mode}`);
console.log(`Cards processed: ${cardsToProcess.length}`);
console.log(`Cards removed:   ${removedIds.length}`);
console.log(`SQL statements:  ${statements.length}`);
console.log(`Batch files:     ${batchCount}`);
console.log(`Est. writes:     ${estimatedWrites.toLocaleString()} (${writePercent}% of daily limit)`);
console.log(`\nExecute with: ./run-migration.sh`);
console.log(`For production:  ./run-migration.sh --env production`);
