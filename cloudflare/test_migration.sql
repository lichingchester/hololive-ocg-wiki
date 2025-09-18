DELETE FROM qa_items;
DELETE FROM keywords;
DELETE FROM arts;
DELETE FROM oshi_skills;
DELETE FROM card_translations;
DELETE FROM cards;

      INSERT INTO cards (
        id, card_number, card_type_code, color_codes, rarity_code, 
        bloom_level_code, image_path, image_url, hp, life, baton_touch_count,
        baton_touch_types, illustrator, card_sets, tags
      ) VALUES (
        '1088',
        'null',
        'support',
        '[]',
        'undefined',
        NULL,
        'card_images/default/ent04_teaching.png',
        'https://hololive-official-cardgame.com/wp-content/images/cardlist/hBP04/ent04_teaching.png',
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        '["【使用可能カード】エントリーカップ「キュリアスユニバース」"]',
        NULL
      );
    

