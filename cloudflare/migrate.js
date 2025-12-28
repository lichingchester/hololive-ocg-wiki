#!/usr/bin/env node

/**
 * Migration script to populate D1 database from cards.json
 * Usage: node migrate.js
 */

import fs from "fs";
import path from "path";

// Cleanup function to remove old migration files
function cleanupOldMigrations() {
  console.log("Cleaning up old migration files...");

  // Clean up migration files in current directory
  const currentDir = process.cwd();
  const files = fs.readdirSync(currentDir);

  files.forEach((file) => {
    if (file === "migration.sql" || file.startsWith("migration_batch_")) {
      console.log(`Removing ${file}`);
      fs.unlinkSync(path.join(currentDir, file));
    }
  });

  // Clean up files in migrations directory
  const migrationsDir = path.join(currentDir, "migrations");
  if (fs.existsSync(migrationsDir)) {
    const migrationFiles = fs.readdirSync(migrationsDir);
    migrationFiles.forEach((file) => {
      console.log(`Removing migrations/${file}`);
      fs.unlinkSync(path.join(migrationsDir, file));
    });
  } else {
    // Create migrations directory if it doesn't exist
    fs.mkdirSync(migrationsDir);
  }

  console.log("Cleanup completed.");
}

// Read the cards data
const cardsPath = path.join(process.cwd(), "..", "data", "cards.json");
const cardsData = JSON.parse(fs.readFileSync(cardsPath, "utf8"));

// Clean up old migration files first
cleanupOldMigrations();

console.log(`Loading ${cardsData.length} cards...`);

