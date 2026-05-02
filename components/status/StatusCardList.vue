<script setup lang="ts">
import type { StatusEntry } from "./StatusCardGrid.vue";

defineProps<{
  items: StatusEntry[];
  status: "new" | "changed" | "qaUpdated" | "removed" | "skipped";
}>();

const badgeClass: Record<string, string> = {
  new: "bg-green-500 text-white",
  changed: "bg-blue-500 text-white",
  qaUpdated: "bg-amber-500 text-white",
  removed: "bg-red-500 text-white",
  skipped: "bg-muted text-muted-foreground",
};
</script>

<template>
  <div class="flex flex-col gap-1">
    <div
      v-for="item in items"
      :key="item.id"
      class="flex items-center gap-3 rounded-md border px-3 py-2 hover:bg-muted/50 transition-colors"
    >
      <!-- Thumbnail -->
      <div class="flex-shrink-0 w-10 h-14 rounded overflow-hidden bg-muted">
        <SimpleImage
          v-if="item.imagePath && status !== 'removed' && status !== 'skipped'"
          :src="`/${item.imagePath}`"
          :img-attributes="{ class: 'w-full h-full object-cover' }"
        />
        <div
          v-else
          class="w-full h-full flex items-center justify-center text-[8px] text-muted-foreground font-mono p-0.5 text-center break-all leading-tight"
        >
          {{ item.cardNumber?.slice(-3) || item.id }}
        </div>
      </div>

      <!-- Info -->
      <div class="flex flex-col gap-0.5 min-w-0 grow">
        <span class="text-sm font-mono text-muted-foreground">{{
          item.cardNumber || `#${item.id}`
        }}</span>
        <span v-if="item.name" class="text-sm truncate">{{ item.name }}</span>
        <span
          v-if="item.missingFields?.length"
          class="text-xs text-muted-foreground"
        >
          {{ $t("status.skippedReason") }}: {{ item.missingFields.join(", ") }}
        </span>
      </div>

      <!-- Badge -->
      <span
        class="flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded leading-none"
        :class="badgeClass[status]"
      >
        {{ $t(`status.badges.${status}`) }}
      </span>
    </div>
  </div>
</template>
