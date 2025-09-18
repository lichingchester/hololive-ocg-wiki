-- Cloudflare D1 Database Schema for Hololive OCG Wiki
-- Optimized for fast filtering and search operations

-- Cleanup: Drop existing tables and views for fresh schema
DROP VIEW IF EXISTS card_details;
DROP TABLE IF EXISTS cards_fts;
DROP TABLE IF EXISTS qa_items;
DROP TABLE IF EXISTS keywords;
DROP TABLE IF EXISTS arts;
DROP TABLE IF EXISTS oshi_skills;
DROP TABLE IF EXISTS card_translations;
DROP TABLE IF EXISTS cards;

-- Main cards table with core card data
CREATE TABLE cards (
    id TEXT PRIMARY KEY,
    card_number TEXT NOT NULL,
    card_type_code TEXT NOT NULL,
    color_codes TEXT NOT NULL, -- JSON array of color codes
    rarity_code TEXT NOT NULL,
    bloom_level_code TEXT,
    image_path TEXT NOT NULL,
    image_url TEXT NOT NULL,
    hp INTEGER,
    life INTEGER,
    baton_touch_count INTEGER,
    baton_touch_types TEXT, -- JSON array of baton touch types
    illustrator TEXT,
    card_sets TEXT, -- JSON array of card sets
    tags TEXT, -- JSON array of tags
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Translations table for localized content
CREATE TABLE card_translations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id TEXT NOT NULL,
    locale TEXT NOT NULL,
    name TEXT,
    card_type TEXT,
    color TEXT,
    rarity TEXT,
    set_name TEXT,
    ability_text TEXT,
    extra TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
);

-- Oshi skills table
CREATE TABLE oshi_skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id TEXT NOT NULL,
    locale TEXT NOT NULL,
    skill_type TEXT NOT NULL CHECK (skill_type IN ('oshi', 'sp_oshi')),
    cost INTEGER,
    timing_code TEXT,
    name TEXT,
    effect TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
);

-- Arts table for card arts data
CREATE TABLE arts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id TEXT NOT NULL,
    locale TEXT NOT NULL,
    cost_count INTEGER,
    cost_types TEXT, -- JSON string of cost types array
    damage INTEGER,
    is_plus BOOLEAN DEFAULT FALSE,
    special_targets TEXT, -- JSON string of special targets array
    special_values TEXT, -- JSON string of special values array
    name TEXT,
    effect TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
);

-- Keywords table
CREATE TABLE keywords (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id TEXT NOT NULL,
    type TEXT,
    type_code TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
);

-- Tags table for searchable tags (moved to main cards table as JSON)
-- CREATE TABLE tags (
--     id INTEGER PRIMARY KEY AUTOINCREMENT,
--     card_id TEXT NOT NULL,
--     locale TEXT NOT NULL,
--     tag TEXT NOT NULL,
--     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
-- );

-- QA items table
CREATE TABLE qa_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id TEXT NOT NULL,
    locale TEXT NOT NULL,
    title TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    related_cards_html TEXT, -- raw_html from related_cards
    related_card_numbers TEXT, -- JSON array of card numbers
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
);

-- Indexes for fast querying
CREATE INDEX idx_cards_card_type ON cards(card_type_code);
CREATE INDEX idx_cards_color_codes ON cards(color_codes);
CREATE INDEX idx_cards_rarity ON cards(rarity_code);
CREATE INDEX idx_cards_bloom_level ON cards(bloom_level_code);
CREATE INDEX idx_cards_card_number ON cards(card_number);

CREATE INDEX idx_translations_card_locale ON card_translations(card_id, locale);
CREATE INDEX idx_translations_name ON card_translations(name);

CREATE INDEX idx_oshi_skills_card_locale ON oshi_skills(card_id, locale);

CREATE INDEX idx_arts_card_locale ON arts(card_id, locale);

-- Note: Full-text search (FTS) is set up separately using setup-fts.sql
-- This allows for better control and optional setup of FTS functionality

-- Materialized view for frequently accessed card data with translations
CREATE VIEW card_details AS
SELECT 
    c.id,
    c.card_number,
    c.card_type_code,
    c.color_codes,
    c.rarity_code,
    c.bloom_level_code,
    c.image_path,
    c.image_url,
    c.hp,
    c.life,
    c.baton_touch_count,
    c.baton_touch_types,
    c.illustrator,
    c.card_sets,
    c.tags,
    ct.locale,
    ct.name,
    ct.card_type,
    ct.color,
    ct.rarity,
    ct.set_name,
    ct.ability_text,
    ct.extra
FROM cards c
LEFT JOIN card_translations ct ON c.id = ct.card_id;
