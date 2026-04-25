-- Trigger: keep cards_fts in sync when a card_translation is inserted.
-- NOTE: No semicolon before END — this ensures wrangler's statement splitter
-- treats the entire CREATE TRIGGER ... END as a single statement.
CREATE TRIGGER cards_fts_insert AFTER INSERT ON card_translations BEGIN
    INSERT INTO cards_fts(
        card_id, card_number, name, card_type, color, set_name, ability_text,
        oshi_skill_name, oshi_skill_effect,
        sp_oshi_skill_name, sp_oshi_skill_effect,
        tags, locale
    )
    SELECT
        NEW.card_id, c.card_number,
        NEW.name, NEW.card_type, NEW.color, NEW.set_name, NEW.ability_text,
        oshi.name, oshi.effect,
        sp_oshi.name, sp_oshi.effect,
        c.tags, NEW.locale
    FROM cards c
    LEFT JOIN oshi_skills oshi
        ON c.id = oshi.card_id AND oshi.skill_type = 'oshi' AND oshi.locale = NEW.locale
    LEFT JOIN oshi_skills sp_oshi
        ON c.id = sp_oshi.card_id AND sp_oshi.skill_type = 'sp_oshi' AND sp_oshi.locale = NEW.locale
    WHERE c.id = NEW.card_id
END;
