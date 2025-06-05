<script setup lang="ts">
const props = defineProps<{
  cardIds: string[];
}>();

// const cardStore = useCardStore();
const decksStore = useDecks();

// Group cards by ID and count occurrences
const uniqueCards = computed(() => {
  const cardMap = new Map();

  // Skip processing if there are no card IDs
  if (!props.cardIds.length) return [];

  // Collect card IDs and count occurrences
  props.cardIds.forEach((cardId) => {
    if (!cardMap.has(cardId)) {
      cardMap.set(cardId, { cardId, count: 0 });
    }
    cardMap.get(cardId).count++;
  });

  // Get unique card IDs for efficient lookup
  const uniqueCardIds = Array.from(cardMap.keys());

  // Use the optimized getCardsByIds method which now returns sorted cards
  const sortedCards = decksStore.getCardsByIds(uniqueCardIds);

  // Create a result array that preserves the sorting from getCardsByIds
  const cards = sortedCards.map((card) => {
    const count = cardMap.get(card.id).count;
    return {
      cardId: card.id,
      count,
      card,
    };
  });

  return cards;
});
</script>

<template>
  <div
    class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1 md:gap-3"
  >
    <template v-for="(item, index) in uniqueCards" :key="index">
      <div class="relative flex">
        <Dialog>
          <DialogTrigger class="w-full">
            <Image
              v-if="item.card.imagePath"
              class="flex-[0_0_400px] aspect-400/559"
              :src="`/${item.card.imagePath}`"
              :img-attributes="{ class: '' }"
            />
          </DialogTrigger>

          <CardItemDialogContent v-if="item.card" :item="item.card" />
        </Dialog>

        <CardCountBadge :count="item.count" :size="'large'" />
      </div>
    </template>
  </div>
</template>
