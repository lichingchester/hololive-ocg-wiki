<script setup lang="ts">
import type { Card } from "@/types/card";

defineProps<{
  item: Card;
}>();
</script>

<template>
  <div>
    <Dialog>
      <DialogTrigger class="w-full">
        <NuxtPicture
          format="webp"
          :src="'/' + item.imagePath"
          loading="lazy"
          :img-attrs="{ class: 'w-full' }"
        />
      </DialogTrigger>

      <CardItemDialogContent :item="item" />
    </Dialog>
  </div>
</template>
