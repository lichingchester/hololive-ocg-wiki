<script setup lang="ts">
import CardDataJson from "@/data/cards_i18n.json";
import type { Card } from "~/types/card";

const props = defineProps<{
  cardIds: string[];
}>();

// Group cards by ID and count occurrences
const uniqueCards = computed(() => {
  const cardMap = new Map();

  props.cardIds.forEach((cardId) => {
    if (!cardMap.has(cardId)) {
      cardMap.set(cardId, { cardId, count: 0 });
    }
    cardMap.get(cardId).count++;
  });

  return Array.from(cardMap.values());
});

const getImagePath = (cardId: string) => {
  const card = CardDataJson.find((c) => c.id === cardId);
  return card ? `${card.imagePath}` : "";
};

const getCard = (cardId: string): Card => {
  return CardDataJson.find((c) => c.id === cardId) as unknown as Card;
};
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
              class="flex-[0_0_400px]"
              :src="`/${getImagePath(item.cardId)}`"
              :img-attributes="{ class: '' }"
            />
          </DialogTrigger>

          <CardItemDialogContent :item="getCard(item.cardId)" />
        </Dialog>

        <CardCountBadge :count="item.count" :size="'large'" />
      </div>
    </template>
  </div>
</template>
