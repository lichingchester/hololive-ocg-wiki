<script setup lang="ts">
/**
 * Permanent, non-dismissible "you're on the old site" line.
 *
 * The dialog (AppV2Notice) converts people who are already here; this bar is what a
 * first-time visitor arriving from a search result sees — someone who never had a dialog
 * to dismiss. It is deliberately not dismissible: a banner someone closed months ago is
 * invisible to the person who most needs it.
 */
const V2_URL = "https://hololive-ocg-wiki.tskrlabs.com";
</script>

<template>
  <div
    class="w-full border-b bg-muted/60 px-3 py-1.5 text-center text-xs text-muted-foreground sm:text-sm"
  >
    <span>You're on the old wiki — no longer updated. </span>
    <a
      :href="V2_URL"
      class="font-medium text-foreground underline underline-offset-2 hover:no-underline"
    >
      Go to the new site →
    </a>
  </div>
</template>
