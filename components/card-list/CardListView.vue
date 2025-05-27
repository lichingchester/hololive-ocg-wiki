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
// const { t } = useI18n();

// const filterState = useFilterState();
// const listForSearch = response.map((card) => {
//   if(card.translations){
//     card.translations.tc = {
//       abilityText: t("cards.")
//       // cardType
//       // color
//       // illustrator
//       // name
//       // rarity
//       // set
//     }
//   }

//   return {
//     ...card,
//   };
// });

// console.log("CardListView mounted", filterState.value.search);

// const filteredCards = computed(() => {
//   return response.filter((card) => {
//     // filter by search term
//     if (filterState.value.search) {
//       const searchTerm = filterState.value.search.toLowerCase();
//       return (
//         card.name.toLowerCase().includes(searchTerm) ||
//         card.description.toLowerCase().includes(searchTerm)
//       );
//     }

//     return true;
//   });
// });

// const list = [
//   { title: "Hello World", content: "This is a post." },
//   { title: "Nuxt Search", content: "How to implement search..." },
// ];
// const options = { keys: ["title", "content"] };
// const fuse = new Fuse(list, options);

// const result = fuse.search("Nuxt");

console.log(response);
</script>

<template>
  <div v-resize-observer="onResizeObserver" class="p-1 sm:p-2">
    <RecycleScroller
      class="scroller"
      :items="response"
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
