<script setup lang="ts">
import type { CardCollection } from "@/types/card";
import Fuse from "fuse.js";
import CardDataJson from "@/data/cards_i18n.json";

let cardData = CardDataJson as unknown as CardCollection;

const { locale } = useI18n();

// debug
// cardData = [
//   ...cardData.slice(0, 5),
//   ...cardData.slice(70, 80),
//   ...cardData.slice(400, 500),
// ]; // Limit to the first 1000 cards for performance

/**
 * filter functions can be added here if needed
 */
const filter = useFilter();
const options = {
  keys: [
    "id",
    "cardNumber",
    "cardTypeCode",
    "colorCode",
    "life",
    "rarityCode",
    "oshiSkill.cost",
    "spOshiSkill.cost",
    "translations.ja.name",
    "translations.ja.name",
    "translations.ja.cardType",
    "translations.ja.color",
    "translations.ja.rarity",
    "translations.ja.set",
    "translations.ja.illustrator",
    "translations.ja.oshiSkill.timing",
    "translations.ja.oshiSkill.name",
    "translations.ja.oshiSkill.effect",
    "translations.ja.spOshiSkill.timing",
    "translations.ja.spOshiSkill.name",
    "translations.ja.spOshiSkill.effect",
    "translations.tc.name",
    "translations.tc.name",
    "translations.tc.cardType",
    "translations.tc.color",
    "translations.tc.rarity",
    "translations.tc.set",
    "translations.tc.illustrator",
    "translations.tc.oshiSkill.timing",
    "translations.tc.oshiSkill.name",
    "translations.tc.oshiSkill.effect",
    "translations.tc.spOshiSkill.timing",
    "translations.tc.spOshiSkill.name",
    "translations.tc.spOshiSkill.effect",
  ],
};
const fuse = new Fuse(cardData, options);

const result = computed(() => {
  let filteredCards = cardData;

  // filter search term
  if (filter.filter.value.search) {
    filteredCards = fuse
      .search(filter.filter.value.search)
      .map((result) => result.item);
  }

  // filter by name - using OR logic
  if (filter.filter.value.name) {
    // console.log("filtering by name", filter.filter.value.name);

    // Return cards that match the name (OR logic)
    filteredCards = filteredCards.filter((item) => {
      return (
        item.translations[locale.value]?.name
          ?.toLowerCase()
          ?.includes(filter.filter.value.name.toLowerCase()) || false
      );
    });
  }

  // filter by tag - using OR logic
  if (filter.filter.value.tag) {
    // console.log("filtering by tag", filter.filter.value.tag);

    // Return cards that match the tag (OR logic)
    filteredCards = filteredCards.filter((item) => {
      // Skip cards that don't have tags field
      if (!item.translations[locale.value]?.tags) {
        return false;
      }

      return item.translations[locale.value]?.tags?.some((tag) =>
        tag.toLowerCase().includes(filter.filter.value.tag.toLowerCase())
      );
    });
  }

  // filter by color - using OR logic
  if (Object.values(filter.filter.value.colors).some((value) => value)) {
    // console.log("filtering by color", filter.filter.value.colors);

    // Get the selected colors
    const selectedColors = Object.entries(filter.filter.value.colors)
      .filter(([_, isSelected]) => isSelected)
      .map(([color]) => color);

    // Return cards that match ANY selected colors (OR logic)
    if (selectedColors.length > 0) {
      filteredCards = filteredCards.filter((item) =>
        selectedColors.includes(item.colorCode)
      );
    }
  }

  // filter by card type - using OR logic
  if (Object.values(filter.filter.value.cardTypes).some((value) => value)) {
    // console.log("filtering by card type", filter.filter.value.cardTypes);

    // Get the selected card types
    const selectedCardTypes = Object.entries(filter.filter.value.cardTypes)
      .filter(([_, isSelected]) => isSelected)
      .map(([type]) => type);

    // Return cards that match ANY selected card types (OR logic)
    if (selectedCardTypes.length > 0) {
      filteredCards = filteredCards.filter((item) =>
        selectedCardTypes.includes(item.cardTypeCode)
      );
    }
  }

  // filter by rarity - using OR logic
  if (Object.values(filter.filter.value.rarity).some((value) => value)) {
    // console.log("filtering by rarity", filter.filter.value.rarity);

    // Get the selected rarities
    const selectedRarities = Object.entries(filter.filter.value.rarity)
      .filter(([_, isSelected]) => isSelected)
      .map(([rarity]) => rarity);

    // Return cards that match ANY selected rarities (OR logic)
    if (selectedRarities.length > 0) {
      filteredCards = filteredCards.filter((item) =>
        selectedRarities.includes(item.rarityCode)
      );
    }
  }

  // filter by bloomLevel - using OR logic
  if (Object.values(filter.filter.value.bloomLevel).some((value) => value)) {
    // console.log("filtering by bloom level", filter.filter.value.bloomLevel);

    // Get the selected bloom levels
    const selectedBloomLevels = Object.entries(filter.filter.value.bloomLevel)
      .filter(([_, isSelected]) => isSelected)
      .map(([level]) => level);

    // Return cards that match ANY selected bloom levels (OR logic)
    if (selectedBloomLevels.length > 0) {
      filteredCards = filteredCards.filter((item) => {
        // If bloomLevelCode doesn't exist and any bloom level is selected, filter out this card
        if (
          !item.hasOwnProperty("bloomLevelCode") ||
          item.bloomLevelCode === undefined
        ) {
          return false;
        }
        // Otherwise, check if the card's bloomLevelCode matches any selected level
        return selectedBloomLevels.includes(item.bloomLevelCode);
      });
    }
  }

  return filteredCards;
});

// console.log("search", result.value);
</script>

<template>
  <div
    class="p-1 sm:p-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-1 sm:gap-2"
  >
    <template v-for="(item, index) in result" :key="index">
      <CardItem :item="item" class="aspect-400/559" />
    </template>

    <div class="h-[65vh]"></div>
  </div>
</template>

<style scoped></style>
