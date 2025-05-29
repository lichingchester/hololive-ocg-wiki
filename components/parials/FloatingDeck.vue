<script setup lang="ts">
import { Expand } from "lucide-vue-next";
import { Separator } from "@/components/ui/separator";

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
  <Transition name="fade-up">
    <div v-if="isEditing" class="fixed bottom-full left-0 m-2 md:m-4 z-40">
      <div class="bg-background/95 rounded-lg shadow-lg border">
        <div class="flex p-2">
          <Button
            size="sm"
            class="text-[12px] md:text-sm"
            @click="isActive = !isActive"
          >
            <Expand class="size-3 md:size-4" />
            Expand
          </Button>
        </div>

        <div class="flex">
          <ScrollArea class="max-h-[40vh]">
            <div class="flex flex-col gap-3 py-3 px-3">
              <div class="">
                <div
                  class="flex items-center gap-1 text-xs md:text-sm font-semibold"
                >
                  oshi
                  <Badge
                    class="px-1 text-[8px] md:text-xs"
                    :class="
                      oshiCards.length > 1
                        ? 'bg-red-500/15 border-red-500/50 text-red-500'
                        : oshiCards.length === 1
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-500'
                        : 'border-gray-400 dark:border-gray-600 bg-gray-400/20 dark:bg-gray-600/20 text-gray-700 dark:text-gray-400'
                    "
                    variant="outline"
                    size="sm"
                  >
                    {{ `${oshiCards.length}/1` }}
                  </Badge>
                </div>

                <FloatingDeckCardList
                  v-if="isActive"
                  :cards="oshiCards"
                  class="mt-2"
                />
              </div>

              <Separator v-if="isActive" class="my-1 md:my-2" />

              <div class="">
                <div
                  class="flex items-center gap-1 text-xs md:text-sm font-semibold"
                >
                  main
                  <Badge
                    class="px-1 text-[8px] md:text-xs"
                    :class="
                      oshiCards.length > 50
                        ? 'bg-red-500/15 border-red-500/50 text-red-500'
                        : oshiCards.length === 50
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-500'
                        : 'border-gray-400 dark:border-gray-600 bg-gray-400/20 dark:bg-gray-600/20 text-gray-700 dark:text-gray-400'
                    "
                    variant="outline"
                    size="sm"
                  >
                    {{ `${mainCards.length}/50` }}
                  </Badge>
                </div>
                <FloatingDeckCardList
                  v-if="isActive"
                  :cards="mainCards"
                  class="mt-2"
                />
              </div>

              <Separator v-if="isActive" class="my-1 md:my-2" />

              <div class="">
                <div
                  class="flex items-center gap-1 text-xs md:text-sm font-semibold"
                >
                  yell

                  <Badge
                    class="px-1 text-[8px] md:text-xs"
                    :class="
                      oshiCards.length > 20
                        ? 'bg-red-500/15 border-red-500/50 text-red-500'
                        : oshiCards.length === 20
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-500'
                        : 'border-gray-400 dark:border-gray-600 bg-gray-400/20 dark:bg-gray-600/20 text-gray-700 dark:text-gray-400'
                    "
                    variant="outline"
                    size="sm"
                  >
                    {{ `${yellCards.length}/20` }}
                  </Badge>
                </div>
                <FloatingDeckCardList
                  v-if="isActive"
                  :cards="yellCards"
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
