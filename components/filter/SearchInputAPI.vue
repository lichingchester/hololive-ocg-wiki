<script setup lang="ts">
const { locale } = useI18n();
const filter = useFilter();

// Use API-based store instead of local processing
const cardStore = useCardStoreAPI();

// Loading state for better UX
const isSearching = ref(false);

// Debounced search function
const debouncedSearch = useDebounceFn(async () => {
  if (!filter.filter.value.search?.trim()) {
    return;
  }

  isSearching.value = true;
  try {
    // Trigger search through the filter system
    await cardStore.getFilteredCards(filter.filter.value, locale.value);
  } finally {
    isSearching.value = false;
  }
}, 300);

// Watch search input changes
watch(() => filter.filter.value.search, debouncedSearch);
</script>

<template>
  <div class="relative">
    <Input
      v-model="filter.filter.value.search"
      id="search"
      type="text"
      placeholder="Search cards..."
      class="pr-8"
    />
    <div
      v-if="isSearching"
      class="absolute right-2 top-1/2 transform -translate-y-1/2"
    >
      <div
        class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"
      ></div>
    </div>
  </div>
</template>
