<script setup lang="ts">
const cards_data = await $fetch("/data/cards_structured.json");
const cards_i18n = await $fetch("/data/cards_i18n.json");

// console.log(cards_data);
</script>

<template>
  <div>
    <template v-for="(card, index) in cards_data" :key="index">
      <div>
        {{ card.id }}
      </div>
    </template>
  </div>
</template>
