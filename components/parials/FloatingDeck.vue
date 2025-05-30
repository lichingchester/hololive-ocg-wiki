<script setup lang="ts">
import { Expand, Shrink } from "lucide-vue-next";
import { Separator } from "@/components/ui/separator";

const decks = useDecks();

const isActive = ref(false);
const toggleFloatingDeck = () => {
  isActive.value = !isActive.value;
};

const isEditing = computed(() => decks.isEditing.value);
const currentDeck = computed(() => decks.currentDeck.value);

watch(
  currentDeck,
  (newDeck, oldDeck) => {
    if (newDeck && newDeck.id !== oldDeck?.id) {
      decks.isEditing.value = true;
      isActive.value = true;
    } else if (!newDeck) {
      decks.isEditing.value = false;
      isActive.value = false;
    }
  },
  { immediate: true }
);

const oshiCardIds = computed(() => {
  return decks.currentDeck.value?.oshiCardIds || [];
});

const mainCardIds = computed(() => {
  return decks.currentDeck.value?.mainCardIds || [];
});

const yellCardIds = computed(() => {
  return decks.currentDeck.value?.yellCardIds || [];
});
</script>

<template>
  <Transition name="fade-up">
    <div
      v-if="isEditing"
      class="fixed bottom-13 md:bottom-16 left-0 m-2 md:m-4 z-40"
    >
      <div
        class="rounded-lg shadow-lg border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90"
      >
        <div class="flex p-2 md:p-4">
          <Button
            size="sm"
            class="text-[12px] md:text-sm"
            @click="toggleFloatingDeck"
          >
            <Expand v-if="!isActive" class="size-3 md:size-4" />
            <Shrink v-else class="size-3 md:size-4" />
            {{ !isActive ? "Expand" : "Collapse" }}
          </Button>
        </div>

        <div class="flex md:pt-0 pb-2 md:pb-4">
          <ScrollArea class="max-h-[40vh]">
            <div class="flex flex-col gap-2 md:gap-4 px-2 md:px-4">
              <div class="border rounded-lg p-2 md:p-3 flex flex-col gap-3">
                <div class="flex items-center gap-2">
                  oshi
                  <Badge
                    class="px-1 text-[8px] md:text-xs"
                    :class="
                      oshiCardIds.length > 1
                        ? 'bg-red-500/15 border-red-500/50 text-red-500'
                        : oshiCardIds.length === 1
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-500'
                        : 'border-gray-400 dark:border-gray-600 bg-gray-400/20 dark:bg-gray-600/20 text-gray-700 dark:text-gray-400'
                    "
                    variant="outline"
                    size="sm"
                  >
                    {{ `${oshiCardIds.length}/1` }}
                  </Badge>
                </div>

                <FloatingDeckCardList
                  v-if="isActive"
                  :card-ids="oshiCardIds"
                  class="mt-2"
                />
              </div>

              <div class="border rounded-lg p-2 md:p-3 flex flex-col gap-3">
                <div class="flex items-center gap-2">
                  main
                  <Badge
                    class="px-1 text-[8px] md:text-xs"
                    :class="
                      mainCardIds.length > 50
                        ? 'bg-red-500/15 border-red-500/50 text-red-500'
                        : mainCardIds.length === 50
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-500'
                        : 'border-gray-400 dark:border-gray-600 bg-gray-400/20 dark:bg-gray-600/20 text-gray-700 dark:text-gray-400'
                    "
                    variant="outline"
                    size="sm"
                  >
                    {{ `${mainCardIds.length}/50` }}
                  </Badge>
                </div>
                <FloatingDeckCardList
                  v-if="isActive"
                  :card-ids="mainCardIds"
                  class="mt-2"
                />
              </div>

              <div class="border rounded-lg p-2 md:p-3 flex flex-col gap-3">
                <div class="flex items-center gap-2">
                  yell

                  <Badge
                    class="px-1 text-[8px] md:text-xs"
                    :class="
                      yellCardIds.length > 20
                        ? 'bg-red-500/15 border-red-500/50 text-red-500'
                        : yellCardIds.length === 20
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-500'
                        : 'border-gray-400 dark:border-gray-600 bg-gray-400/20 dark:bg-gray-600/20 text-gray-700 dark:text-gray-400'
                    "
                    variant="outline"
                    size="sm"
                  >
                    {{ `${yellCardIds.length}/20` }}
                  </Badge>
                </div>
                <FloatingDeckCardList
                  v-if="isActive"
                  :card-ids="yellCardIds"
                  class="mt-2"
                />
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  </Transition>
</template>
