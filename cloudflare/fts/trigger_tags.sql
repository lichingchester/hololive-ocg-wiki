-- Trigger: keep cards_fts tags column in sync when cards.tags is updated.
-- NOTE: No semicolon before END — single top-level statement for wrangler.
CREATE TRIGGER cards_fts_tags_update AFTER UPDATE ON cards BEGIN
    UPDATE cards_fts SET tags = NEW.tags WHERE card_id = NEW.id
END;
