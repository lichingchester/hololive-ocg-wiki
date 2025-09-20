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
  card_types?: string[];
  rarity?: string[];
  bloom_level?: string[];
  locale?: string;
  page?: number;
  limit?: number;
}

interface Card {
  id: string;
  card_number: string;
  card_type_code: string;
  color_codes: string[]; // Always parsed array
  rarity_code: string;
  bloom_level_code?: string;
  image_path: string;
  image_url: string;
  hp?: number;
  life?: number;
  baton_touch_count?: number;
  baton_touch_types?: string[]; // Always parsed array
  illustrator?: string;
  card_sets?: string[]; // Always parsed array
  tags?: string[]; // Always parsed array
  // Translation fields (from the specified locale)
  name?: string;
  card_type?: string;
  color?: string;
  rarity?: string;
  set_name?: string;
  ability_text?: string;
  // Related data - now properly typed
  oshi_skill?: {
    cost?: string;
    timing_code?: string;
    name?: string;
    effect?: string;
  };
  sp_oshi_skill?: {
    cost?: string;
    timing_code?: string;
    name?: string;
    effect?: string;
  };
  arts?: {
    cost_count?: number;
    cost_types?: string[];
    damage?: number;
    is_plus?: boolean;
    special_targets?: string[];
    special_values?: string[];
    name?: string;
    effect?: string;
  }[];
  keyword?: {
    type?: string;
    type_code?: string;
    name?: string;
    effect?: string;
  };
  qa_items?: {
    title?: string;
    question?: string;
    answer?: string;
    related_cards_html?: string;
    related_card_numbers?: string[];
  }[];
}

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Default locale
const DEFAULT_LOCALE = "tc";

// Helper function to handle CORS
function handleCORS(request: Request): Response | null {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  return null;
}

