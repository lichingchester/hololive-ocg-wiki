<script setup lang="ts">
import { Toaster } from "@/components/ui/sonner";
import "vue-sonner/style.css"; // vue-sonner v2 requires this import
</script>

<template>
  <Toaster rich-colors close-button position="top-center" />

  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
