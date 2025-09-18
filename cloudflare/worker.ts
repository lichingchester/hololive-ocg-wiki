// Cloudflare Worker API for Hololive OCG Wiki
// Handles card search, filtering, and pagination

export interface Env {
  DB: D1Database;
  CORS_ORIGIN?: string;
}

// Types matching the frontend
interface FilterOptions {
  search?: string;
  name?: string;
  tag?: string;
  set?: string;
  colors?: string[];
  cardTypes?: string[];
  rarity?: string[];
  bloomLevel?: string[];
  locale?: string;
  page?: number;
  limit?: number;
}

interface Card {
  id: string;
  cardNumber: string;
  cardTypeCode: string;
  colorCode: string;
  rarityCode: string;
  bloomLevelCode?: string;
  imagePath: string;
  imageUrl: string;
  hp?: number;
  life?: number;
  batonTouchCount?: number;
  translations: Record<string, any>;
  oshiSkill?: any;
  spOshiSkill?: any;
  arts?: any[];
  keyword?: any;
  tags?: string[];
}

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Helper function to handle CORS
function handleCORS(request: Request): Response | null {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  return null;
}

// Search cards with full-text search
async function searchCards(
  env: Env,
  query: string,
  locale: string = "en",
  limit: number = 100
): Promise<Card[]> {
  const stmt = env.DB.prepare(`
    SELECT DISTINCT c.*, ct.name, ct.card_type, ct.color, ct.rarity, ct.set_name, ct.illustrator, ct.ability_text
    FROM cards_fts cf
    JOIN cards c ON cf.card_id = c.id
    LEFT JOIN card_translations ct ON c.id = ct.card_id AND ct.locale = ?
    WHERE cf MATCH ? AND cf.locale = ?
    ORDER BY rank
    LIMIT ?
  `);

  const results = await stmt.bind(locale, query, locale, limit).all();
  return results.results as Card[];
}

// Filter cards with multiple criteria
async function filterCards(
  env: Env,
  filters: FilterOptions
): Promise<{ cards: Card[]; total: number }> {
  const locale = filters.locale || "en";
  const page = filters.page || 1;
  const limit = filters.limit || 50;
  const offset = (page - 1) * limit;

  let whereConditions: string[] = [];
  let params: any[] = [];
  let paramIndex = 1;

  // Base query
  let query = `
    FROM cards c
    LEFT JOIN card_translations ct ON c.id = ct.card_id AND ct.locale = ?
  `;
  params.push(locale);

  // Add search condition
  if (filters.search) {
    query += ` JOIN cards_fts cf ON c.id = cf.card_id AND cf.locale = ?`;
    params.push(locale);
    whereConditions.push(`cf MATCH ?`);
    params.push(filters.search);
  }

  // Add color filters
  if (filters.colors && filters.colors.length > 0) {
    const colorPlaceholders = filters.colors.map(() => "?").join(",");
    whereConditions.push(`c.color_code IN (${colorPlaceholders})`);
    params.push(...filters.colors);
  }

  // Add card type filters
  if (filters.cardTypes && filters.cardTypes.length > 0) {
    const typePlaceholders = filters.cardTypes.map(() => "?").join(",");
    whereConditions.push(`c.card_type_code IN (${typePlaceholders})`);
    params.push(...filters.cardTypes);
  }

  // Add rarity filters
  if (filters.rarity && filters.rarity.length > 0) {
    const rarityPlaceholders = filters.rarity.map(() => "?").join(",");
    whereConditions.push(`c.rarity_code IN (${rarityPlaceholders})`);
    params.push(...filters.rarity);
  }

  // Add bloom level filters
  if (filters.bloomLevel && filters.bloomLevel.length > 0) {
    const bloomPlaceholders = filters.bloomLevel.map(() => "?").join(",");
    whereConditions.push(`c.bloom_level_code IN (${bloomPlaceholders})`);
    params.push(...filters.bloomLevel);
  }

  // Add name filter
  if (filters.name) {
    whereConditions.push(`ct.name = ?`);
    params.push(filters.name);
  }

  // Add tag filter
  if (filters.tag) {
    query += ` JOIN tags t ON c.id = t.card_id AND t.locale = ?`;
    params.push(locale);
    whereConditions.push(`t.tag = ?`);
    params.push(filters.tag);
  }

  // Add set filter
  if (filters.set) {
    whereConditions.push(`ct.set_name = ?`);
    params.push(filters.set);
  }

  // Build WHERE clause
  const whereClause =
    whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

  // Count total results
  const countQuery = `SELECT COUNT(DISTINCT c.id) as total ${query} ${whereClause}`;
  const countStmt = env.DB.prepare(countQuery);
  const countResult = await countStmt.bind(...params).first();
  const total = countResult?.total || 0;

  // Get paginated results
  const cardsQuery = `
    SELECT DISTINCT c.*, ct.name, ct.card_type, ct.color, ct.rarity, ct.set_name, ct.illustrator, ct.ability_text
    ${query}
    ${whereClause}
    ORDER BY c.card_number
    LIMIT ? OFFSET ?
  `;

  const cardsStmt = env.DB.prepare(cardsQuery);
  const cardsResult = await cardsStmt.bind(...params, limit, offset).all();

  return {
    cards: cardsResult.results as Card[],
    total: total as number,
  };
}

