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
const applyFilters = useDebounceFn(async () => {
  await cardStore.getFilteredCards(filter.filter.value, locale.value);
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

// Pagination state
const pageSize = ref(500);
const currentPage = ref(1);
const displayedCards = computed(() => {
  return result.value.slice(0, currentPage.value * pageSize.value);
});

// Infinite scroll
onMounted(() => {
  const { reset } = useInfiniteScroll(
    window,
    () => {
      // Check if we have more cards to load
      if (currentPage.value * pageSize.value < result.value.length) {
        currentPage.value++;
      }
    },
    {
      distance: 10,
      canLoadMore: () => {
        return currentPage.value * pageSize.value < result.value.length;
      },
    }
  );

  // Reset pagination when filters change
  watch(
    () => result.value,
    () => {
      reset();
      currentPage.value = 1;
    }
  );
});
</script>

<template>
  <div
    class="p-1 sm:p-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-1 sm:gap-2"
  >
    <template v-for="(item, index) in displayedCards" :key="index">
      <CardItem :item="item" class="aspect-400/559" />
    </template>
  </div>
  <!-- <div class="h-[65vh]"></div> -->
</template>

<style scoped></style>
