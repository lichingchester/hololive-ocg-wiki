import Fuse from "fuse.js";
import type { CardCollection, Locales, Translations } from "~/types/card";
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

  // Load cards only once
  const loadCards = async () => {
    if (allCards.value.length === 0) {
      isLoading.value = true;
      try {
        // Using dynamic import for better code splitting
        const { default: cardData } = await import("@/data/cards_i18n.json");
        allCards.value = cardData as unknown as CardCollection;
      } finally {
        isLoading.value = false;
      }
    }
    return allCards.value;
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
  };

  return {
    allCards,
    filteredCards,
    isLoading,
    loadCards,
    getFilteredCards,
    clearCache,
  };
};
