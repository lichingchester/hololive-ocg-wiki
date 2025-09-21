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
  extra?: string;
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

// Optimized batch enrichment function with chunking to avoid SQLite variable limits
async function enrichCardDataBatch(
  env: Env,
  cards: any[],
  locale: string
): Promise<Card[]> {
  if (cards.length === 0) return [];

  const cardIds = cards.map((card) => card.id);

  // SQLite has a limit of ~999 variables, so we need to chunk large requests
  // Use chunks of 50 to be very safe (each query might have additional variables for locale)
  const CHUNK_SIZE = 50;
  const chunks: string[][] = [];
  for (let i = 0; i < cardIds.length; i += CHUNK_SIZE) {
    chunks.push(cardIds.slice(i, i + CHUNK_SIZE));
  }

  // Helper function to execute chunked queries
  async function executeChunkedQuery(
    query: string,
    bindParams: (chunkIds: string[]) => any[]
  ) {
    const allResults: any[] = [];

    for (const chunk of chunks) {
      const placeholders = chunk.map(() => "?").join(",");
      const finalQuery = query.replace("CHUNK_PLACEHOLDERS", placeholders);
      const params = bindParams(chunk);

      const result = await env.DB.prepare(finalQuery)
        .bind(...params)
        .all();
      allResults.push(...result.results);
    }

    return { results: allResults };
  }

  // Batch query all related data with chunked queries
  const [oshiSkills, arts, keywords, keywordTranslations, qaItems] =
    await Promise.all([
      // Get all oshi skills for all cards
      executeChunkedQuery(
        `SELECT card_id, skill_type, cost, timing_code, name, effect
         FROM oshi_skills 
         WHERE card_id IN (CHUNK_PLACEHOLDERS) AND locale = ?`,
        (chunkIds) => [...chunkIds, locale]
      ),

      // Get all arts with translations for all cards
      executeChunkedQuery(
        `SELECT a.card_id, a.*, at.name, at.effect
         FROM arts a
         LEFT JOIN art_translations at ON a.id = at.art_id AND at.locale = ?
         WHERE a.card_id IN (CHUNK_PLACEHOLDERS)`,
        (chunkIds) => [locale, ...chunkIds]
      ),

      // Get all keywords for all cards
      executeChunkedQuery(
        `SELECT card_id, type, type_code
         FROM keywords 
         WHERE card_id IN (CHUNK_PLACEHOLDERS)`,
        (chunkIds) => chunkIds
      ),

      // Get all keyword translations for all cards
      executeChunkedQuery(
        `SELECT card_id, name, effect
         FROM keyword_translations 
         WHERE card_id IN (CHUNK_PLACEHOLDERS) AND locale = ?`,
        (chunkIds) => [...chunkIds, locale]
      ),

      // Get all QA items for all cards
      executeChunkedQuery(
        `SELECT card_id, title, question, answer, related_cards_html, related_card_numbers
         FROM qa_items 
         WHERE card_id IN (CHUNK_PLACEHOLDERS) AND locale = ?`,
        (chunkIds) => [...chunkIds, locale]
      ),
    ]);

  // Group related data by card_id for efficient lookup
  const oshiSkillsMap = new Map<string, any[]>();
  const artsMap = new Map<string, any[]>();
  const keywordsMap = new Map<string, any[]>();
  const keywordTranslationsMap = new Map<string, any[]>();
  const qaItemsMap = new Map<string, any[]>();

  oshiSkills.results.forEach((skill: any) => {
    if (!oshiSkillsMap.has(skill.card_id)) {
      oshiSkillsMap.set(skill.card_id, []);
    }
    oshiSkillsMap.get(skill.card_id)!.push(skill);
  });

  arts.results.forEach((art: any) => {
    if (!artsMap.has(art.card_id)) {
      artsMap.set(art.card_id, []);
    }
    artsMap.get(art.card_id)!.push(art);
  });

  keywords.results.forEach((keyword: any) => {
    if (!keywordsMap.has(keyword.card_id)) {
      keywordsMap.set(keyword.card_id, []);
    }
    keywordsMap.get(keyword.card_id)!.push(keyword);
  });

  keywordTranslations.results.forEach((trans: any) => {
    if (!keywordTranslationsMap.has(trans.card_id)) {
      keywordTranslationsMap.set(trans.card_id, []);
    }
    keywordTranslationsMap.get(trans.card_id)!.push(trans);
  });

  qaItems.results.forEach((qa: any) => {
    if (!qaItemsMap.has(qa.card_id)) {
      qaItemsMap.set(qa.card_id, []);
    }
    qaItemsMap.get(qa.card_id)!.push(qa);
  });

  // Enrich each card using the pre-loaded data
  return cards.map((card) => {
    const cardId = card.id;
    const enrichedCard = { ...card };

    // Add oshi skills
    const cardOshiSkills = oshiSkillsMap.get(cardId) || [];
    cardOshiSkills.forEach((skill: any) => {
      const skillData = {
        cost: skill.cost,
        timing_code: skill.timing_code,
        name: skill.name,
        effect: skill.effect,
      };

      if (skill.skill_type === "oshi") {
        enrichedCard.oshi_skill = skillData;
      } else if (skill.skill_type === "sp_oshi") {
        enrichedCard.sp_oshi_skill = skillData;
      }
    });

    // Add arts
    const cardArts = artsMap.get(cardId) || [];
    enrichedCard.arts = cardArts.map((art: any) => ({
      cost_count: art.cost_count,
      cost_types: parseJsonArray(art.cost_types),
      damage: art.damage,
      is_plus: art.is_plus,
      special_targets: parseJsonArray(art.special_targets),
      special_values: parseJsonArray(art.special_values),
      name: art.name,
      effect: art.effect,
    }));

    // Add keywords
    const cardKeywords = keywordsMap.get(cardId) || [];
    const cardKeywordTranslations = keywordTranslationsMap.get(cardId) || [];
    if (cardKeywords.length > 0) {
      enrichedCard.keyword = {
        type: cardKeywords[0].type,
        type_code: cardKeywords[0].type_code,
      };

      if (cardKeywordTranslations.length > 0) {
        enrichedCard.keyword.name = cardKeywordTranslations[0].name;
        enrichedCard.keyword.effect = cardKeywordTranslations[0].effect;
      }
    }

    // Add QA items
    const cardQaItems = qaItemsMap.get(cardId) || [];
    enrichedCard.qa_items = cardQaItems.map((qa: any) => ({
      title: qa.title,
      question: qa.question,
      answer: qa.answer,
      related_cards_html: qa.related_cards_html,
      related_card_numbers: parseJsonArray(qa.related_card_numbers),
    }));

    return parseCardJsonFields(enrichedCard);
  });
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
    // Try FTS search first - search across ALL locales but return results in requested locale
    const ftsStmt = env.DB.prepare(`
      SELECT DISTINCT c.*, ct.name, ct.card_type, ct.color, ct.rarity, ct.set_name, ct.ability_text, ct.extra
      FROM cards_fts cf
      JOIN cards c ON cf.card_id = c.id
      LEFT JOIN card_translations ct ON c.id = ct.card_id AND ct.locale = ?
      WHERE cards_fts MATCH ?
      ORDER BY cf.rank
      LIMIT ?
    `);

    const ftsResults = await ftsStmt.bind(locale, query, limit).all();

    // Enrich cards using batch function
    const enrichedCards = await enrichCardDataBatch(
      env,
      ftsResults.results,
      locale
    );

    return enrichedCards;
  } catch (error) {
    // Fallback to regular search if FTS table doesn't exist - also search across all locales
    console.log("FTS search failed, falling back to regular search:", error);

    const fallbackStmt = env.DB.prepare(`
      SELECT DISTINCT c.*, ct_target.name, ct_target.card_type, ct_target.color, ct_target.rarity, ct_target.set_name, ct_target.ability_text, ct_target.extra
      FROM cards c
      LEFT JOIN card_translations ct ON c.id = ct.card_id
      LEFT JOIN card_translations ct_target ON c.id = ct_target.card_id AND ct_target.locale = ?
      WHERE (
        ct.name LIKE ? OR
        ct.card_type LIKE ? OR
        ct.ability_text LIKE ? OR
        c.card_number LIKE ? OR
        c.tags LIKE ?
      )
      ORDER BY 
        CASE 
          WHEN ct_target.name LIKE ? THEN 1
          WHEN ct_target.name LIKE ? THEN 2
          ELSE 3
        END,
        ct_target.name
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

    // Enrich cards using batch function
    const enrichedCards = await enrichCardDataBatch(
      env,
      fallbackResults.results,
      locale
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
        WHERE cards_fts MATCH ? 
        LIMIT 1
      `);
      await testStmt.bind(filters.search).first();

      // FTS table exists and works, use FTS search across all locales
      query += ` JOIN cards_fts cf ON c.id = cf.card_id`;
      whereConditions.push(`cards_fts MATCH ?`);
      params.push(filters.search);
      useFTS = true;
    } catch (error) {
      // FTS table doesn't exist or FTS search failed, use regular LIKE search across all locales
      console.log("FTS search failed, falling back to regular search:", error);
      useFTS = false;

      // Join with all card translations to search across all locales
      query += ` LEFT JOIN card_translations ct_search ON c.id = ct_search.card_id`;

      const searchPattern = `%${filters.search}%`;
      whereConditions.push(`(
        ct_search.name LIKE ? OR
        ct_search.card_type LIKE ? OR
        ct_search.ability_text LIKE ? OR
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
    // Use JSON_EXTRACT to search for exact matches in the JSON array
    whereConditions.push(`EXISTS (
      SELECT 1 FROM json_each(c.tags) 
      WHERE json_each.value = ?
    )`);
    params.push(filters.tag);
  }

  // Add set filter - now searching in JSON array
  if (filters.set) {
    // Use JSON_EXTRACT to search for exact matches in the JSON array
    whereConditions.push(`EXISTS (
      SELECT 1 FROM json_each(c.card_sets) 
      WHERE json_each.value = ?
    )`);
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
    SELECT DISTINCT c.*, ct.name, ct.card_type, ct.color, ct.rarity, ct.set_name, ct.ability_text, ct.extra
    ${query}
    ${whereClause}
    ORDER BY c.card_number
    LIMIT ? OFFSET ?
  `;

  const cardsStmt = env.DB.prepare(cardsQuery);
  const cardsResult = await cardsStmt.bind(...params, limit, offset).all();

  // Enrich cards using batch function
  const enrichedCards = await enrichCardDataBatch(
    env,
    cardsResult.results,
    locale
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
    SELECT c.*, ct.name, ct.card_type, ct.color, ct.rarity, ct.set_name, ct.ability_text, ct.extra
    FROM cards c
    LEFT JOIN card_translations ct ON c.id = ct.card_id AND ct.locale = ?
    WHERE c.id = ?
  `);
  const card = await cardStmt.bind(locale, cardId).first();

  if (!card) return null;

  // Use batch enrichment for consistency (even for single card)
  const enrichedCards = await enrichCardDataBatch(env, [card], locale);
  return enrichedCards[0] || null;
}

// Get filter options (unique values for dropdowns)
async function getFilterOptions(env: Env, locale: string = DEFAULT_LOCALE) {
  const [names] = await Promise.all([
    env.DB.prepare(
      "SELECT DISTINCT name FROM card_translations WHERE locale = ? ORDER BY name"
    )
      .bind(locale)
      .all(),
  ]);

  // Get unique tags from the JSON field in cards table
  const cardsWithTags = await env.DB.prepare(
    "SELECT DISTINCT tags FROM cards WHERE tags IS NOT NULL AND tags != ''"
  ).all();

  // Get unique sets from the JSON field in cards table
  const cardsWithSets = await env.DB.prepare(
    "SELECT DISTINCT card_sets FROM cards WHERE card_sets IS NOT NULL AND card_sets != ''"
  ).all();

  const allTags = new Set<string>();
  cardsWithTags.results.forEach((row: any) => {
    const tags = parseJsonArray(row.tags);
    tags.forEach((tag) => allTags.add(tag));
  });

  const allSets = new Set<string>();
  cardsWithSets.results.forEach((row: any) => {
    const sets = parseJsonArray(row.card_sets);
    sets.forEach((set) => allSets.add(set));
  });

  const tags = Array.from(allTags)
    .sort()
    .map((tag) => ({ value: tag, label: tag }));

  const sets = Array.from(allSets)
    .sort()
    .map((set) => ({ value: set, label: set }));

  return {
    names: names.results.map((n: any) => ({ value: n.name, label: n.name })),
    tags,
    sets,
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

      // Route: GET /api/cards-list/:ids - Get multiple cards by comma-separated IDs
      if (path.startsWith("/api/cards-list/") && request.method === "GET") {
        const idsParam = path.split("/").pop();
        if (!idsParam) {
          return new Response(JSON.stringify({ error: "Card IDs required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const cardIds = idsParam.split(",").filter(Boolean);
        if (cardIds.length === 0) {
          return new Response(
            JSON.stringify({ error: "At least one Card ID required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const locale = url.searchParams.get("locale") || DEFAULT_LOCALE;

        // Get basic card data with translations for all requested cards
        const placeholders = cardIds.map(() => "?").join(",");
        const cardsStmt = env.DB.prepare(`
          SELECT c.*, ct.name, ct.card_type, ct.color, ct.rarity, ct.set_name, ct.ability_text, ct.extra
          FROM cards c
          LEFT JOIN card_translations ct ON c.id = ct.card_id AND ct.locale = ?
          WHERE c.id IN (${placeholders})
        `);

        const cardsResult = await cardsStmt.bind(locale, ...cardIds).all();

        if (cardsResult.results.length === 0) {
          return new Response(JSON.stringify({ cards: [] }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Use batch enrichment for all cards
        const enrichedCards = await enrichCardDataBatch(
          env,
          cardsResult.results,
          locale
        );

        return new Response(JSON.stringify({ cards: enrichedCards }), {
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
