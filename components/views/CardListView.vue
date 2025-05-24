<script setup lang="ts">
import { vResizeObserver } from "@vueuse/components";
import { RecycleScroller } from "vue-virtual-scroller";
import type { CardCollection } from "@/types/card";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";

const response: CardCollection = await $fetch("/data/cards_i18n.json");

const cardImageRatio = (558 + 8 + 8) / (400 + 8 + 8); // Ratio of card height to width
const gridColCount = shallowRef(6);
const itemSize = shallowRef(400);
const itemSecondarySize = shallowRef(558);

function onResizeObserver(entries: ResizeObserverEntry[]) {
  const [entry] = entries;
  const { width } = entry.contentRect;

  itemSecondarySize.value = width / gridColCount.value; // Adjust item size based on the width of the container
  itemSize.value = itemSecondarySize.value * cardImageRatio; // Adjust secondary size based on the item size
}
</script>

<template>
  <div v-resize-observer="onResizeObserver" class="wrapper">
    <RecycleScroller
      class="scroller"
      :items="response"
      :item-size="itemSize"
      :item-secondary-size="itemSecondarySize"
      :grid-items="gridColCount"
      key-field="id"
    >
      <template #default="{ item }">
        <div class="p-2">
          <NuxtImg :src="'/' + item.imagePath" loading="lazy" />
        </div>
      </template>
    </RecycleScroller>
  </div>
</template>

<style scoped></style>
