<script setup lang="ts"></script>

<template>
  <div>
    <AppHeader>
      <!-- filter -->
      <Filter />

      <!-- search -->
      <!-- <Input id="search" type="text" placeholder="Search..." /> -->
      <SearchInput />
    </AppHeader>

    <!-- Card List -->
    <CardListView />

    <FloatingDeck />

    <AppFooter>
      <AppFooterCurrentDeck />
      <div class="ml-auto flex items-center gap-2">
        <AppFooterOptionsButton />
        <AppFooterDeckButton />
      </div>
    </AppFooter>
  </div>
</template>
