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
        <picture>
          <source
            :srcset="'/' + item.imagePath.replace('.png', '.webp')"
            type="image/webp"
          />
          <img
            :src="'/' + item.imagePath"
            alt=""
            class="w-full"
            loading="lazy"
          />
        </picture>
      </DialogTrigger>

      <CardItemDialogContent :item="item" />
    </Dialog>
  </div>
</template>
