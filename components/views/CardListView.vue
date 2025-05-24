<script setup lang="ts">
import { RecycleScroller } from "vue-virtual-scroller";
import type { CardCollection } from "@/types/card";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";

const response: CardCollection = await $fetch("/data/cards_i18n.json");
</script>

<template>
  <div>
    <RecycleScroller
      v-slot="{ card }"
      class="scroller"
      :items="response"
      :item-size="32"
      key-field="id"
    >
      <div>{{ card }}</div>
      <!-- <div>{{ card.id }} - {{ $t(`cards.${card.id}.name`) }}</div> -->
    </RecycleScroller>
  </div>
</template>