// Helper function to safely parse JSON arrays
function parseJsonArray(jsonString: string | null | undefined): string[] {
  if (!jsonString) return [];
  try {
    const parsed = JSON.parse(jsonString);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

// Helper function to parse JSON fields in card objects
function parseCardJsonFields(card: any): Card {
  return {
    ...card,
    color_codes: parseJsonArray(card.color_codes || card.colorCodes),
    baton_touch_types: parseJsonArray(
      card.baton_touch_types || card.batonTouchTypes
    ),
    card_sets: parseJsonArray(card.card_sets || card.cardSets),
    tags: parseJsonArray(card.tags),
  };
}

// Helper function to enrich card data with related information (oshi skills, arts, keywords, qa)
async function enrichCardData(
  env: Env,
  card: any,
  locale: string
): Promise<Card> {
  const cardId = card.id;

  // Get oshi skills for the specified locale
  const oshiSkillsStmt = env.DB.prepare(`
    SELECT skill_type, cost, timing_code, name, effect
    FROM oshi_skills 
    WHERE card_id = ? AND locale = ?
  `);
  const oshiSkills = await oshiSkillsStmt.bind(cardId, locale).all();

  // Get arts for the specified locale (with translations)
  const artsStmt = env.DB.prepare(`
    SELECT a.*, at.name, at.effect
    FROM arts a
    LEFT JOIN art_translations at ON a.id = at.art_id AND at.locale = ?
    WHERE a.card_id = ?
  `);
  const arts = await artsStmt.bind(locale, cardId).all();

  // Get keywords
  const keywordStmt = env.DB.prepare(`
    SELECT *
    FROM keywords 
    WHERE card_id = ?
  `);
  const keywords = await keywordStmt.bind(cardId).all();

  // Get keyword translations for the specified locale
  const keywordTranslationsStmt = env.DB.prepare(`
    SELECT name, effect
    FROM keyword_translations 
    WHERE card_id = ? AND locale = ?
  `);
  const keywordTranslations = await keywordTranslationsStmt
    .bind(cardId, locale)
    .all();

  // Get QA items for the specified locale
  const qaStmt = env.DB.prepare(`
    SELECT title, question, answer, related_cards_html, related_card_numbers
    FROM qa_items 
    WHERE card_id = ? AND locale = ?
  `);
  const qaItems = await qaStmt.bind(cardId, locale).all();

  // Add oshi skills directly to card object
  oshiSkills.results.forEach((skill: any) => {
    const skillData = {
      cost: skill.cost,
      timing_code: skill.timing_code,
      name: skill.name,
      effect: skill.effect,
    };

    if (skill.skill_type === "oshi") {
      card.oshi_skill = skillData;
    } else if (skill.skill_type === "sp_oshi") {
      card.sp_oshi_skill = skillData;
    }
  });

  // Add arts data directly to card object
  card.arts = arts.results.map((art: any) => ({
    cost_count: art.cost_count,
    cost_types: parseJsonArray(art.cost_types),
    damage: art.damage,
    is_plus: art.is_plus,
    special_targets: parseJsonArray(art.special_targets),
    special_values: parseJsonArray(art.special_values),
    name: art.name,
    effect: art.effect,
  }));

  // Add QA items directly to card object
  card.qa_items = qaItems.results.map((qa: any) => ({
    title: qa.title,
    question: qa.question,
    answer: qa.answer,
    related_cards_html: qa.related_cards_html,
    related_card_numbers: parseJsonArray(qa.related_card_numbers),
  }));

  // Add keyword data
  if (keywords.results.length > 0) {
    card.keyword = {
      type: keywords.results[0].type,
      type_code: keywords.results[0].type_code,
    };

    // Add keyword translations if available
    if (keywordTranslations.results.length > 0) {
      card.keyword.name = keywordTranslations.results[0].name;
      card.keyword.effect = keywordTranslations.results[0].effect;
    }
  }

  // Parse JSON fields using helper function
  return parseCardJsonFields(card);
}

// Search cards with fallback for when FTS is not available
async function searchCards(
  env: Env,
  query: string,
  locale: string = DEFAULT_LOCALE,
  limit: number = 100
): Promise<Card[]> {
  // Return empty results for empty or whitespace-only queries
  if (!query || query.trim().length === 0) {
    return [];
  }

  try {
    // Try FTS search first
    const ftsStmt = env.DB.prepare(`
      SELECT DISTINCT c.*, ct.name, ct.card_type, ct.color, ct.rarity, ct.set_name, ct.ability_text
      FROM cards_fts cf
      JOIN cards c ON cf.card_id = c.id
      LEFT JOIN card_translations ct ON c.id = ct.card_id AND ct.locale = ?
      WHERE cards_fts MATCH ? AND cf.locale = ?
      LIMIT ?
    `);

    const ftsResults = await ftsStmt.bind(locale, query, locale, limit).all();

    // Enrich each card with complete data
    const enrichedCards = await Promise.all(
      ftsResults.results.map((card: any) => enrichCardData(env, card, locale))
    );

    return enrichedCards;
  } catch (error) {
    // Fallback to regular search if FTS table doesn't exist
    console.log("FTS search failed, falling back to regular search:", error);

    const fallbackStmt = env.DB.prepare(`
      SELECT DISTINCT c.*, ct.name, ct.card_type, ct.color, ct.rarity, ct.set_name, ct.ability_text
      FROM cards c
      LEFT JOIN card_translations ct ON c.id = ct.card_id AND ct.locale = ?
      WHERE (
        ct.name LIKE ? OR
        ct.card_type LIKE ? OR
        ct.ability_text LIKE ? OR
        c.card_number LIKE ? OR
        c.tags LIKE ?
      )
      ORDER BY 
        CASE 
          WHEN ct.name LIKE ? THEN 1
          WHEN ct.name LIKE ? THEN 2
          ELSE 3
        END,
        ct.name
      LIMIT ?
    `);

    const searchPattern = `%${query}%`;
    const exactPattern = query;
    const startPattern = `${query}%`;

    const fallbackResults = await fallbackStmt
      .bind(
        locale,
        searchPattern,
        searchPattern,
        searchPattern,
        searchPattern,
        searchPattern,
        exactPattern,
        startPattern,
        limit
      )
      .all();

    // Enrich each card with complete data
    const enrichedCards = await Promise.all(
      fallbackResults.results.map((card: any) =>
        enrichCardData(env, card, locale)
      )
    );

    return enrichedCards;
  }
}

// Filter cards with multiple criteria
async function filterCards(
  env: Env,
  filters: FilterOptions
): Promise<{ cards: Card[]; total: number }> {
  const locale = filters.locale || DEFAULT_LOCALE;
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

  // Add search condition - try FTS first, fallback to LIKE search
  let useFTS = false;
  if (filters.search && filters.search.trim().length > 0) {
    try {
      // Test if FTS table exists and FTS search works by trying the actual query structure
      const testStmt = env.DB.prepare(`
        SELECT card_id FROM cards_fts cf 
        WHERE cards_fts MATCH ? AND cf.locale = ? 
        LIMIT 1
      `);
      await testStmt.bind(filters.search, locale).first();

      // FTS table exists and works, use FTS search
      query += ` JOIN cards_fts cf ON c.id = cf.card_id AND cf.locale = ?`;
      params.push(locale);
      whereConditions.push(`cards_fts MATCH ?`);
      params.push(filters.search);
      useFTS = true;
    } catch (error) {
      // FTS table doesn't exist or FTS search failed, use regular LIKE search
      console.log("FTS search failed, falling back to regular search:", error);
      useFTS = false;
      const searchPattern = `%${filters.search}%`;
      whereConditions.push(`(
        ct.name LIKE ? OR
        ct.card_type LIKE ? OR
        ct.ability_text LIKE ? OR
        c.card_number LIKE ? OR
        c.tags LIKE ?
      )`);
      params.push(
        searchPattern,
        searchPattern,
        searchPattern,
        searchPattern,
        searchPattern
      );
    }
  }

  // Add color filters
  if (filters.colors && filters.colors.length > 0) {
    // Since color_codes is now a JSON array, we need to use JSON operations
    // Use JSON_EXTRACT or LIKE for better JSON array searching
    const colorConditions = filters.colors
      .map(() => `c.color_codes LIKE ?`)
      .join(" OR ");
    whereConditions.push(`(${colorConditions})`);
    // Add wildcards for JSON array search - match exact values in JSON array
    filters.colors.forEach((color) => {
      params.push(`%"${color}"%`);
    });
  }

  // Add card type filters
  if (filters.card_types && filters.card_types.length > 0) {
    const typePlaceholders = filters.card_types.map(() => "?").join(",");
    whereConditions.push(`c.card_type_code IN (${typePlaceholders})`);
    params.push(...filters.card_types);
  }

  // Add rarity filters
  if (filters.rarity && filters.rarity.length > 0) {
    const rarityPlaceholders = filters.rarity.map(() => "?").join(",");
    whereConditions.push(`c.rarity_code IN (${rarityPlaceholders})`);
    params.push(...filters.rarity);
  }

  // Add bloom level filters
  if (filters.bloom_level && filters.bloom_level.length > 0) {
    const bloomPlaceholders = filters.bloom_level.map(() => "?").join(",");
    whereConditions.push(`c.bloom_level_code IN (${bloomPlaceholders})`);
    params.push(...filters.bloom_level);
  }

  // Add name filter
  if (filters.name) {
    whereConditions.push(`ct.name = ?`);
    params.push(filters.name);
  }

  // Add tag filter - now searching in JSON array
  if (filters.tag) {
    whereConditions.push(`c.tags LIKE ?`);
    params.push(`%"${filters.tag}"%`);
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
    SELECT DISTINCT c.*, ct.name, ct.card_type, ct.color, ct.rarity, ct.set_name, ct.ability_text
    ${query}
    ${whereClause}
    ORDER BY c.card_number
    LIMIT ? OFFSET ?
  `;

  const cardsStmt = env.DB.prepare(cardsQuery);
  const cardsResult = await cardsStmt.bind(...params, limit, offset).all();

  // Enrich each card with complete data
  const enrichedCards = await Promise.all(
    cardsResult.results.map((card: any) => enrichCardData(env, card, locale))
  );

  return {
    cards: enrichedCards,
    total: total as number,
  };
}

// Get card details for a specific locale (returns same structure as filter API)
async function getCardDetails(
  env: Env,
  cardId: string,
  locale: string = DEFAULT_LOCALE
): Promise<Card | null> {
  // Get basic card data with translation for the specified locale
  const cardStmt = env.DB.prepare(`
    SELECT c.*, ct.name, ct.card_type, ct.color, ct.rarity, ct.set_name, ct.ability_text
    FROM cards c
    LEFT JOIN card_translations ct ON c.id = ct.card_id AND ct.locale = ?
    WHERE c.id = ?
  `);
  const card = (await cardStmt.bind(locale, cardId).first()) as Card;

  if (!card) return null;

  // Use the enrichCardData helper to get complete card data
  return await enrichCardData(env, card, locale);
}

// Get filter options (unique values for dropdowns)
async function getFilterOptions(env: Env, locale: string = DEFAULT_LOCALE) {
  const [names, sets] = await Promise.all([
    env.DB.prepare(
      "SELECT DISTINCT name FROM card_translations WHERE locale = ? ORDER BY name"
    )
      .bind(locale)
      .all(),
    env.DB.prepare(
      "SELECT DISTINCT set_name FROM card_translations WHERE locale = ? AND set_name IS NOT NULL ORDER BY set_name"
    )
      .bind(locale)
      .all(),
  ]);

  // Get unique tags from the JSON field in cards table
  const cardsWithTags = await env.DB.prepare(
    "SELECT DISTINCT tags FROM cards WHERE tags IS NOT NULL AND tags != ''"
  ).all();

  const allTags = new Set<string>();
  cardsWithTags.results.forEach((row: any) => {
    const tags = parseJsonArray(row.tags);
    tags.forEach((tag) => allTags.add(tag));
  });

  const tags = Array.from(allTags)
    .sort()
    .map((tag) => ({ value: tag, label: tag }));

  return {
    names: names.results.map((n: any) => ({ value: n.name, label: n.name })),
    tags,
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
        const locale = url.searchParams.get("locale") || DEFAULT_LOCALE;
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
          card_types: url.searchParams
            .get("cardTypes")
            ?.split(",")
            .filter(Boolean),
          rarity: url.searchParams.get("rarity")?.split(",").filter(Boolean),
          bloom_level: url.searchParams
            .get("bloomLevel")
            ?.split(",")
            .filter(Boolean),
          locale: url.searchParams.get("locale") || DEFAULT_LOCALE,
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

        const locale = url.searchParams.get("locale") || DEFAULT_LOCALE;
        const card = await getCardDetails(env, cardId, locale);
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
        const locale = url.searchParams.get("locale") || DEFAULT_LOCALE;
        const options = await getFilterOptions(env, locale);

        return new Response(JSON.stringify(options), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Route: GET /api/static-filters - Get static filter values from code tables
      if (path === "/api/static-filters" && request.method === "GET") {
        const [cardTypes, rarities, bloomLevels] = await Promise.all([
          env.DB.prepare(
            "SELECT DISTINCT card_type_code FROM cards ORDER BY card_type_code"
          ).all(),
          env.DB.prepare(
            "SELECT DISTINCT rarity_code FROM cards ORDER BY rarity_code"
          ).all(),
          env.DB.prepare(
            "SELECT DISTINCT bloom_level_code FROM cards WHERE bloom_level_code IS NOT NULL ORDER BY bloom_level_code"
          ).all(),
        ]);

        // Get unique color codes from JSON arrays
        const cardsWithColors = await env.DB.prepare(
          "SELECT DISTINCT color_codes FROM cards WHERE color_codes IS NOT NULL"
        ).all();

        const allColors = new Set<string>();
        cardsWithColors.results.forEach((row: any) => {
          const colors = parseJsonArray(row.color_codes);
          colors.forEach((color) => allColors.add(color));
        });

        const colors = Array.from(allColors).sort();

        const staticFilters = {
          cardTypes: cardTypes.results.map((ct: any) => ({
            value: ct.card_type_code,
            label: ct.card_type_code,
          })),
          colors: colors.map((color) => ({ value: color, label: color })),
          rarities: rarities.results.map((r: any) => ({
            value: r.rarity_code,
            label: r.rarity_code,
          })),
          bloomLevels: bloomLevels.results.map((bl: any) => ({
            value: bl.bloom_level_code,
            label: bl.bloom_level_code,
          })),
        };

        return new Response(JSON.stringify(staticFilters), {
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
