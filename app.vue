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

// Global route-based canonical URL handling.
//
// Points at the v2 site (tskrlabs.com), not this one: v1 is frozen and v2 serves the same
// card content, so consolidating search ranking onto v2 is the goal. The path is preserved
// because v2's URLs match v1's exactly — home, /status, and /deck/[code] (identical deck-code
// encoding) all resolve to the same page on both. v1-only routes like /how-to-use point at a
// v2 page that doesn't exist, which Google harmlessly ignores (it falls back to self).
useHead({
  link: [
    {
      rel: "canonical",
      href: () => {
        const route = useRoute();
        const baseUrl = "https://hololive-ocg-wiki.tskrlabs.com";
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
