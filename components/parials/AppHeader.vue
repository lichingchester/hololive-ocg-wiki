<script setup lang="ts">
import { Input } from "@/components/ui/input";
</script>

<template>
  <header
    class="border-solid sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
  >
    <div class="p-2 flex items-center gap-2">
      <!-- filter -->
      <Filter />

      <!-- search -->
      <Input id="search" type="text" placeholder="Search..." />

      <div class="flex ml-auto">
        <AppLanguageSwitcher />
        <AppColorModeSwitcher />
      </div>
    </div>
  </header>
</template>
