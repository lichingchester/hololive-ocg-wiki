<script setup lang="ts"></script>

<template>
  <AppHeader>
    <!-- filter -->
    <!-- <Filter /> -->

    <!-- search -->
    <!-- <Input id="search" type="text" placeholder="Search..." /> -->
    <!-- <SearchInput /> -->
    <!-- <SearchInputAPI /> -->
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
