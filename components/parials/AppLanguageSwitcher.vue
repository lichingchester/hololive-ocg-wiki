<script setup lang="ts">
const { locales } = useI18n();
const switchLocalePath = useSwitchLocalePath();
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger>
      <Button variant="ghost">
        <IconGlobe />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <template v-for="(_locale, index) in locales" :key="index">
        <DropdownMenuItem>
          <NuxtLink :to="switchLocalePath(_locale.code)">
            {{ _locale.name }}
          </NuxtLink>
        </DropdownMenuItem>
      </template>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
