-- Trigger: keep cards_fts in sync when a card_translation is deleted.
-- NOTE: No semicolon before END — single top-level statement for wrangler.
CREATE TRIGGER cards_fts_delete AFTER DELETE ON card_translations BEGIN
    DELETE FROM cards_fts WHERE card_id = OLD.card_id AND locale = OLD.locale
END;
