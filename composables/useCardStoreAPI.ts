import type { Card, CardCollection, Locales } from "~/types/card";
import type { FilterOptions } from "~/types/filter";

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

interface FilterResponse {
  cards: CardCollection;
  total: number;
}

interface FilterOptionsResponse {
  names: { value: string; label: string }[];
  tags: { value: string; label: string }[];
  sets: { value: string; label: string }[];
}

// New API-based card store
export const useCardStoreAPI = () => {
  // State management
  const allCards = useState<CardCollection>("cards", () => []);
  const filteredCards = useState<CardCollection>("filteredCards", () => []);
  const isLoading = useState<boolean>("cardsLoading", () => false);
  const totalCards = useState<number>("totalCards", () => 0);
  const currentPage = useState<number>("currentPage", () => 1);

  // Cache for API responses
  const filterCache = useState<Map<string, FilterResponse>>(
    "filterCache",
    () => new Map()
  );

  // Cache for filter options
  const filterOptionsCache = useState<Map<string, FilterOptionsResponse>>(
    "filterOptionsCache",
    () => new Map()
  );

  // Configuration
  const runtimeConfig = useRuntimeConfig();
  const apiBaseUrl =
    runtimeConfig.public.apiUrl ||
    "https://your-worker.your-subdomain.workers.dev";

  // API call helper with error handling
  const apiCall = async <T>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<T> => {
    try {
      const url = new URL(`${apiBaseUrl}${endpoint}`);

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              url.searchParams.set(key, value.join(","));
            } else {
              url.searchParams.set(key, String(value));
            }
          }
        });
      }

      const response = await $fetch<T>(url.toString());
      return response;
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  };

  // Helper function to normalize card data from API response
  const normalizeCard = (card: any): Card => {
    return {
      ...card,
      // // Handle field name mappings from worker response
      // colorCodes: card.colorCodes || card.color_codes || [],
      // batonTouchTypes: card.batonTouchTypes || card.baton_touch_types || [],
      // cardSets: card.cardSets || card.card_sets || [],
      // tags: card.tags || [],
      // // Maintain backward compatibility
      // colorCode:
      //   card.colorCode ||
      //   (card.colorCodes && card.colorCodes[0]) ||
      //   (card.color_codes && card.color_codes[0]),
      // set:
      //   card.set ||
      //   (card.cardSets && card.cardSets[0]) ||
      //   (card.card_sets && card.card_sets[0]),
    };
  };

  // Load cards with filtering - now uses API
  const loadCards = async (
    filterOptions?: FilterOptions,
    locale: Locales = "en"
  ) => {
    // For compatibility, if no filters provided, load first page
    if (!filterOptions) {
      const defaultFilters: FilterOptions = {
        search: "",
        name: "",
        tag: "",
        set: "",
        colors: {
          white: false,
          green: false,
          red: false,
          blue: false,
          purple: false,
          yellow: false,
          blue_red: false,
          white_green: false,
          null: false,
        },
        cardTypes: {
          buzzCharacter: false,
          character: false,
          oshiCharacter: false,
          supportCheer: false,
          supportEvent: false,
          supportEventLimited: false,
          supportFan: false,
          supportTool: false,
          supportItem: false,
          supportItemLimited: false,
          supportMascot: false,
          supportStaffLimited: false,
        },
        rarity: {
          C: false,
          OC: false,
          OSR: false,
          OUR: false,
          P: false,
          R: false,
          RR: false,
          S: false,
          SEC: false,
          SR: false,
          SY: false,
          U: false,
          UR: false,
        },
        bloomLevel: {
          debut: false,
          first: false,
          second: false,
          spot: false,
        },
      };
      return await getFilteredCards(defaultFilters, locale);
    }

    return await getFilteredCards(filterOptions, locale);
  };

  // Get filtered cards from API
  const getFilteredCards = async (
    filterOptions: FilterOptions,
    locale: Locales,
    page: number = 1,
    limit: number = 50
  ): Promise<CardCollection> => {
    // Create cache key
    const cacheKey = JSON.stringify({ ...filterOptions, locale, page, limit });

    // Return cached result if available
    if (filterCache.value.has(cacheKey)) {
      const cached = filterCache.value.get(cacheKey)!;
      filteredCards.value = cached.cards;
      totalCards.value = cached.total;
      currentPage.value = page;
      return cached.cards;
    }

    isLoading.value = true;

    try {
      // Convert filter options to API parameters
      const apiParams: Record<string, any> = {
        locale,
        page,
        limit,
      };

      // Add search parameters
      if (filterOptions.search?.trim()) {
        apiParams.search = filterOptions.search.trim();
      }
      if (filterOptions.name?.trim()) {
        apiParams.name = filterOptions.name.trim();
      }
      if (filterOptions.tag?.trim()) {
        apiParams.tag = filterOptions.tag.trim();
      }
      if (filterOptions.set?.trim()) {
        apiParams.set = filterOptions.set.trim();
      }

      // Add array filters (only include active ones)
      const activeColors = Object.keys(filterOptions.colors).filter(
        (color) =>
          filterOptions.colors[color as keyof typeof filterOptions.colors]
      );
      if (activeColors.length > 0) {
        apiParams.colors = activeColors;
      }

      const activeCardTypes = Object.keys(filterOptions.cardTypes).filter(
        (type) =>
          filterOptions.cardTypes[type as keyof typeof filterOptions.cardTypes]
      );
      if (activeCardTypes.length > 0) {
        apiParams.cardTypes = activeCardTypes;
      }

      const activeRarities = Object.keys(filterOptions.rarity).filter(
        (rarity) =>
          filterOptions.rarity[rarity as keyof typeof filterOptions.rarity]
      );
      if (activeRarities.length > 0) {
        apiParams.rarity = activeRarities;
      }

      const activeBloomLevels = Object.keys(filterOptions.bloomLevel).filter(
        (level) =>
          filterOptions.bloomLevel[
            level as keyof typeof filterOptions.bloomLevel
          ]
      );
      if (activeBloomLevels.length > 0) {
        apiParams.bloomLevel = activeBloomLevels;
      }

      // Make API call
      const response = await apiCall<FilterResponse>(
        "/api/cards/filter",
        apiParams
      );

      // Update state
      filteredCards.value = response.cards.map(normalizeCard);
      console.log("filteredCards.value:", filteredCards.value);
      totalCards.value = response.total;
      currentPage.value = page;

      // Cache the result with normalized cards
      filterCache.value.set(cacheKey, {
        cards: filteredCards.value,
        total: response.total,
      });

      return response.cards;
    } catch (error) {
      console.error("Failed to fetch filtered cards:", error);
      // Fallback to empty array on error
      filteredCards.value = [];
      totalCards.value = 0;
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  // Get card by ID from API
  const getCardById = async (id: string): Promise<Card | undefined> => {
    try {
      const response = await apiCall<{ card: Card }>(`/api/cards/${id}`);
      return response.card ? normalizeCard(response.card) : undefined;
    } catch (error) {
      console.error(`Failed to fetch card ${id}:`, error);
      return undefined;
    }
  };

  // Search cards using API
  const searchCards = async (
    query: string,
    locale: Locales = "en",
    limit: number = 100
  ): Promise<CardCollection> => {
    if (!query.trim()) {
      return [];
    }

    try {
      isLoading.value = true;
      const response = await apiCall<{ cards: CardCollection }>(
        "/api/cards/search",
        {
          q: query.trim(),
          locale,
          limit,
        }
      );

      return response.cards.map(normalizeCard);
    } catch (error) {
      console.error("Search failed:", error);
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  // Get filter options from API
  const getFilterOptions = async (
    locale: Locales
  ): Promise<FilterOptionsResponse> => {
    // Check cache first
    if (filterOptionsCache.value.has(locale)) {
      return filterOptionsCache.value.get(locale)!;
    }

    try {
      const response = await apiCall<FilterOptionsResponse>(
        "/api/filter-options",
        { locale }
      );

      // Cache the result
      filterOptionsCache.value.set(locale, response);

      return response;
    } catch (error) {
      console.error("Failed to fetch filter options:", error);
      return { names: [], tags: [], sets: [] };
    }
  };

  // Get name options for a locale
  const getNameOptions = async (locale: Locales) => {
    const options = await getFilterOptions(locale);
    return options.names;
  };

  // Get tag options for a locale
  const getTagOptions = async (locale: Locales) => {
    const options = await getFilterOptions(locale);
    return options.tags;
  };

  // Get set options for a locale
  const getSetOptions = async (locale: Locales) => {
    const options = await getFilterOptions(locale);
    return options.sets;
  };

  // Clear caches
  const clearCache = () => {
    filterCache.value.clear();
    filterOptionsCache.value.clear();
  };

  // Load more cards for pagination
  const loadMoreCards = async (
    filterOptions: FilterOptions,
    locale: Locales,
    nextPage: number
  ): Promise<CardCollection> => {
    const newCards = await getFilteredCards(filterOptions, locale, nextPage);

    // Append to existing cards if this is page > 1
    if (nextPage > 1) {
      filteredCards.value = [...filteredCards.value, ...newCards];
    }

    return newCards;
  };

  // Precompute filter options - now async
  const precomputeFilterOptions = async (locale: Locales) => {
    if (process.server) return;

    // Preload filter options for better UX
    setTimeout(() => {
      getFilterOptions(locale);
    }, 100);
  };

  return {
    // State
    allCards,
    filteredCards,
    isLoading,
    totalCards,
    currentPage,

    // Main methods
    loadCards,
    getFilteredCards,
    getCardById,
    searchCards,

    // Filter options
    getNameOptions,
    getTagOptions,
    getSetOptions,
    getFilterOptions,

    // Pagination
    loadMoreCards,

    // Cache management
    clearCache,
    precomputeFilterOptions,
  };
};
