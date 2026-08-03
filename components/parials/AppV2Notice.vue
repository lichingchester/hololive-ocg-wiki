<script setup lang="ts">
/**
 * v1 → v2 migration notice.
 *
 * Dismissal is remembered so this is a one-time interruption per browser, not a toll on
 * every visit — a notice that reappears after being dismissed reads as broken and gets
 * blocked rather than read.
 *
 * The key is versioned (`v2-notice-dismissed`) so a future, different announcement can use
 * its own key rather than being silenced by a dismissal of this one.
 */
// Resolves to the v2 equivalent of the current page — so clicking through from a shared deck
// link lands on that same deck on v2, not the homepage.
const v2Url = useV2Url();

const dismissed = useLocalStorage("v2-notice-dismissed", false);

// Deferred one tick past hydration: an SPA that paints a modal on first frame shows it
// before the page behind it exists, which reads as an interstitial ad.
const open = ref(false);
onMounted(() => {
  if (!dismissed.value) setTimeout(() => (open.value = true), 600);
});

function dismiss() {
  dismissed.value = true;
  open.value = false;
}

/**
 * Remembered on the way out too. Someone who clicks through has migrated; showing them
 * the same dialog if they ever come back is the one case where it is certainly noise.
 */
function go() {
  dismissed.value = true;
  window.location.href = v2Url.value;
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent
      class="sm:max-w-md"
      @escape-key-down="dismiss"
      @pointer-down-outside="dismiss"
    >
      <DialogHeader>
        <DialogTitle>The wiki has moved to v2</DialogTitle>
        <DialogDescription>
          v2 is a ground-up rebuild — new structure, reworked translation logic,
          and now part of the tskr/labs family. New cards and fixes only land
          there —
          <strong class="font-medium text-foreground"
            >this one is no longer updated.</strong
          >
        </DialogDescription>
      </DialogHeader>

      <DialogFooter class="gap-2 sm:justify-end">
        <Button variant="ghost" @click="dismiss">Not now</Button>
        <Button @click="go">Take me there</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
