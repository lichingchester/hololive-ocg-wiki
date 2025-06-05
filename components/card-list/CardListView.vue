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
