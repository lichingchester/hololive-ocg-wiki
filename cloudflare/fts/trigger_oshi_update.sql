-- Trigger: keep cards_fts oshi skill columns in sync when oshi_skills are inserted.
-- NOTE: No semicolon before END — single top-level statement for wrangler.
CREATE TRIGGER cards_fts_oshi_skills_update AFTER INSERT ON oshi_skills BEGIN
    UPDATE cards_fts SET
        oshi_skill_name    = CASE WHEN NEW.skill_type = 'oshi'    THEN NEW.name   ELSE oshi_skill_name    END,
        oshi_skill_effect  = CASE WHEN NEW.skill_type = 'oshi'    THEN NEW.effect ELSE oshi_skill_effect  END,
        sp_oshi_skill_name = CASE WHEN NEW.skill_type = 'sp_oshi' THEN NEW.name   ELSE sp_oshi_skill_name END,
        sp_oshi_skill_effect = CASE WHEN NEW.skill_type = 'sp_oshi' THEN NEW.effect ELSE sp_oshi_skill_effect END
    WHERE card_id = NEW.card_id AND locale = NEW.locale
END;
