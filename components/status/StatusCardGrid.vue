<script setup lang="ts">
export interface StatusEntry {
  id: string;
  cardNumber: string | null;
  imagePath: string | null;
  name?: string | null;
  missingFields?: string[];
}

defineProps<{
  items: StatusEntry[];
  status: "new" | "changed" | "qaUpdated" | "removed" | "skipped";
}>();
</script>

<template>
  <div
    class="grid gap-2"
    style="grid-template-columns: repeat(3, minmax(0, 1fr))"
    :class="[
      'sm:grid-cols-4',
      'md:grid-cols-5',
      'lg:grid-cols-6',
      'xl:grid-cols-8',
      '2xl:grid-cols-10',
    ]"
  >
    <StatusCardItem
      v-for="item in items"
      :key="item.id"
      :id="item.id"
      :card-number="item.cardNumber"
      :image-path="item.imagePath"
      :name="item.name ?? null"
      :status="status"
    />
  </div>
</template>
