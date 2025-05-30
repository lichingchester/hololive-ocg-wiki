<script setup lang="ts">
import { APP_BASE_URL_NAME } from "~/constants/app";

const props = defineProps<{
  src: string;
  imgAttributes?: Record<string, string>;
}>();

const webpSrc = computed(() => {
  // Extract the base name without extension
  const baseName = props.src.substring(0, props.src.lastIndexOf("."));
  return `${baseName}.webp`;
});
</script>

<template>
  <picture>
    <source :srcset="`/${APP_BASE_URL_NAME}${webpSrc}`" type="image/webp" />
    <img
      :src="`/${APP_BASE_URL_NAME}${src}`"
      loading="lazy"
      v-bind="imgAttributes || {}"
    />
  </picture>
</template>
