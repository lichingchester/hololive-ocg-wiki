<script setup lang="ts">
import type { Card } from "@/types/card";
import { Badge } from "@/components/ui/badge";
import { VisuallyHidden } from "reka-ui";

import { ScrollArea } from "@/components/ui/scroll-area";

const { t } = useI18n();

defineProps<{
  item: Card;
}>();

const getCostTypesString = (costTypes: string[]): string => {
  const counts: Record<string, number> = {};
  for (const type of costTypes) {
    counts[type] = (counts[type] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([type, count]) => `${t(`colors.${type}`)} x${count}`)
    .join(", ");
};
</script>

<template>
  <DialogContent
    hide-top-right-close
    class="grid-rows-[auto_minmax(0,1fr)_auto] p-0 max-h-[90dvh] sm:max-w-lg md:max-w-2xl lg:max-w-4xl"
  >
    <DialogHeader class="h-0 overflow-hidden">
      <DialogTitle>{{ $t(`cards.${item.id}.name`) }}</DialogTitle>
      <DialogDescription> {{ $t(`cards.${item.id}.name`) }} </DialogDescription>
    </DialogHeader>

    <ScrollArea class="py-0 px-4">
      <div class="flex flex-col md:flex-row gap-2 md:gap-4">
        <Image
          class="flex-[0_0_400px]"
          :src="`/${item.imagePath}`"
          :img-attributes="{ class: 'mx-auto w-full max-w-[400px]' }"
        />

        <div class="flex flex-col grow gap-2 md:gap-4">
          <CardDataNameBlock
            :name="$t(`cards.${item.id}.name`)"
            :id="item.id"
            :number="item.cardNumber"
          />

          <CardDataRowsBlock :item="item" />

          <CardDataDetailBlocks :item="item" />
        </div>
      </div>
    </ScrollArea>
    <DialogFooter class="p-4 pt-0">
      <DialogClose as-child>
        <Button type="button" variant="secondary"> Close </Button>
      </DialogClose>
    </DialogFooter>
  </DialogContent>
</template>

<style lang="postcss" scoped>
/* .badge-text {
  font-size: 0.875rem;
  align-self: start;

  @media (min-width: 80rem) {
    font-size: 1rem;
  }
} */
</style>