// Generate SQL INSERT statements
function generateSQLStatements(cards) {
  const statements = [];

  // Clear existing data
  statements.push("DELETE FROM qa_items;");
  statements.push("DELETE FROM keyword_translations;");
  statements.push("DELETE FROM keywords;");
  statements.push("DELETE FROM art_translations;");
  statements.push("DELETE FROM arts;");
  statements.push("DELETE FROM oshi_skills;");
  statements.push("DELETE FROM card_translations;");
  statements.push("DELETE FROM cards;");

  cards.forEach((card) => {
    // Insert main card data
    statements.push(`
      INSERT INTO cards (
        id, card_number, card_type_code, color_codes, rarity_code, 
        bloom_level_code, image_path, image_url, hp, life, baton_touch_count,
        baton_touch_types, illustrator, card_sets, tags
      ) VALUES (
        '${card.id}',
        '${card.cardNumber || "null"}',
        '${card.cardTypeCode}',
        '${JSON.stringify(card.colorCodes || []).replace(/'/g, "''")}',
        '${card.rarityCode}',
        ${card.bloomLevelCode ? `'${card.bloomLevelCode}'` : "NULL"},
        '${card.imagePath}',
        '${card.imageUrl}',
        ${card.hp || "NULL"},
        ${card.life || "NULL"},
        ${card.batonTouchCount || "NULL"},
        ${
          card.batonTouchTypes
            ? `'${JSON.stringify(card.batonTouchTypes).replace(/'/g, "''")}'`
            : "NULL"
        },
        ${
          card.illustrator
            ? `'${card.illustrator.replace(/'/g, "''")}'`
            : "NULL"
        },
        ${
          card.cardSets
            ? `'${JSON.stringify(card.cardSets).replace(/'/g, "''")}'`
            : "NULL"
        },
        ${
          card.tags
            ? `'${JSON.stringify(card.tags).replace(/'/g, "''")}'`
            : "NULL"
        }
      );
    `);

    // Insert arts core data first (from main card object if available, or derive from first translation)
    let cardArtsData = [];

    if (card.arts && Array.isArray(card.arts)) {
      // Use arts from main card object (preferred)
      cardArtsData = card.arts;
    } else {
      // Derive arts structure from first available translation
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

    // Insert arts core data
    cardArtsData.forEach((art, artIndex) => {
      statements.push(`
        INSERT INTO arts (
          card_id, cost_count, cost_types, damage, is_plus, special_targets, special_values
        ) VALUES (
          '${card.id}',
          ${art.costCount || "NULL"},
          ${
            art.costTypes
              ? `'${JSON.stringify(art.costTypes).replace(/'/g, "''")}'`
              : "NULL"
          },
          ${art.damage || "NULL"},
          ${art.isPlus ? "TRUE" : "FALSE"},
          ${
            art.specialTargets
              ? `'${JSON.stringify(art.specialTargets).replace(/'/g, "''")}'`
              : "NULL"
          },
          ${
            art.specialValues
              ? `'${JSON.stringify(art.specialValues).replace(/'/g, "''")}'`
              : "NULL"
          }
        );
      `);
    });

    // Insert translations
    Object.entries(card.translations || {}).forEach(([locale, translation]) => {
      if (translation) {
        statements.push(`
          INSERT INTO card_translations (
            card_id, locale, name, card_type, color, rarity, set_name, ability_text, extra
          ) VALUES (
            '${card.id}',
            '${locale}',
            ${
              translation.name
                ? `'${translation.name.replace(/'/g, "''")}'`
                : "NULL"
            },
            ${
              translation.cardType
                ? `'${translation.cardType.replace(/'/g, "''")}'`
                : "NULL"
            },
            ${
              translation.color
                ? `'${translation.color.replace(/'/g, "''")}'`
                : "NULL"
            },
            ${
              translation.rarity
                ? `'${translation.rarity.replace(/'/g, "''")}'`
                : "NULL"
            },
            ${
              translation.set
                ? `'${translation.set.replace(/'/g, "''")}'`
                : "NULL"
            },
            ${
              translation.abilityText
                ? `'${translation.abilityText.replace(/'/g, "''")}'`
                : "NULL"
            },
            ${
              translation.extra
                ? `'${translation.extra.replace(/'/g, "''")}'`
                : "NULL"
            }
          );
        `);

        // Insert tags (removed individual tags table, now stored as JSON in main cards table)

        // Insert oshi skills
        if (translation.oshiSkill) {
          statements.push(`
            INSERT INTO oshi_skills (
              card_id, locale, skill_type, cost, timing_code, name, effect
            ) VALUES (
              '${card.id}',
              '${locale}',
              'oshi',
              ${translation.oshiSkill.cost || card.oshiSkill?.cost || "NULL"},
              ${
                translation.oshiSkill.timingCode || card.oshiSkill?.timingCode
                  ? `'${
                      translation.oshiSkill.timingCode ||
                      card.oshiSkill?.timingCode
                    }'`
                  : "NULL"
              },
              ${
                translation.oshiSkill.name
                  ? `'${translation.oshiSkill.name.replace(/'/g, "''")}'`
                  : "NULL"
              },
              ${
                translation.oshiSkill.effect
                  ? `'${translation.oshiSkill.effect.replace(/'/g, "''")}'`
                  : "NULL"
              }
            );
          `);
        }

        // Insert SP oshi skills
        if (translation.spOshiSkill) {
          statements.push(`
            INSERT INTO oshi_skills (
              card_id, locale, skill_type, cost, timing_code, name, effect
            ) VALUES (
              '${card.id}',
              '${locale}',
              'sp_oshi',
              ${
                translation.spOshiSkill.cost || card.spOshiSkill?.cost || "NULL"
              },
              ${
                translation.spOshiSkill.timingCode ||
                card.spOshiSkill?.timingCode
                  ? `'${
                      translation.spOshiSkill.timingCode ||
                      card.spOshiSkill?.timingCode
                    }'`
                  : "NULL"
              },
              ${
                translation.spOshiSkill.name
                  ? `'${translation.spOshiSkill.name.replace(/'/g, "''")}'`
                  : "NULL"
              },
              ${
                translation.spOshiSkill.effect
                  ? `'${translation.spOshiSkill.effect.replace(/'/g, "''")}'`
                  : "NULL"
              }
            );
          `);
        }

        // Insert QA items
        if (translation.qa_items && Array.isArray(translation.qa_items)) {
          translation.qa_items.forEach((qa) => {
            statements.push(`
              INSERT INTO qa_items (
                card_id, locale, title, question, answer, related_cards_html, related_card_numbers
              ) VALUES (
                '${card.id}',
                '${locale}',
                '${qa.title.replace(/'/g, "''")}',
                '${qa.question.replace(/'/g, "''")}',
                '${qa.answer.replace(/'/g, "''")}',
                ${
                  qa.related_cards?.raw_html
                    ? `'${qa.related_cards.raw_html.replace(/'/g, "''")}'`
                    : "NULL"
                },
                ${
                  qa.related_cards?.card_number
                    ? `'${JSON.stringify(qa.related_cards.card_number).replace(
                        /'/g,
                        "''"
                      )}'`
                    : "NULL"
                }
              );
            `);
          });
        }

        // Insert keyword translations
        if (translation.keyword) {
          statements.push(`
            INSERT INTO keyword_translations (
              card_id, locale, name, effect
            ) VALUES (
              '${card.id}',
              '${locale}',
              ${
                translation.keyword.name
                  ? `'${translation.keyword.name.replace(/'/g, "''")}'`
                  : "NULL"
              },
              ${
                translation.keyword.effect
                  ? `'${translation.keyword.effect.replace(/'/g, "''")}'`
                  : "NULL"
              }
            );
          `);
        }

        // Insert art translations (from translation) - only translations, not core data
        if (
          translation.arts &&
          Array.isArray(translation.arts) &&
          cardArtsData.length > 0
        ) {
          translation.arts.forEach((art, artIndex) => {
            // Only insert translation if we have a corresponding art record and translation data
            if (artIndex < cardArtsData.length && (art.name || art.effect)) {
              statements.push(`
                INSERT INTO art_translations (
                  art_id, locale, name, effect
                ) VALUES (
                  (SELECT id FROM arts WHERE card_id = '${
                    card.id
                  }' ORDER BY id LIMIT 1 OFFSET ${artIndex}),
                  '${locale}',
                  ${art.name ? `'${art.name.replace(/'/g, "''")}'` : "NULL"},
                  ${art.effect ? `'${art.effect.replace(/'/g, "''")}'` : "NULL"}
                );
              `);
            }
          });
        }
      }
    });

    // Insert keyword
    if (card.keyword) {
      statements.push(`
        INSERT INTO keywords (card_id, type, type_code) VALUES (
          '${card.id}',
          ${card.keyword.type ? `'${card.keyword.type}'` : "NULL"},
          ${card.keyword.typeCode ? `'${card.keyword.typeCode}'` : "NULL"}
        );
      `);
    }
  });

  return statements;
}

// Generate and save SQL statements
const sqlStatements = generateSQLStatements(cardsData);
const migrationSQL = sqlStatements.join("\n");

// Save to file
fs.writeFileSync(path.join(process.cwd(), "migration.sql"), migrationSQL);

console.log(`Generated migration.sql with ${sqlStatements.length} statements`);
console.log(
  "Run: wrangler d1 execute hololive-ocg-db --local --file=./migration.sql"
);

// Also create a batch file for Cloudflare D1 execution
const batchSize = 100;
let batchCount = 1;
const migrationsDir = path.join(process.cwd(), "migrations");

for (let i = 0; i < sqlStatements.length; i += batchSize) {
  const batch = sqlStatements.slice(i, i + batchSize);
  const batchSQL = batch.join("\n");
  fs.writeFileSync(
    path.join(migrationsDir, `migration_batch_${batchCount}.sql`),
    batchSQL
  );
  batchCount++;
}

console.log(
  `Created ${
    batchCount - 1
  } batch files in migrations/ folder for easier execution`
);
console.log(
  "Execute each batch with: wrangler d1 execute hololive-ocg-db --local --file=./migrations/migration_batch_X.sql"
);
