-- Trigger: clear cards_fts oshi skill columns when oshi_skills are deleted.
-- NOTE: No semicolon before END — single top-level statement for wrangler.
CREATE TRIGGER cards_fts_oshi_skills_delete AFTER DELETE ON oshi_skills BEGIN
    UPDATE cards_fts SET
        oshi_skill_name    = CASE WHEN OLD.skill_type = 'oshi'    THEN '' ELSE oshi_skill_name    END,
        oshi_skill_effect  = CASE WHEN OLD.skill_type = 'oshi'    THEN '' ELSE oshi_skill_effect  END,
        sp_oshi_skill_name = CASE WHEN OLD.skill_type = 'sp_oshi' THEN '' ELSE sp_oshi_skill_name END,
        sp_oshi_skill_effect = CASE WHEN OLD.skill_type = 'sp_oshi' THEN '' ELSE sp_oshi_skill_effect END
    WHERE card_id = OLD.card_id AND locale = OLD.locale
END;