// Get card details including all translations
async function getCardDetails(env: Env, cardId: string): Promise<Card | null> {
  // Get basic card data
  const cardStmt = env.DB.prepare("SELECT * FROM cards WHERE id = ?");
  const card = (await cardStmt.bind(cardId).first()) as Card;

  if (!card) return null;

  // Get all translations
  const translationsStmt = env.DB.prepare(`
    SELECT locale, name, card_type, color, rarity, set_name, illustrator, ability_text
    FROM card_translations 
    WHERE card_id = ?
  `);
  const translations = await translationsStmt.bind(cardId).all();

  // Get oshi skills
  const oshiSkillsStmt = env.DB.prepare(`
    SELECT skill_type, locale, cost, timing_code, name, effect
    FROM oshi_skills 
    WHERE card_id = ?
  `);
  const oshiSkills = await oshiSkillsStmt.bind(cardId).all();

  // Get tags
  const tagsStmt = env.DB.prepare(`
    SELECT locale, tag
    FROM tags 
    WHERE card_id = ?
  `);
  const tags = await tagsStmt.bind(cardId).all();

  // Get arts
  const artsStmt = env.DB.prepare(`
    SELECT *
    FROM arts 
    WHERE card_id = ?
  `);
  const arts = await artsStmt.bind(cardId).all();

  // Get keywords
  const keywordStmt = env.DB.prepare(`
    SELECT *
    FROM keywords 
    WHERE card_id = ?
  `);
  const keywords = await keywordStmt.bind(cardId).all();

  // Get QA items
  const qaStmt = env.DB.prepare(`
    SELECT locale, title, question, answer, related_cards
    FROM qa_items 
    WHERE card_id = ?
  `);
  const qaItems = await qaStmt.bind(cardId).all();

  // Structure the response
  card.translations = {};
  translations.results.forEach((t: any) => {
    if (!card.translations[t.locale]) {
      card.translations[t.locale] = {};
    }
    card.translations[t.locale] = {
      name: t.name,
      cardType: t.card_type,
      color: t.color,
      rarity: t.rarity,
      set: t.set_name,
      illustrator: t.illustrator,
      abilityText: t.ability_text,
      tags: [],
      qa_items: [],
    };
  });

  // Add tags to translations
  tags.results.forEach((t: any) => {
    if (card.translations[t.locale]) {
      if (!card.translations[t.locale].tags) {
        card.translations[t.locale].tags = [];
      }
      card.translations[t.locale].tags.push(t.tag);
    }
  });

  // Add QA items to translations
  qaItems.results.forEach((qa: any) => {
    if (card.translations[qa.locale]) {
      if (!card.translations[qa.locale].qa_items) {
        card.translations[qa.locale].qa_items = [];
      }
      card.translations[qa.locale].qa_items.push({
        title: qa.title,
        question: qa.question,
        answer: qa.answer,
        related_cards: qa.related_cards,
      });
    }
  });

  // Add oshi skills
  oshiSkills.results.forEach((skill: any) => {
    if (card.translations[skill.locale]) {
      const skillData = {
        cost: skill.cost,
        timingCode: skill.timing_code,
        name: skill.name,
        effect: skill.effect,
      };

      if (skill.skill_type === "oshi") {
        if (!card.translations[skill.locale].oshiSkill) {
          card.translations[skill.locale].oshiSkill = skillData;
        }
      } else if (skill.skill_type === "sp_oshi") {
        if (!card.translations[skill.locale].spOshiSkill) {
          card.translations[skill.locale].spOshiSkill = skillData;
        }
      }
    }
  });

  // Add arts data
  card.arts = arts.results.map((art: any) => ({
    costCount: art.cost_count,
    costTypes: art.cost_types ? JSON.parse(art.cost_types) : [],
    damage: art.damage,
    isPlus: art.is_plus,
    specialTargets: art.special_targets ? JSON.parse(art.special_targets) : [],
    specialValues: art.special_values ? JSON.parse(art.special_values) : [],
  }));

  // Add keyword data
  if (keywords.results.length > 0) {
    card.keyword = {
      type: keywords.results[0].type,
      typeCode: keywords.results[0].type_code,
    };
  }

  return card;
}

