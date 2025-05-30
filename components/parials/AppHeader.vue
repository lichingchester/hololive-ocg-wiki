<template>
  <header class="border-solid sticky top-0 z-50 w-full border-b bg-background">
    <div class="p-2 md:p-4 flex items-center gap-2">
      <slot />

      <div class="flex ml-auto">
        <AppLanguageSwitcher />
        <AppColorModeSwitcher />
        <AppInfoButton />
      </div>
    </div>
  </header>
</template>
