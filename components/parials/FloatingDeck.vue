<script setup lang="ts">
const decks = useDecks();

const isActive = ref(false);
const toggleFloatingDeck = () => {
  isActive.value = !isActive.value;
};

const isEditing = computed(() => decks.isEditing.value);

const oshiCards = computed(() => {
  return decks.currentDeck.value?.oshiCards || [];
});

const mainCards = computed(() => {
  return decks.currentDeck.value?.mainCards || [];
});

const yellCards = computed(() => {
  return decks.currentDeck.value?.yellCards || [];
});
</script>

<template>
  <div class="fixed bottom-full left-0 m-2 z-40">
    <div
      class="bg-white dark:bg-gray-800 p-2 md:p-4 rounded-lg shadow-lg border"
    >
      <div class="font-semibold mb-2">oshi</div>
      <div class="flex gap-1">
        <template v-for="card in oshiCards" :key="card.id">
          <picture>
            <source
              :srcset="'/' + card.imagePath.replace('.png', '.webp')"
              type="image/webp"
            />
            <img
              :src="'/' + card.imagePath"
              alt=""
              class="w-12"
              loading="lazy"
            />
          </picture>
        </template>
      </div>
    </div>
  </div>
</template>
