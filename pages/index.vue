<script setup lang="ts">
// useSeoMeta({
//   title: 'Hololive OCG Wiki',
//   description: 'Fan-made web application for the Hololive Official Card Game'
// })

useHead({
  bodyAttrs: {
    class: "overflow-hidden",
  },
});
</script>

<template>
  <AppHeader>
    <!-- filter -->
    <FilterAPI />

    <!-- search -->
    <!-- <Input id="search" type="text" placeholder="Search..." /> -->
    <!-- <SearchInput /> -->
    <SearchInputAPI />
  </AppHeader>

  <!-- Card List -->
  <div class="grow">
    <!-- <CardListView /> -->
    <CardListViewAPI />
  </div>

  <FloatingDeck />

  <AppFooter>
    <AppFooterCurrentDeck />
    <div class="ml-auto flex items-center gap-2">
      <AppFooterOptionsButton />
      <AppFooterDeckButton />
    </div>
  </AppFooter>
</template>
