<script setup lang="ts">
import { toast } from "vue-sonner";
import type { Deck } from "~/types/deck";
import { Database } from "lucide-vue-next";

const route = useRoute();

const decks = useDecks();

const deck = ref<Deck | null>(null);

onMounted(() => {
  if (!route.params.code) {
    toast.error("No deck code provided.");
    return;
  }

  const code = route.params.code as string;
  // console.log("Deck code:", code);

  const checked = decks.checkForDeckCode(code);

  if (checked) {
    deck.value = checked;
  } else {
    toast.error(`Failed to import shared deck.`, {
      duration: Infinity,
    });
  }
});
</script>

<template>
  <AppHeader>
    <Button class="text-[12px] md:text-sm" @click="$router.push('/')">
      <Database class="size-3 md:size-4" />
      Card List
    </Button>
  </AppHeader>

  <div class="grow p-2 md:p-4">
    <div v-if="deck" class="flex flex-col gap-3 md:gap-4">
      <div
        class="border rounded-lg p-2 md:p-3 bg-gray-100/95 dark:bg-gray-800/95"
      >
        <div class="flex items-center gap-2">
          <h1 class="text-md md:text-lg font-semibold">{{ deck.name }}</h1>
          <span
            v-if="deck.author"
            class="text-sm text-gray-500 dark:text-gray-400"
          >
            by {{ deck.author }}
          </span>
        </div>
      </div>

      <div class="border rounded-lg p-2 md:p-3 flex flex-col gap-3">
        <div class="flex items-center gap-2">
          <div class="text-md md:text-lg font-semibold">oshi</div>
          <Badge
            class="px-1 text-[8px] md:text-xs"
            :class="
              deck.oshiCardIds.length > 1
                ? 'bg-red-500/15 border-red-500/50 text-red-500'
                : deck.oshiCardIds.length === 1
                ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-500'
                : 'border-gray-400 dark:border-gray-600 bg-gray-400/20 dark:bg-gray-600/20 text-gray-700 dark:text-gray-400'
            "
            variant="outline"
            size="sm"
          >
            {{ `${deck.oshiCardIds.length}/1` }}
          </Badge>
        </div>

        <DeckDetailCardList :card-ids="deck.oshiCardIds" />
      </div>

      <div class="border rounded-lg p-2 md:p-3 flex flex-col gap-3">
        <div class="flex items-center gap-2">
          <div class="text-md md:text-lg font-semibold">main</div>
          <Badge
            class="px-1 text-[8px] md:text-xs"
            :class="
              deck.mainCardIds.length > 50
                ? 'bg-red-500/15 border-red-500/50 text-red-500'
                : deck.mainCardIds.length === 50
                ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-500'
                : 'border-gray-400 dark:border-gray-600 bg-gray-400/20 dark:bg-gray-600/20 text-gray-700 dark:text-gray-400'
            "
            variant="outline"
            size="sm"
          >
            {{ `${deck.mainCardIds.length}/50` }}
          </Badge>
        </div>

        <DeckDetailCardList :card-ids="deck.mainCardIds" />
      </div>

      <div class="border rounded-lg p-2 md:p-3 flex flex-col gap-3">
        <div class="flex items-center gap-2">
          <div class="text-md md:text-lg font-semibold">yell</div>
          <Badge
            class="px-1 text-[8px] md:text-xs"
            :class="
              deck.yellCardIds.length > 20
                ? 'bg-red-500/15 border-red-500/50 text-red-500'
                : deck.yellCardIds.length === 20
                ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-500'
                : 'border-gray-400 dark:border-gray-600 bg-gray-400/20 dark:bg-gray-600/20 text-gray-700 dark:text-gray-400'
            "
            variant="outline"
            size="sm"
          >
            {{ `${deck.yellCardIds.length}/20` }}
          </Badge>
        </div>

        <DeckDetailCardList :card-ids="deck.yellCardIds" />
      </div>
    </div>
  </div>

  <AppFooter>
    <AppFooterDeckDetailStatus />

    <div class="ml-auto flex items-center gap-2">
      <AppFooterDeckDetailOptionsButton />
    </div>
  </AppFooter>
</template>
