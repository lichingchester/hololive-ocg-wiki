<script setup lang="ts">
import { X } from "lucide-vue-next";
</script>

<template>
  <header class="border-solid sticky top-0 z-50 w-full border-b bg-background">
    <div class="p-2 md:p-4 flex items-center gap-2">
      <slot />

      <div class="flex ml-auto">
        <AppLanguageSwitcher />
        <AppColorModeSwitcher />
        <AppInfoButton />
        <Button variant="ghost" size="icon" as-child>
          <a
            class="relative"
            href="https://github.com/lichingchester/hololive-ocg-wiki"
            target="_blank"
          >
            <X
              class="absolute left-2/4 top-2/4 -translate-2/4 text-red-500 size-10"
            />
            <IconGithub class="w-5 h-5" />
          </a>
        </Button>
      </div>
    </div>
  </header>
</template>
