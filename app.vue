<script setup lang="ts">
import { Toaster } from "@/components/ui/sonner";
import "vue-sonner/style.css"; // vue-sonner v2 requires this import

const { locale } = useI18n();

useHead({
  link: [
    {
      rel: "icon",
      type: "image/x-icon",
      href: "/favicon.ico",
    },
  ],
  htmlAttrs: {
    lang: locale,
  },
});

// Global route-based canonical URL handling
useHead({
  link: [
    {
      rel: "canonical",
      href: () => {
        const route = useRoute();
        const baseUrl = "https://hololive-ocg-wiki.lichingchester.dev";
        return `${baseUrl}${route.path}`;
      },
    },
  ],
});
</script>

<template>
  <Toaster rich-colors close-button position="top-center" />

  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
