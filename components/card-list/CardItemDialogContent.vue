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
    class="grid-rows-[auto_minmax(0,1fr)_auto] p-0 max-h-[90dvh] sm:max-w-lg md:max-w-2xl lg:max-w-3xl"
  >
    <DialogHeader class="h-0 overflow-hidden">
      <DialogTitle>{{ $t(`cards.${item.id}.name`) }}</DialogTitle>
      <DialogDescription> {{ $t(`cards.${item.id}.name`) }} </DialogDescription>
    </DialogHeader>

    <ScrollArea class="py-0 px-4">
      <div class="flex flex-col md:flex-row gap-2 md:gap-4">
        <picture class="flex-[0_0_400px]">
          <source
            :srcset="'/' + item.imagePath.replace('.png', '.webp')"
            type="image/webp"
          />
          <img
            class="mx-auto w-full max-w-[400px]"
            :src="'/' + item.imagePath"
            alt=""
            loading="lazy"
          />
        </picture>

        <CardDataNameBlock
          :name="$t(`cards.${item.id}.name`)"
          :id="item.id"
          :number="item.cardNumber"
        />

        <CardDataRowsBlock :item="item" />

        <CardDataDetailBlocks :item="item" />

        <div class="">
          <div class="pt-2 xl:pt-4"></div>

          <div
            class="grid grid-cols-[min-content_1fr] gap-2 xl:gap-4 pt-2 xl:pt-4 items-center"
          >
            <!-- arts -->
            <template v-if="item.arts">
              <template v-for="(art, index) in item.arts" :key="index">
                <!-- origin gradient color: bg-[linear-gradient(110deg,_rgb(123,90,163),_rgb(95,182,231)_55%,_rgb(229,51,122))] -->
                <!-- WCAG AAA color contrast gradient color: bg-[linear-gradient(110deg,_rgb(104,76,138),_rgb(19,89,129)_55%,_rgb(172,22,82))] -->
                <Badge
                  class="badge-text bg-[linear-gradient(110deg,_rgb(104,76,138),_rgb(19,89,129)_55%,_rgb(172,22,82))]"
                >
                  {{ $t("fields.arts") }}
                </Badge>

                <div class="">
                  <!-- name -->
                  <div class="flex items-center text-lg font-semibold">
                    {{ $t(`cards.${item.id}.arts[${index}].name`) }}
                  </div>

                  <!-- cost -->
                  <template v-if="art.costTypes">
                    <div class="flex items-center">
                      <template
                        v-for="(costType, costTypeIndex) in art.costTypes"
                        :key="costTypeIndex"
                      >
                        <picture>
                          <source
                            :srcset="`/icons/arts_${
                              costType === 'neutral' ? 'null' : costType
                            }.webp`"
                            type="image/webp"
                          />
                          <img
                            class="w-6 h-6"
                            :src="`/icons/arts_${
                              costType === 'neutral' ? 'null' : costType
                            }.png`"
                            loading="lazy"
                          />
                        </picture>
                      </template>

                      <span class="ml-1">
                        ({{ getCostTypesString(art.costTypes) }})
                      </span>
                    </div>
                  </template>

                  <!-- damage -->
                  <div class="text-lg font-semibold">
                    {{ $t("fields.damage") }}:
                    {{ `${art.damage}${art.isPlus ? "+" : ""}` }}
                  </div>

                  <!-- specialTargets -->
                  <template v-if="art.specialTargets">
                    <template
                      v-for="(
                        specialTarget, specialTargetIndex
                      ) in art.specialTargets"
                      :key="specialTargetIndex"
                    >
                      <div class="flex items-center">
                        <picture>
                          <source
                            :srcset="`/icons/tokkou_50_${
                              specialTarget === 'neutral'
                                ? 'null'
                                : specialTarget
                            }.webp`"
                            type="image/webp"
                          />
                          <img
                            class="w-16"
                            :src="`/icons/tokkou_50_${
                              specialTarget === 'neutral'
                                ? 'null'
                                : specialTarget
                            }.png`"
                            loading="lazy"
                          />
                        </picture>

                        <span class="ml-1">
                          ({{ $t("fields.tokkouColor") }}:
                          {{ $t(`colors.${specialTarget}`) }})
                        </span>
                      </div>
                    </template>
                  </template>

                  <!-- effect -->
                  <div v-if="$te(`cards.${item.id}.arts[${index}].effect`)">
                    {{ $t(`cards.${item.id}.arts[${index}].effect`) }}
                  </div>
                </div>
              </template>
            </template>

            <!-- extra -->
            <template v-if="$te(`cards.${item.id}.extra`)">
              <!-- origin gradient color: bg-[linear-gradient(90deg,_rgb(245,218,114),_rgb(221,159,51)_50%,_rgb(245,218,114))] -->
              <!-- WCAG AAA color contrast gradient color: bg-[linear-gradient(90deg,_rgb(105,85,7),_rgb(118,82,20)_50%,_rgb(105,85,7))] -->
              <Badge
                class="badge-text bg-[linear-gradient(90deg,_rgb(105,85,7),_rgb(118,82,20)_50%,_rgb(105,85,7))]"
              >
                {{ $t("fields.extra") }}
              </Badge>

              <div class="">
                {{ $t(`cards.${item.id}.extra`) }}
              </div>
            </template>

            <!-- abilityText -->
            <template v-if="$te(`cards.${item.id}.abilityText`)">
              <Badge class="badge-text">{{ $t("fields.ability") }}</Badge>
              <div
                v-html="
                  $t(`cards.${item.id}.abilityText`).replaceAll('\n', '<br>')
                "
              />
              <!-- <div class="whitespace-pre-line">
                {{ $t(`cards.${item.id}.abilityText`) }}
              </div> -->
            </template>

            <!-- illustrator -->
            <template v-if="$te(`cards.${item.id}.illustrator`)">
              <Badge class="badge-text">{{ $t("fields.illustrator") }}</Badge>
              <!-- <div class="badge-text">{{ $t("fields.illustrator") }}:</div> -->
              <div class="">
                {{ $t(`cards.${item.id}.illustrator`) }}
              </div>
            </template>
          </div>
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
