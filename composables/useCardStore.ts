import Fuse from "fuse.js";
import { LOCALES } from "~/constants/app";
import type { Card, CardCollection, Locales, Translations } from "~/types/card";
import type { FilterOptions } from "~/types/filter";

// composables/useCardStore.ts
export const useCardStore = () => {
  // Create shared state that persists between component instances
  const allCards = useState<CardCollection>("cards", () => []);
  const filteredCards = useState<CardCollection>("filteredCards", () => []);
  const isLoading = useState<boolean>("cardsLoading", () => false);

  // Add these new state variables at the top of useCardStore
  const colorIndex = useState<Map<string, Card[]>>(
    "colorIndex",
    () => new Map()
  );
  const cardTypeIndex = useState<Map<string, Card[]>>(
    "cardTypeIndex",
    () => new Map()
  );
  const rarityIndex = useState<Map<string, Card[]>>(
    "rarityIndex",
    () => new Map()
  );
  const bloomLevelIndex = useState<Map<string, Card[]>>(
    "bloomLevelIndex",
    () => new Map()
  );
  const nameIndex = useState<Map<string, Card[]>>("nameIndex", () => new Map());
  const tagIndex = useState<Map<string, Card[]>>("tagIndex", () => new Map());
  const setIndex = useState<Map<string, Card[]>>("setIndex", () => new Map());

  // Add this new function to create indexes
  const createIndexes = () => {
    // Clear existing indexes
    colorIndex.value.clear();
    cardTypeIndex.value.clear();
    rarityIndex.value.clear();
    bloomLevelIndex.value.clear();
    nameIndex.value.clear();
    tagIndex.value.clear();
    setIndex.value.clear();

    // Create indexes
    allCards.value.forEach((card) => {
      // Index by color
      if (!colorIndex.value.has(card.colorCode)) {
        colorIndex.value.set(card.colorCode, []);
      }
      colorIndex.value.get(card.colorCode)!.push(card);

      // Index by card type
      if (!cardTypeIndex.value.has(card.cardTypeCode)) {
        cardTypeIndex.value.set(card.cardTypeCode, []);
      }
      cardTypeIndex.value.get(card.cardTypeCode)!.push(card);

      // Index by rarity
      if (!rarityIndex.value.has(card.rarityCode)) {
        rarityIndex.value.set(card.rarityCode, []);
      }
      rarityIndex.value.get(card.rarityCode)!.push(card);

      // Index by bloom level
      if (card.bloomLevelCode) {
        if (!bloomLevelIndex.value.has(card.bloomLevelCode)) {
          bloomLevelIndex.value.set(card.bloomLevelCode, []);
        }
        bloomLevelIndex.value.get(card.bloomLevelCode)!.push(card);
      }

      // Index by name and tag for each locale
      Object.keys(card.translations).forEach((locale) => {
        const translation = card.translations[locale as Locales];

        // Index by name
        if (translation?.name) {
          const nameKey = `${locale}:${translation.name.toLowerCase()}`;
          if (!nameIndex.value.has(nameKey)) {
            nameIndex.value.set(nameKey, []);
          }
          nameIndex.value.get(nameKey)!.push(card);
        }

        // Index by tags
        if (translation?.tags) {
          translation.tags.forEach((tag) => {
            const tagKey = `${locale}:${tag.toLowerCase()}`;
            if (!tagIndex.value.has(tagKey)) {
              tagIndex.value.set(tagKey, []);
            }
            tagIndex.value.get(tagKey)!.push(card);
          });
        }

        // Index by set
        if (translation?.set) {
          const setKey = `${locale}:${translation.set.toLowerCase()}`;
          if (!setIndex.value.has(setKey)) {
            setIndex.value.set(setKey, []);
          }
          setIndex.value.get(setKey)!.push(card);
        }
      });
    });
  };

  // Cache for filter results to avoid repeated calculations
  const filterCache = useState<Map<string, CardCollection>>(
    "filterCache",
    () => new Map()
  );

  // Cache for names and tags to improve filter component performance
  const nameOptionsCache = useState<
    Map<string, { value: string; label: string }[]>
  >("nameOptionsCache", () => new Map());

  const tagOptionsCache = useState<
    Map<string, { value: string; label: string }[]>
  >("tagOptionsCache", () => new Map());

  const setOptionsCache = useState<
    Map<string, { value: string; label: string }[]>
  >("setOptionsCache", () => new Map());

  // Load cards only once
  const loadCards = async () => {
    if (allCards.value.length === 0) {
      isLoading.value = true;
      try {
        // Using dynamic import for better code splitting
        const { default: cardData } = await import("@/data/cards_i18n.json");
        allCards.value = cardData as unknown as CardCollection;

        // Create indexes after loading cards
        createIndexes();

        // Pre-compute frequently used filter options after initial load
        // This will help reduce computation in UI components
        process.server
          ? null
          : setTimeout(() => precomputeFilterOptions(), 100);
      } finally {
        isLoading.value = false;
      }
    }
    return allCards.value;
  };

  // Precompute filter options for better performance
  const precomputeFilterOptions = () => {
    // Don't run on server side
    if (process.server) return;

    // Get available locales
    const locales: Locales[] = LOCALES; // Add all supported locales

    // Precompute for each locale
    locales.forEach((locale) => {
      if (!nameOptionsCache.value.has(locale)) {
        const nameSet = new Set<string>();
        const tagSet = new Set<string>();
        const setSet = new Set<string>();

        // Build sets of unique names, tags and sets
        allCards.value.forEach((card) => {
          const translation = card.translations[locale];
          const jaTranslation = card.translations["ja"];

          if (translation?.name) {
            nameSet.add(translation.name);
          }

          if (translation?.tags && Array.isArray(translation.tags)) {
            translation.tags.forEach((tag) => {
              if (tag && typeof tag === "string") {
                tagSet.add(tag);
              }
            });
          }

          if (jaTranslation?.set) {
            setSet.add(jaTranslation.set);
          }
        });

        // Convert to sorted option arrays
        const nameOptions = Array.from(nameSet)
          .sort()
          .map((name) => ({ value: name, label: name }));

        const tagOptions = Array.from(tagSet)
          .sort()
          .map((tag) => ({ value: tag, label: tag }));

        const setOptions = Array.from(setSet)
          .sort()
          .map((set) => ({ value: set, label: set }));

        // Cache the results
        nameOptionsCache.value.set(locale, nameOptions);
        tagOptionsCache.value.set(locale, tagOptions);
        setOptionsCache.value.set(locale, setOptions);
      }
    });
  };

  // Get card by ID
  const getCardById = (id: string): Card | undefined => {
    return allCards.value.find((card) => card.id === id);
  };

  // Get filtered cards with caching
  const getFilteredCards = async (
    filterOptions: FilterOptions,
    locale: Locales
  ) => {
    // Create a cache key from the filter options
    const cacheKey = JSON.stringify({ ...filterOptions, locale });

    // Return cached result if available
    if (filterCache.value.has(cacheKey)) {
      filteredCards.value = filterCache.value.get(cacheKey)!;
      return filteredCards.value;
    }

    // Set loading state to true before filtering
    isLoading.value = true;

    try {
      // Otherwise, apply filters
      let result = allCards.value;

      // Apply search filter if needed
      if (filterOptions.search) {
        const fuse = new Fuse(result, {
          keys: [
            "id",
            "cardNumber",
            "rarityCode",
            `translations.en.name`,
            `translations.en.color`,
            `translations.en.oshiSkill.name`,
            `translations.en.spOshiSkill.name`,
            `translations.${locale}.name`,
            `translations.${locale}.cardType`,
            `translations.${locale}.color`,
            `translations.ja.set`,
            `translations.${locale}.set`,
            `translations.${locale}.illustrator`,
            `translations.${locale}.oshiSkill.name`,
            `translations.${locale}.oshiSkill.effect`,
            `translations.${locale}.spOshiSkill.name`,
            `translations.${locale}.spOshiSkill.effect`,
          ],
          threshold: 0.5,
          ignoreLocation: true,
          minMatchCharLength: locale === "en" ? 2 : 1,
          useExtendedSearch: true,
        });
        result = fuse.search(filterOptions.search).map((item) => item.item);
      }

      // Apply filters using indexes
      const filters: Card[] = [];

      // Filter by name using index
      if (filterOptions.name) {
        const nameKey = `${locale}:${filterOptions.name.toLowerCase()}`;
        const nameMatches = nameIndex.value.get(nameKey) || [];
        filters.push(...nameMatches);
      }

      // Filter by tag using index
      if (filterOptions.tag) {
        const tagKey = `${locale}:${filterOptions.tag.toLowerCase()}`;
        const tagMatches = tagIndex.value.get(tagKey) || [];
        filters.push(...tagMatches);
      }

      // Filter by set using index
      if (filterOptions.set) {
        const setKey = `ja:${filterOptions.set.toLowerCase()}`;
        const setMatches = setIndex.value.get(setKey) || [];
        filters.push(...setMatches);
      }

      // Filter by colors using index
      const colorCodes = Object.keys(filterOptions.colors).filter(
        (color) =>
          filterOptions.colors[color as keyof typeof filterOptions.colors]
      );
      if (colorCodes.length > 0) {
        colorCodes.forEach((color) => {
          const colorMatches = colorIndex.value.get(color) || [];
          filters.push(...colorMatches);
        });
      }

      // Filter by card types using index
      const cardTypeCodes = Object.keys(filterOptions.cardTypes).filter(
        (type) =>
          filterOptions.cardTypes[type as keyof typeof filterOptions.cardTypes]
      );
      if (cardTypeCodes.length > 0) {
        cardTypeCodes.forEach((type) => {
          const typeMatches = cardTypeIndex.value.get(type) || [];
          filters.push(...typeMatches);
        });
      }

      // Filter by rarity using index
      const rarityCodes = Object.keys(filterOptions.rarity).filter(
        (rarity) =>
          filterOptions.rarity[rarity as keyof typeof filterOptions.rarity]
      );
      if (rarityCodes.length > 0) {
        rarityCodes.forEach((rarity) => {
          const rarityMatches = rarityIndex.value.get(rarity) || [];
          filters.push(...rarityMatches);
        });
      }

      // Filter by bloom level using index
      const bloomLevelCodes = Object.keys(filterOptions.bloomLevel).filter(
        (level) =>
          filterOptions.bloomLevel[
            level as keyof typeof filterOptions.bloomLevel
          ]
      );
      if (bloomLevelCodes.length > 0) {
        bloomLevelCodes.forEach((level) => {
          const levelMatches = bloomLevelIndex.value.get(level) || [];
          filters.push(...levelMatches);
        });
      }

      // If we have any filters, intersect the results
      if (filters.length > 0) {
        result = result.filter((card) => filters.includes(card));
      }

      // Cache and return the result
      filterCache.value.set(cacheKey, result);
      filteredCards.value = result;
      return result;
    } finally {
      // Set loading state to false after filtering is complete
      isLoading.value = false;
    }
  };

  // Clear cache when needed (e.g., language change)
  const clearCache = () => {
    filterCache.value.clear();
    createIndexes(); // Recreate indexes when cache is cleared

    // No need to clear name and tag caches as they're precomputed per locale
    // This improves performance when switching languages
  };

  // Get cached name options for a given locale
  const getNameOptions = (locale: Locales) => {
    // Try to get from cache first
    if (nameOptionsCache.value.has(locale)) {
      return nameOptionsCache.value.get(locale) || [];
    }

    // If not in cache and we have cards, compute it now
    if (allCards.value.length > 0) {
      precomputeFilterOptions();
      return nameOptionsCache.value.get(locale) || [];
    }

    // Otherwise return empty array
    return [];
  };

  // Get cached tag options for a given locale
  const getTagOptions = (locale: Locales) => {
    // Try to get from cache first
    if (tagOptionsCache.value.has(locale)) {
      return tagOptionsCache.value.get(locale) || [];
    }

    // If not in cache and we have cards, compute it now
    if (allCards.value.length > 0) {
      precomputeFilterOptions();
      return tagOptionsCache.value.get(locale) || [];
    }

    // Otherwise return empty array
    return [];
  };

  // Get cached set options for a given locale
  const getSetOptions = (locale: Locales) => {
    // Try to get from cache first
    if (setOptionsCache.value.has(locale)) {
      return setOptionsCache.value.get(locale) || [];
    }

    // If not in cache and we have cards, compute it now
    if (allCards.value.length > 0) {
      precomputeFilterOptions();
      return setOptionsCache.value.get(locale) || [];
    }

    // Otherwise return empty array
    return [];
  };

  return {
    allCards,
    filteredCards,
    isLoading,
    loadCards,
    getFilteredCards,
    getCardById,
    clearCache,
    getNameOptions,
    getTagOptions,
    getSetOptions,
    precomputeFilterOptions,
  };
};
