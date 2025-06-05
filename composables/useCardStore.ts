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

  // Load cards only once
  const loadCards = async () => {
    if (allCards.value.length === 0) {
      isLoading.value = true;
      try {
        // Using dynamic import for better code splitting
        const { default: cardData } = await import("@/data/cards_i18n.json");
        allCards.value = cardData as unknown as CardCollection;

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

        // Build sets of unique names and tags
        allCards.value.forEach((card) => {
          const translation = card.translations[locale];
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
        });

        // Convert to sorted option arrays
        const nameOptions = Array.from(nameSet)
          .sort()
          .map((name) => ({ value: name, label: name }));

        const tagOptions = Array.from(tagSet)
          .sort()
          .map((tag) => ({ value: tag, label: tag }));

        // Cache the results
        nameOptionsCache.value.set(locale, nameOptions);
        tagOptionsCache.value.set(locale, tagOptions);
      }
    });
  };

  // Get card by ID
  const getCardById = (id: string): Card | undefined => {
    return allCards.value.find((card) => card.id === id);
  };

  // Get filtered cards with caching
  const getFilteredCards = (filterOptions: FilterOptions, locale: Locales) => {
    // Create a cache key from the filter options
    const cacheKey = JSON.stringify({ ...filterOptions, locale });

    // Return cached result if available
    if (filterCache.value.has(cacheKey)) {
      filteredCards.value = filterCache.value.get(cacheKey)!;
      return filteredCards.value;
    }

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
          `translations.${locale}.set`,
          `translations.${locale}.illustrator`,
          `translations.${locale}.oshiSkill.name`,
          `translations.${locale}.oshiSkill.effect`,
          `translations.${locale}.spOshiSkill.name`,
          `translations.${locale}.spOshiSkill.effect`,
        ],
        threshold: 0.35,
        ignoreLocation: true,
        minMatchCharLength: 2,
      });
      result = fuse.search(filterOptions.search).map((item) => item.item);
    }

    // Apply other filters (colors, cardTypes, etc.)
    // filter by name
    if (filterOptions.name) {
      result = result.filter((card) => {
        const translation = card.translations[locale];
        return (
          translation?.name
            ?.toLowerCase()
            ?.includes(filterOptions.name.toLowerCase()) || false
        );
      });
    }

    // filter by tag
    if (filterOptions.tag) {
      result = result.filter((card) => {
        const translation = card.translations[locale];
        return (
          translation?.tags?.some((tag) =>
            tag.toLowerCase().includes(filterOptions.tag.toLowerCase())
          ) || false
        );
      });
    }

    // filter by colors
    const colorCodes = Object.keys(filterOptions.colors).filter(
      (color) =>
        filterOptions.colors[color as keyof typeof filterOptions.colors]
    );
    if (colorCodes.length > 0) {
      result = result.filter((card) => colorCodes.includes(card.colorCode));
    }

    // filter by card types
    const cardTypeCodes = Object.keys(filterOptions.cardTypes).filter(
      (type) =>
        filterOptions.cardTypes[type as keyof typeof filterOptions.cardTypes]
    );
    if (cardTypeCodes.length > 0) {
      result = result.filter((card) =>
        cardTypeCodes.includes(card.cardTypeCode)
      );
    }

    // filter by rarity
    const rarityCodes = Object.keys(filterOptions.rarity).filter(
      (rarity) =>
        filterOptions.rarity[rarity as keyof typeof filterOptions.rarity]
    );
    if (rarityCodes.length > 0) {
      result = result.filter((card) => rarityCodes.includes(card.rarityCode));
    }

    // filter by bloom level
    const bloomLevelCodes = Object.keys(filterOptions.bloomLevel).filter(
      (level) =>
        filterOptions.bloomLevel[level as keyof typeof filterOptions.bloomLevel]
    );
    if (bloomLevelCodes.length > 0) {
      result = result.filter(
        (card) =>
          card.bloomLevelCode && bloomLevelCodes.includes(card.bloomLevelCode)
      );
    }

    // Cache and return the result
    filterCache.value.set(cacheKey, result);
    filteredCards.value = result;
    return result;
  };

  // Clear cache when needed (e.g., language change)
  const clearCache = () => {
    filterCache.value.clear();

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
    precomputeFilterOptions,
  };
};
