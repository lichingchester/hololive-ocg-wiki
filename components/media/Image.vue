<script setup lang="ts">
import { APP_BASE_URL_NAME } from "~/constants/app";

const props = defineProps<{
  src: string;
  imgAttributes?: Record<string, string>;
  width?: string | number;
  height?: string | number;
}>();

const isLoading = ref(true);
const hasError = ref(false);

const webpSrc = computed(() => {
  // Extract the base name without extension
  const baseName = props.src.substring(0, props.src.lastIndexOf("."));
  return `${baseName}.webp`;
});

const handleImageLoaded = () => {
  isLoading.value = false;
};

const handleImageError = () => {
  isLoading.value = false;
  hasError.value = true;
};

// Expose loading state for testing or parent components
defineExpose({
  isLoading,
  hasError,
});
</script>

<template>
  <div class="relative">
    <!-- Skeleton placeholder -->
    <Skeleton
      v-if="isLoading"
      :class="['absolute inset-0 z-0', imgAttributes?.class || '']"
      :style="{
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : '100%',
      }"
    />

    <!-- Actual image -->
    <picture
      :class="[
        isLoading ? 'opacity-0' : 'opacity-100',
        'transition-opacity duration-300',
      ]"
    >
      <source :srcset="`/${APP_BASE_URL_NAME}${webpSrc}`" type="image/webp" />
      <img
        :src="`/${APP_BASE_URL_NAME}${src}`"
        loading="lazy"
        v-bind="imgAttributes || {}"
        @load="handleImageLoaded"
        @error="handleImageError"
      />
    </picture>

    <!-- Fallback for error state -->
    <div
      v-if="hasError"
      class="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
      :style="{
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : '100%',
      }"
    >
      <span class="text-sm">Image failed to load</span>
    </div>
  </div>
</template>
