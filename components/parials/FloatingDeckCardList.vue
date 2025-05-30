<script setup lang="ts">
import { CircleMinus, CirclePlus, Trash2 } from "lucide-vue-next";
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

const decks = useDecks();

const add = ({ cardId }: { cardId: string }) => {
  decks.addCardToDeck({ cardId, amount: 1 });
};

const remove = ({ cardId }: { cardId: string }) => {
  decks.removeCardFromDeck({ cardId, amount: 1 });
};

const removeAll = ({ cardId }: { cardId: string }) => {
  decks.removeAllCardFromDeck(cardId);
};

const getImagePath = (cardId: string) => {
  const card = CardDataJson.find((c) => c.id === cardId);
  return card ? `${card.imagePath}` : "";
};

const getCard = (cardId: string): Card => {
  return CardDataJson.find((c) => c.id === cardId) as unknown as Card;
};
</script>

<template>
  <div class="grid grid-cols-4 md:grid-cols-10 gap-1 md:gap-2">
    <!-- <TransitionGroup name="list"> -->
    <template v-for="(item, index) in uniqueCards" :key="index">
      <div class="relative flex">
        <Dialog>
          <DialogTrigger class="">
            <Image
              :src="`/${getImagePath(item.cardId)}`"
              :img-attributes="{ class: '' }"
            />
          </DialogTrigger>

          <CardItemDialogContent :item="getCard(item.cardId)" />
        </Dialog>

        <!-- actions -->
        <div class="absolute bottom-0 left-0 w-full flex gap-1 p-1">
          <button
            class="w-2/4 h-6 md:h-6 bg-secondary/95 rounded-sm"
            @click="add(item)"
          >
            <div class="flex items-center justify-center text-xs">
              <CirclePlus class="size-3 md:size-4" />
            </div>
          </button>
          <button
            class="w-2/4 h-6 md:h-6 bg-red-500/95 rounded-sm"
            @click="remove(item)"
          >
            <div class="flex items-center justify-center text-xs">
              <CircleMinus class="size-3 text-white md:size-4" />
            </div>
          </button>
        </div>

        <div class="absolute top-0 right-0 flex flex-col gap-1 p-1">
          <button
            class="bg-red-500/90 rounded-sm size-7 md:size-8"
            @click="removeAll(item)"
          >
            <div class="flex items-center justify-center text-xs">
              <Trash2 class="size-3 text-white md:size-4" />
            </div>
          </button>
        </div>

        <CardCountBadge :count="item.count" :size="'small'" />
      </div>
    </template>
    <!-- </TransitionGroup> -->
  </div>
</template>
