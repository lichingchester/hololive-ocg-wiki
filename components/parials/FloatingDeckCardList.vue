<script setup lang="ts">
import { CircleMinus, CirclePlus, Trash2 } from "lucide-vue-next";
import type { Card } from "~/types/card";

const props = defineProps<{
  cardIds: string[];
}>();

// Use the decks store's optimized method to get cards
// const decksStore = useDecks();

const cardStore = useCardStore();

// Create a reactive state to track card loading - with improved initial state check
const cardsReady = ref(cardStore.allCards.value.length > 0);

// Load cards when component mounts if not already loaded
onMounted(async () => {
  // Only trigger load if cards aren't already loaded
  if (cardStore.allCards.value.length === 0) {
    try {
      await cardStore.loadCards();
    } finally {
      // Ensure we mark cards as ready even if there was an error
      cardsReady.value = true;
    }
  }
});

// Group cards by ID and count occurrences with memoization and better loading states
const uniqueCards = computed(() => {
  // Wait for cards to be loaded to avoid errors
  if (!cardsReady.value || cardStore.isLoading.value) {
    return [];
  }

  // Use a Map for better performance with large datasets
  const cardMap = new Map();

  // Process only valid cardIds to prevent unnecessary lookups
  for (let i = 0; i < props.cardIds.length; i++) {
    const cardId = props.cardIds[i];

    // Skip invalid card IDs early
    if (!cardId || !cardStore.getCardById(cardId)) {
      continue;
    }

    if (!cardMap.has(cardId)) {
      cardMap.set(cardId, { cardId, count: 0 });
    }
    cardMap.get(cardId).count++;
  }

  return Array.from(cardMap.values());
});

const decks = useDecks();

// Optimized action methods with cached context
// Using arrow functions with parameter destructuring for better performance
const add = ({ cardId }: { cardId: string }) => {
  if (decks.currentDeck.value) {
    decks.addCardToDeck({ cardId, amount: 1 });
  }
};

const remove = ({ cardId }: { cardId: string }) => {
  if (decks.currentDeck.value) {
    decks.removeCardFromDeck({ cardId, amount: 1 });
  }
};

const removeAll = ({ cardId }: { cardId: string }) => {
  if (decks.currentDeck.value) {
    decks.removeAllCardFromDeck(cardId);
  }
};

// Direct use of cardStore methods for better performance
const getCard = (cardId: string): Card | undefined => {
  return cardStore.getCardById(cardId);
};

// Simplified function that doesn't create unnecessary card variable
const getImagePath = (cardId: string) => {
  const card = cardStore.getCardById(cardId);
  return card ? `${card.imagePath}` : "";
};
</script>

<template>
  <div
    v-if="cardStore.isLoading.value"
    class="p-4 flex justify-center items-center"
  >
    <div
      class="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent"
    ></div>
  </div>

  <div
    v-else-if="uniqueCards.length === 0"
    class="p-4 text-center text-sm text-gray-500"
  >
    {{ $t("No cards to display") }}
  </div>

  <div v-else class="grid grid-cols-4 md:grid-cols-10 gap-1 md:gap-2">
    <template v-for="item in uniqueCards" :key="item.cardId">
      <div class="relative flex">
        <Dialog>
          <DialogTrigger>
            <Image
              :src="`/${getImagePath(item.cardId)}`"
              :img-attributes="{ class: '' }"
            />
          </DialogTrigger>

          <CardItemDialogContent
            v-if="getCard(item.cardId)"
            :item="getCard(item.cardId)!"
          />
        </Dialog>

        <!-- actions -->
        <div class="absolute bottom-0 left-0 w-full flex gap-1 p-1">
          <button
            class="w-2/4 h-6 md:h-6 bg-secondary/95 rounded-sm"
            @click.prevent="add(item)"
            aria-label="Add card"
          >
            <div class="flex items-center justify-center text-xs">
              <CirclePlus class="size-3 md:size-4" />
            </div>
          </button>
          <button
            class="w-2/4 h-6 md:h-6 bg-red-500/95 rounded-sm"
            @click.prevent="remove(item)"
            aria-label="Remove card"
          >
            <div class="flex items-center justify-center text-xs">
              <CircleMinus class="size-3 text-white md:size-4" />
            </div>
          </button>
        </div>

        <div class="absolute top-0 right-0 flex flex-col gap-1 p-1">
          <button
            class="bg-red-500/90 rounded-sm size-7 md:size-8"
            @click.prevent="removeAll(item)"
            aria-label="Remove all cards"
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
