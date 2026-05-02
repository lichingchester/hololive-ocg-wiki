<script setup lang="ts">
import type { Card } from "@/types/card";

const props = defineProps<{
  id: string;
  cardNumber: string | null;
  imagePath: string | null;
  name: string | null;
  status: "new" | "changed" | "qaUpdated" | "removed" | "skipped";
}>();

const { t } = useI18n();

const badgeClass: Record<string, string> = {
  new: "bg-green-500 text-white",
  changed: "bg-blue-500 text-white",
  qaUpdated: "bg-amber-500 text-white",
  removed: "bg-red-500 text-white",
  skipped: "bg-muted text-muted-foreground",
};

// Lazy-load card detail on click
const open = ref(false);
const card = ref<Card | null>(null);
const loading = ref(false);

const hasImage = computed(
  () =>
    !!props.imagePath &&
    props.status !== "removed" &&
    props.status !== "skipped",
);

async function onClick() {
  if (!hasImage.value) return;
  open.value = true;
  if (!card.value && !loading.value) {
    loading.value = true;
    try {
      const data = await $fetch<{ card: Card }>(`/api/cards/${props.id}`, {
        params: { locale: useI18n().locale.value },
      });
      card.value = data?.card ?? null;
    } catch {
      card.value = null;
    } finally {
      loading.value = false;
    }
  }
}
</script>

<template>
  <div
    class="relative flex aspect-400/559 cursor-pointer group"
    @click="onClick"
  >
    <!-- Card image -->
    <SimpleImage
      v-if="hasImage"
      class="rounded-lg overflow-hidden w-full"
      :src="`/${imagePath}`"
      :img-attributes="{ class: 'w-full' }"
    />

    <!-- Placeholder for removed/skipped -->
    <div
      v-else
      class="w-full rounded-lg bg-muted flex flex-col items-center justify-center text-center p-2 gap-1"
    >
      <span
        class="text-[10px] text-muted-foreground font-mono leading-tight break-all"
      >
        {{ cardNumber || id }}
      </span>
    </div>

    <!-- Status badge -->
    <span
      class="absolute top-1 right-1 text-[9px] font-bold px-1 py-0.5 rounded leading-none"
      :class="badgeClass[status]"
    >
      {{ $t(`status.badges.${status}`) }}
    </span>
  </div>

  <!-- Card detail dialog (lazy) -->
  <Dialog v-if="hasImage" v-model:open="open">
    <DialogContent
      hide-top-right-close
      class="grid-rows-[auto_minmax(0,1fr)_auto] p-0 max-h-[90dvh] sm:max-w-lg md:max-w-2xl lg:max-w-4xl"
    >
      <DialogHeader class="h-0 overflow-hidden">
        <DialogTitle>{{ card?.name || cardNumber || "" }}</DialogTitle>
        <DialogDescription>{{
          card?.name || cardNumber || ""
        }}</DialogDescription>
      </DialogHeader>
      <div v-if="loading" class="flex items-center justify-center h-64">
        <span class="text-muted-foreground text-sm">{{ $t("Loading") }}</span>
      </div>
      <CardItemDialogContent v-else-if="card" :item="card" />
    </DialogContent>
  </Dialog>
</template>
