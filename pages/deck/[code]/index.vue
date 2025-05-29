<script setup lang="ts">
import { toast } from "vue-sonner";

const decks = useDecks();
const currentDeck = computed(() => decks.currentDeck.value);

const route = useRoute();

console.log("Current route params:", route.params);

onMounted(() => {
  // const status = decks.checkForSharedDeck();
  // if (status) {
  //   if (currentDeck.value) {
  //     toast.success(`URL deck "${currentDeck.value.name}" imported!`);
  //   }
  // }
});
</script>

<template>
  <div class="container mx-auto p-2 md:p-4"></div>
</template>
