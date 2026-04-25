-- Trigger: keep cards_fts in sync when a card_translation is updated.
-- NOTE: No semicolon before END — single top-level statement for wrangler.
CREATE TRIGGER cards_fts_update AFTER UPDATE ON card_translations BEGIN
    UPDATE cards_fts SET
        name          = NEW.name,
        card_type     = NEW.card_type,
        color         = NEW.color,
        set_name      = NEW.set_name,
        ability_text  = NEW.ability_text
    WHERE card_id = NEW.card_id AND locale = NEW.locale
END;
