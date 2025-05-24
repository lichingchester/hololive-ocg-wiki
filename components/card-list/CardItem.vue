<script setup lang="ts">
import type { Card } from "@/types/card";

defineProps<{
  item: Card;
}>();
</script>

<template>
  <div>
    <Dialog>
      <DialogTrigger>
        <NuxtPicture format="webp" :src="'/' + item.imagePath" loading="lazy" />
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter> Save changes </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