// Get filter options (unique values for dropdowns)
async function getFilterOptions(env: Env, locale: string = "en") {
  const [names, tags, sets] = await Promise.all([
    env.DB.prepare(
      "SELECT DISTINCT name FROM card_translations WHERE locale = ? ORDER BY name"
    )
      .bind(locale)
      .all(),
    env.DB.prepare(
      "SELECT DISTINCT tag FROM tags WHERE locale = ? ORDER BY tag"
    )
      .bind(locale)
      .all(),
    env.DB.prepare(
      "SELECT DISTINCT set_name FROM card_translations WHERE locale = ? AND set_name IS NOT NULL ORDER BY set_name"
    )
      .bind(locale)
      .all(),
  ]);

  return {
    names: names.results.map((n: any) => ({ value: n.name, label: n.name })),
    tags: tags.results.map((t: any) => ({ value: t.tag, label: t.tag })),
    sets: sets.results.map((s: any) => ({
      value: s.set_name,
      label: s.set_name,
    })),
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    const corsResponse = handleCORS(request);
    if (corsResponse) return corsResponse;

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Route: GET /api/cards/search
      if (path === "/api/cards/search" && request.method === "GET") {
        const query = url.searchParams.get("q") || "";
        const locale = url.searchParams.get("locale") || "en";
        const limit = parseInt(url.searchParams.get("limit") || "100");

        const cards = await searchCards(env, query, locale, limit);

        return new Response(JSON.stringify({ cards }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Route: GET /api/cards/filter
      if (path === "/api/cards/filter" && request.method === "GET") {
        const filters: FilterOptions = {
          search: url.searchParams.get("search") || undefined,
          name: url.searchParams.get("name") || undefined,
          tag: url.searchParams.get("tag") || undefined,
          set: url.searchParams.get("set") || undefined,
          colors: url.searchParams.get("colors")?.split(",").filter(Boolean),
          cardTypes: url.searchParams
            .get("cardTypes")
            ?.split(",")
            .filter(Boolean),
          rarity: url.searchParams.get("rarity")?.split(",").filter(Boolean),
          bloomLevel: url.searchParams
            .get("bloomLevel")
            ?.split(",")
            .filter(Boolean),
          locale: url.searchParams.get("locale") || "en",
          page: parseInt(url.searchParams.get("page") || "1"),
          limit: parseInt(url.searchParams.get("limit") || "50"),
        };

        const result = await filterCards(env, filters);

        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Route: GET /api/cards/:id
      if (path.startsWith("/api/cards/") && request.method === "GET") {
        const cardId = path.split("/").pop();
        if (!cardId) {
          return new Response(JSON.stringify({ error: "Card ID required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const card = await getCardDetails(env, cardId);
        if (!card) {
          return new Response(JSON.stringify({ error: "Card not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ card }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Route: GET /api/filter-options
      if (path === "/api/filter-options" && request.method === "GET") {
        const locale = url.searchParams.get("locale") || "en";
        const options = await getFilterOptions(env, locale);

        return new Response(JSON.stringify(options), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // 404 for unknown routes
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("API Error:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  },
};
