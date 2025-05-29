<script setup lang="ts">
import { CircleMinus, CirclePlus } from "lucide-vue-next";
import CardDataJson from "@/data/cards_i18n.json";

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
  decks.addCardToDeck(cardId);
};

const remove = ({ cardId }: { cardId: string }) => {
  decks.removeCardFromDeck(cardId);
};

const getImagePath = (cardId: string) => {
  const card = CardDataJson.find((c) => c.id === cardId);
  return card ? `${card.imagePath}` : "";
};
</script>

<template>
  <div class="grid grid-cols-4 md:grid-cols-10 gap-1 md:gap-2">
    <!-- <TransitionGroup name="list"> -->
    <template v-for="(item, index) in uniqueCards" :key="index">
      <div class="relative">
        <picture>
          <source
            :srcset="getImagePath(item.cardId).replace('.png', '.webp')"
            type="image/webp"
          />
          <img
            :src="getImagePath(item.cardId)"
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
