<script setup lang="ts">
import { vResizeObserver } from "@vueuse/components";
import { RecycleScroller } from "vue-virtual-scroller";
import type { CardCollection } from "@/types/card";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
import Fuse from "fuse.js";

const response: CardCollection = await $fetch("/data/cards_i18n.json");

/**
 * card size and padding
 */
let cardPadding = 8;
const cardImageRatio =
  (558 + cardPadding + cardPadding) / (400 + cardPadding + cardPadding); // Ratio of card height to width
const gridColCount = shallowRef(6);
const itemSize = shallowRef(400);
const itemSecondarySize = shallowRef(558);

function onResizeObserver(entries: ResizeObserverEntry[]) {
  const [entry] = entries;
  const { width } = entry.contentRect;

  if (width < 640) {
    cardPadding = 4; // Adjust ratio for smaller screens
  } else {
    cardPadding = 8; // Default padding for larger screens
  }

  if (width < 640) {
    gridColCount.value = 3;
  } else if (width < 768) {
    gridColCount.value = 4;
  } else if (width < 1024) {
    gridColCount.value = 5;
  } else if (width < 1280) {
    gridColCount.value = 6;
  } else if (width < 1536) {
    gridColCount.value = 8;
  } else if (width < 2000) {
    gridColCount.value = 10;
  } else {
    gridColCount.value = 12;
  }

  itemSecondarySize.value = width / gridColCount.value; // Adjust item size based on the width of the container
  itemSize.value = itemSecondarySize.value * cardImageRatio; // Adjust secondary size based on the item size
}

/**
 * filter functions can be added here if needed
 */
const filterState = useFilterState();
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
const fuse = new Fuse(response, options);

const result = computed(() => {
  let filteredCards = response;

  // filter search term
  if (filterState.value.search) {
    filteredCards = fuse
      .search(filterState.value.search)
      .map((result) => result.item);
  }

  // filter by color - using OR logic
  if (Object.values(filterState.value.colors).some((value) => value)) {
    // console.log("filtering by color", filterState.value.colors);

    // Get the selected colors
    const selectedColors = Object.entries(filterState.value.colors)
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
  if (Object.values(filterState.value.cardTypes).some((value) => value)) {
    // console.log("filtering by card type", filterState.value.cardTypes);

    // Get the selected card types
    const selectedCardTypes = Object.entries(filterState.value.cardTypes)
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
  if (Object.values(filterState.value.rarity).some((value) => value)) {
    // console.log("filtering by rarity", filterState.value.rarity);

    // Get the selected rarities
    const selectedRarities = Object.entries(filterState.value.rarity)
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
  if (Object.values(filterState.value.bloomLevel).some((value) => value)) {
    // console.log("filtering by bloom level", filterState.value.bloomLevel);

    // Get the selected bloom levels
    const selectedBloomLevels = Object.entries(filterState.value.bloomLevel)
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
  <div v-resize-observer="onResizeObserver" class="p-1 sm:p-2">
    <RecycleScroller
      class="scroller"
      :items="result"
      :item-size="itemSize"
      :item-secondary-size="itemSecondarySize"
      :grid-items="gridColCount"
      key-field="id"
    >
      <template #default="{ item }">
        <div class="p-1 sm:p-2">
          <CardItem :item="item" />
        </div>
      </template>
    </RecycleScroller>
  </div>
</template>

<style scoped></style>
