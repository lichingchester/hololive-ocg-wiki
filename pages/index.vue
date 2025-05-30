<script setup lang="ts"></script>

<template>
  <div>
    <header
      class="border-solid sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
    >
      <div class="p-2 flex items-center gap-2">
        <!-- filter -->
        <Filter />

        <!-- search -->
        <!-- <Input id="search" type="text" placeholder="Search..." /> -->
        <SearchInput />

        <div class="flex ml-auto">
          <AppLanguageSwitcher />
          <AppColorModeSwitcher />
          <AppInfoButton />
        </div>
      </div>
    </header>

    <!-- Card List -->
    <CardListView />

    <FloatingDeck />
  </div>
</template>
