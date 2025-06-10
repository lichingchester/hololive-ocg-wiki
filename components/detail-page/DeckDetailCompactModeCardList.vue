<script setup lang="ts">
const props = defineProps<{
  oshiCardIds: string[];
  mainCardIds: string[];
  yellCardIds: string[];
}>();

// const cardStore = useCardStore();
const decksStore = useDecks();

// Group cards by ID and count occurrences
const uniqueCards = computed(() => {
  return (cardIds: string[]) => {
    const cardMap = new Map();

    // Skip processing if there are no card IDs
    if (!cardIds.length) return [];

    // Collect card IDs and count occurrences
    cardIds.forEach((cardId) => {
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
  };
});
</script>

<template>
  <div
    class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-12 gap-2"
  >
    <template v-for="(item, index) in uniqueCards(oshiCardIds)" :key="index">
      <div class="flex flex-col gap-2">
        <Badge class="px-1 text-md w-full">
          {{ $t("Oshi") }}
        </Badge>

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
      </div>
    </template>

    <template v-for="(item, index) in uniqueCards(yellCardIds)" :key="index">
      <div class="flex flex-col gap-2">
        <Badge class="px-1 text-md w-full">
          {{ $t("Yell Deck") }}
        </Badge>

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
      </div>
    </template>
  </div>
  <div
    class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-12 gap-2"
  >
    <template v-for="(item, index) in uniqueCards(mainCardIds)" :key="index">
      <div class="flex flex-col gap-2">
        <Badge class="px-1 text-md w-full">
          {{ $t("Main Deck") }}
        </Badge>

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
      </div>
    </template>
  </div>
</template>
