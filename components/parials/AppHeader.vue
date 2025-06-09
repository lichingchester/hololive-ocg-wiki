<script setup lang="ts"></script>

<template>
  <header class="border-solid sticky top-0 z-50 w-full border-b bg-background">
    <div class="p-2 md:p-4 flex items-center gap-2">
      <slot />

      <div class="flex ml-auto">
        <AppLanguageSwitcher />
        <AppColorModeSwitcher />
        <Button
          variant="ghost"
          size="icon"
          as-child
          class="hidden sm:inline-flex"
        >
          <a
            href="https://gitlab.com/lichingchester/hololive-ocg-wiki"
            target="_blank"
          >
            <IconGitlab class="w-5 h-5" />
          </a>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          as-child
          class="hidden sm:inline-flex"
        >
          <a href="https://discord.gg/USMgkeYujz" target="_blank">
            <IconDiscord />
          </a>
        </Button>
        <AppInfoButton />
      </div>
    </div>
  </header>
</template>
