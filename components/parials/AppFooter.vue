<script setup lang="ts"></script>

<template>
  <footer
    class="border-solid sticky bottom-0 z-50 w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
  >
    <FloatingDeck />

    <div class="p-2 flex items-center">
      <AppFooterCurrentDeck />
      <div class="ml-auto">
        <AppFooterDeckButton />
      </div>
    </div>
  </footer>
</template>
