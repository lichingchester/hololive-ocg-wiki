<script setup lang="ts">
const props = defineProps<{
  cardIds: string[];
}>();

const cardStore = useCardStore();

// Group cards by ID and count occurrences
const uniqueCards = computed(() => {
  const cardMap = new Map();

  props.cardIds.forEach((cardId) => {
    if (!cardMap.has(cardId)) {
      cardMap.set(cardId, { cardId, count: 0 });
    }
    cardMap.get(cardId).count++;
  });

  const cards = Array.from(cardMap.values()).map((item) => {
    const card = cardStore.getCardById(item.cardId);
    return { ...item, card };
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
          <DialogTrigger class="">
            <Image
              v-if="item.card.imagePath"
              class="flex-[0_0_400px]"
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
