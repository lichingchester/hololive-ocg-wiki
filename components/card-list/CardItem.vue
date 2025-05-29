<script setup lang="ts">
import { CircleMinus, CirclePlus } from "lucide-vue-next";
import type { Card } from "@/types/card";

const props = defineProps<{
  item: Card;
}>();

const decks = useDecks();
const isEditing = computed(() => decks.isEditing.value);

const add = () => {
  if (!isEditing.value) return;
  decks.addCardToDeck(props.item);
};

const remove = () => {
  if (!isEditing.value) return;
  decks.removeCardFromDeck(props.item);
};

const count = computed(() => {
  return decks.getCardCount(props.item);
});
</script>

<template>
  <div>
    <Dialog>
      <DialogTrigger class="w-full">
        <picture>
          <source
            :srcset="'/' + item.imagePath.replace('.png', '.webp')"
            type="image/webp"
          />
          <img
            :src="'/' + item.imagePath"
            alt=""
            class="w-full"
            loading="lazy"
          />
        </picture>
      </DialogTrigger>

      <CardItemDialogContent :item="item" />
    </Dialog>

    <!-- actions -->
    <button
      v-if="isEditing"
      class="absolute bottom-3 md:bottom-5 left-2/4 -translate-x-2/4 w-[calc(100%_-_2rem)] bg-secondary/90 rounded-sm md:py-0.5"
      @click="add"
    >
      <div class="flex items-center gap-1 justify-center text-xs md:text-sm">
        <CirclePlus class="w-3 md:w-4" />
        Add
      </div>
    </button>
    <button
      v-if="isEditing && count > 0"
      class="absolute top-3 right-3 bg-red-500/90 rounded-sm size-6 md:size-8"
      @click="remove"
    >
      <div class="flex items-center justify-center text-xs">
        <CircleMinus class="w-3 md:w-4 text-white" />
      </div>
    </button>

    <!-- count -->
    <div
      v-if="isEditing && count > 0"
      class="absolute top-0 left-0 bg-primary/95 rounded-full size-4 md:size-6 flex items-center justify-center"
    >
      <div
        class="flex items-center justify-center text-[8px] md:text-xs text-white dark:text-black leading-none font-semibold"
      >
        {{ count || 0 }}
      </div>
    </div>
  </div>
</template>
