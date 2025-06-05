<script setup lang="ts">
import { vResizeObserver } from "@vueuse/components";
import { useDebounceFn } from "@vueuse/core";
import { RecycleScroller } from "vue-virtual-scroller";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";

const { locale } = useI18n();
const filter = useFilter();
const cardStore = useCardStore();

// debug
// cardData = [
//   ...cardData.slice(0, 5),
//   ...cardData.slice(70, 80),
//   ...cardData.slice(400, 500),
// ]; // Limit to the first 1000 cards for performance

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
// Debounced filter application
const applyFilters = useDebounceFn(() => {
  cardStore.getFilteredCards(filter.filter.value, locale.value);
}, 250);

// Apply filters when filter changes
watch(() => filter.filter.value, applyFilters, { deep: true });

// Also update when locale changes
watch(
  () => locale.value,
  () => {
    cardStore.clearCache();
    applyFilters();
  }
);

// Initial filter application
onMounted(() => {
  applyFilters();
});

// Use the filtered cards from the store
const result = computed(() => cardStore.filteredCards.value);
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
        <div class="p-1">
          <CardItem :item="item" />
        </div>
      </template>
    </RecycleScroller>

    <div class="h-[65vh]"></div>
  </div>
</template>
