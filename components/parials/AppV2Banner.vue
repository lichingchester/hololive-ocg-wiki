<script setup lang="ts">
/**
 * Permanent, non-dismissible "you're on the old site" line.
 *
 * The dialog (AppV2Notice) converts people who are already here; this bar is what a
 * first-time visitor arriving from a search result sees — someone who never had a dialog
 * to dismiss. It is deliberately not dismissible: a banner someone closed months ago is
 * invisible to the person who most needs it.
 */
// Resolves to the v2 equivalent of the current page (e.g. the same deck), falling back to the
// v2 home for v1-only routes.
const v2Url = useV2Url();
</script>

<template>
  <div
    class="w-full border-b bg-muted/60 px-3 py-1.5 text-center text-xs text-muted-foreground sm:text-sm"
  >
    <span>You're on the old wiki — no longer updated. </span>
    <a
      :href="v2Url"
      class="font-medium text-foreground underline underline-offset-2 hover:no-underline"
    >
      Go to the new site →
    </a>
  </div>
</template>
