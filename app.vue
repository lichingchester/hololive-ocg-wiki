<script setup lang="ts">
import { Toaster } from "@/components/ui/sonner";
import "vue-sonner/style.css"; // vue-sonner v2 requires this import
import { toast } from "vue-sonner";

const decks = useDecks();
const currentDeck = computed(() => decks.currentDeck.value);

onMounted(() => {
  const status = decks.checkForSharedDeck();
  if (status) {
    if (currentDeck.value) {
      toast.success(`URL deck "${currentDeck.value.name}" imported!`);
    }
  }
});
</script>

<template>
  <Toaster rich-colors close-button position="top-center" />

  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
