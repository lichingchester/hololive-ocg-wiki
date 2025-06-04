<script setup lang="ts"></script>

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
            href="https://github.com/lichingchester/hololive-ocg-wiki"
            target="_blank"
          >
            <IconGithub class="w-5 h-5" />
          </a>
        </Button>
      </div>
    </div>
  </header>
</template>
