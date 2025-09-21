-- Setup Full-Text Search (FTS) for Hololive OCG Wiki
-- This script creates and populates the FTS table for better search performance

-- Drop existing FTS table and triggers to start fresh
-- Note: Use individual commands for better compatibility with D1
DROP TABLE IF EXISTS cards_fts;
DROP TRIGGER IF EXISTS cards_fts_insert;
DROP TRIGGER IF EXISTS cards_fts_update;
DROP TRIGGER IF EXISTS cards_fts_delete;
DROP TRIGGER IF EXISTS cards_fts_oshi_skills_update;
DROP TRIGGER IF EXISTS cards_fts_tags_update;

-- Create the FTS virtual table
CREATE VIRTUAL TABLE cards_fts USING fts5(
    card_id,
    card_number,
    name,
    card_type,
    color,
    set_name,
    ability_text,
    oshi_skill_name,
    oshi_skill_effect,
    sp_oshi_skill_name,
    sp_oshi_skill_effect,
    tags,
    locale
);

-- Populate FTS table with existing data
INSERT INTO cards_fts(
    card_id,
    card_number,
    name,
    card_type,
    color,
    set_name,
    ability_text,
    oshi_skill_name,
    oshi_skill_effect,
    sp_oshi_skill_name,
    sp_oshi_skill_effect,
    tags,
    locale
)
SELECT 
    c.id as card_id,
    c.card_number,
    ct.name,
    ct.card_type,
    ct.color,
    ct.set_name,
    ct.ability_text,
    oshi.name as oshi_skill_name,
    oshi.effect as oshi_skill_effect,
    sp_oshi.name as sp_oshi_skill_name,
    sp_oshi.effect as sp_oshi_skill_effect,
    c.tags,
    ct.locale
FROM cards c
LEFT JOIN card_translations ct ON c.id = ct.card_id
LEFT JOIN oshi_skills oshi ON c.id = oshi.card_id AND oshi.skill_type = 'oshi' AND oshi.locale = ct.locale
LEFT JOIN oshi_skills sp_oshi ON c.id = sp_oshi.card_id AND sp_oshi.skill_type = 'sp_oshi' AND sp_oshi.locale = ct.locale
WHERE ct.locale IS NOT NULL;

-- Create triggers to keep FTS table in sync with future changes
CREATE TRIGGER cards_fts_insert AFTER INSERT ON card_translations BEGIN
    INSERT INTO cards_fts(
        card_id, 
        card_number, 
        name, 
        card_type, 
        color, 
        set_name, 
        ability_text,
        oshi_skill_name,
        oshi_skill_effect,
        sp_oshi_skill_name,
        sp_oshi_skill_effect,
        tags,
        locale
    ) 
    SELECT 
        NEW.card_id,
        c.card_number,
        NEW.name,
        NEW.card_type,
        NEW.color,
        NEW.set_name,
        NEW.ability_text,
        oshi.name as oshi_skill_name,
        oshi.effect as oshi_skill_effect,
        sp_oshi.name as sp_oshi_skill_name,
        sp_oshi.effect as sp_oshi_skill_effect,
        c.tags,
        NEW.locale
    FROM cards c 
    LEFT JOIN oshi_skills oshi ON c.id = oshi.card_id AND oshi.skill_type = 'oshi' AND oshi.locale = NEW.locale
    LEFT JOIN oshi_skills sp_oshi ON c.id = sp_oshi.card_id AND sp_oshi.skill_type = 'sp_oshi' AND sp_oshi.locale = NEW.locale
    WHERE c.id = NEW.card_id;
END;

CREATE TRIGGER cards_fts_update AFTER UPDATE ON card_translations BEGIN
    UPDATE cards_fts SET
        name = NEW.name,
        card_type = NEW.card_type,
        color = NEW.color,
        set_name = NEW.set_name,
        ability_text = NEW.ability_text
    WHERE card_id = NEW.card_id AND locale = NEW.locale;
END;

CREATE TRIGGER cards_fts_delete AFTER DELETE ON card_translations BEGIN
    DELETE FROM cards_fts WHERE card_id = OLD.card_id AND locale = OLD.locale;
END;

-- Additional trigger for when oshi skills are updated
CREATE TRIGGER cards_fts_oshi_skills_update AFTER INSERT ON oshi_skills BEGIN
    UPDATE cards_fts SET
        oshi_skill_name = CASE WHEN NEW.skill_type = 'oshi' THEN NEW.name ELSE oshi_skill_name END,
        oshi_skill_effect = CASE WHEN NEW.skill_type = 'oshi' THEN NEW.effect ELSE oshi_skill_effect END,
        sp_oshi_skill_name = CASE WHEN NEW.skill_type = 'sp_oshi' THEN NEW.name ELSE sp_oshi_skill_name END,
        sp_oshi_skill_effect = CASE WHEN NEW.skill_type = 'sp_oshi' THEN NEW.effect ELSE sp_oshi_skill_effect END
    WHERE card_id = NEW.card_id AND locale = NEW.locale;
END;

-- Trigger for when cards table tags are updated
CREATE TRIGGER cards_fts_tags_update AFTER UPDATE ON cards BEGIN
    UPDATE cards_fts SET
        tags = NEW.tags
    WHERE card_id = NEW.id;
END;
