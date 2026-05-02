<script setup lang="ts">
import type { StatusEntry } from "./StatusCardGrid.vue";

const props = defineProps<{
  items: StatusEntry[];
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
</script>

<template>
  <div class="rounded-md border overflow-auto">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b bg-muted/50">
          <th class="px-4 py-2 text-left font-medium text-muted-foreground w-8">
            #
          </th>
          <th class="px-4 py-2 text-left font-medium text-muted-foreground">
            {{ $t("fields.name") }}
          </th>
          <th
            class="px-4 py-2 text-left font-medium text-muted-foreground hidden sm:table-cell"
          >
            ID
          </th>
          <th
            v-if="status === 'skipped'"
            class="px-4 py-2 text-left font-medium text-muted-foreground"
          >
            {{ $t("status.skippedReason") }}
          </th>
          <th class="px-4 py-2 text-left font-medium text-muted-foreground">
            {{ $t("status.sort.label") }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(item, idx) in items"
          :key="item.id"
          class="border-b last:border-0 hover:bg-muted/30 transition-colors"
        >
          <td class="px-4 py-2 text-muted-foreground tabular-nums">
            {{ idx + 1 }}
          </td>
          <td class="px-4 py-2">
            <div class="flex flex-col gap-0.5">
              <span class="font-mono text-xs text-muted-foreground">{{
                item.cardNumber || `#${item.id}`
              }}</span>
              <span v-if="item.name" class="truncate max-w-[200px]">{{
                item.name
              }}</span>
            </div>
          </td>
          <td
            class="px-4 py-2 text-muted-foreground font-mono text-xs hidden sm:table-cell"
          >
            {{ item.id }}
          </td>
          <td
            v-if="status === 'skipped'"
            class="px-4 py-2 text-xs text-muted-foreground"
          >
            {{ item.missingFields?.join(", ") || "—" }}
          </td>
          <td class="px-4 py-2">
            <span
              class="text-[10px] font-bold px-1.5 py-0.5 rounded leading-none"
              :class="badgeClass[status]"
            >
              {{ $t(`status.badges.${status}`) }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
