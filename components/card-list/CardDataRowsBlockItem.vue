<script setup lang="ts">
defineProps<{
  name: string;
}>();
</script>

<template>
  <div class="p-2 justify-between flex items-center gap-2">
    <div class="text-sm">
      {{ name }}
    </div>
    <div class="text-sm font-semibold">
      <slot />
    </div>
  </div>
</template>
