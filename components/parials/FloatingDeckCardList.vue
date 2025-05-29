<script setup lang="ts">
import type { Card, CardCollection } from "~/types/card";
import { CircleMinus, CirclePlus } from "lucide-vue-next";

const props = defineProps<{
  cards: CardCollection;
}>();

// Group cards by ID and count occurrences
const uniqueCards = computed(() => {
  const cardMap = new Map();

  props.cards.forEach((card) => {
    if (!cardMap.has(card.id)) {
      cardMap.set(card.id, { card, count: 0 });
    }
    cardMap.get(card.id).count++;
  });

  return Array.from(cardMap.values());
});

const decks = useDecks();

const add = ({ card }: { card: Card }) => {
  decks.addCardToDeck(card);
};

const remove = ({ card }: { card: Card }) => {
  decks.removeCardFromDeck(card);
};
</script>

<template>
  <div class="grid grid-cols-4 md:grid-cols-10 gap-1 md:gap-2">
    <!-- <TransitionGroup name="list"> -->
    <template v-for="(item, index) in uniqueCards" :key="index">
      <div class="relative">
        <picture>
          <source
            :srcset="'/' + item.card.imagePath.replace('.png', '.webp')"
            type="image/webp"
          />
          <img
            :src="'/' + item.card.imagePath"
            alt=""
            class=""
            loading="lazy"
          />
        </picture>

        <!-- actions -->
        <button
          class="absolute bottom-0 left-0 w-2/4 h-5 md:h-6 bg-secondary/95 rounded-sm"
          @click="add(item)"
        >
          <div class="flex items-center justify-center text-xs">
            <CirclePlus class="size-3 md:size-4" />
          </div>
        </button>
        <button
          class="absolute bottom-0 right-0 w-2/4 h-5 md:h-6 bg-red-500/95 rounded-sm"
          @click="remove(item)"
        >
          <div class="flex items-center justify-center text-xs">
            <CircleMinus class="size-3 text-white md:size-4" />
          </div>
        </button>

        <span
          class="absolute top-0 left-0 -translate-1/5 bg-primary/95 rounded-full size-5 md:size-6 flex items-center justify-center"
        >
          <span
            class="flex items-center justify-center text-[8px] md:text-sm text-white dark:text-black leading-none font-semibold"
          >
            {{ item.count }}
          </span>
        </span>
      </div>
    </template>
    <!-- </TransitionGroup> -->
  </div>
</template>
