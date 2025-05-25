<script setup lang="ts">
import type { Card } from "@/types/card";
import { Badge } from "@/components/ui/badge";
import { VisuallyHidden } from "reka-ui";

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
  <DialogContent class="p-1 sm:p-2 xl:p-4 sm:max-w-[80vw] 2xl:max-w-[1280px]">
    <VisuallyHidden as-child>
      <DialogTitle>
        {{ $t(`cards.${item.id}.name`) }}
      </DialogTitle>
    </VisuallyHidden>

    <VisuallyHidden as-child>
      <DialogDescription>
        {{ $t(`cards.${item.id}.name`) }}
      </DialogDescription>
    </VisuallyHidden>

    <div class="">
      <div class="flex">
        <NuxtPicture
          class="w-2/5"
          format="webp"
          :src="'/' + item.imagePath"
          loading="lazy"
          :img-attrs="{ class: 'w-full' }"
        />

        <div class="w-3/5 pl-1 sm:pl-2">
          <div class="flex items-baseline gap-1">
            <h2 class="xl:text-2xl font-bold mb-1">
              {{ $t(`cards.${item.id}.name`) }}
            </h2>
            <span class="text-sm text-muted-foreground ml-1">
              {{ item.id }}
            </span>
            <span class="text-sm text-muted-foreground ml-1">
              {{ item.cardNumber }}
            </span>
          </div>

          <div
            class="grid grid-cols-[min-content_1fr] gap-2 xl:gap-4 pt-2 xl:pt-4 items-center"
          >
            <!-- cardTypeCode -->
            <template v-if="item.cardTypeCode">
              <Badge class="badge-text">{{ $t("fields.cardType") }}</Badge>
              <div class="">
                {{ $t(`cards.${item.id}.cardType`) }}
              </div>
            </template>

            <!-- tags -->
            <template v-if="item.tags">
              <Badge class="badge-text">{{ $t("fields.tags") }}</Badge>
              <div class="flex flex-wrap gap-1">
                <template
                  v-for="(tag, index) in $tm(`cards.${item.id}.tags`)"
                  :key="index"
                >
                  <Button variant="link" class="p-0 h-auto">
                    {{ $rt(tag) }}
                  </Button>
                </template>
              </div>
            </template>

            <!-- rarityCode -->
            <template v-if="item.rarityCode">
              <Badge class="badge-text">{{ $t("fields.rarity") }}</Badge>
              {{ $t(`cards.${item.id}.rarity`) }}
            </template>

            <!-- set -->
            <template v-if="item.translations?.ja?.set">
              <Badge class="badge-text">{{ $t("fields.set") }}</Badge>
              {{ $t(`cards.${item.id}.set`) }}
            </template>

            <!-- colorCode -->
            <template v-if="item.colorCode">
              <Badge class="badge-text">{{ $t("fields.color") }}</Badge>
              <div class="flex items-center gap-1">
                <NuxtPicture
                  format="webp"
                  :src="`/icons/type_${
                    item.colorCode === 'unknown' ? 'blue_red' : item.colorCode
                  }.png`"
                  loading="lazy"
                  :img-attrs="{ class: 'w-5' }"
                />
                {{ $t(`cards.${item.id}.color`) }}
              </div>
            </template>

            <!-- life -->
            <template v-if="item.life">
              <Badge class="badge-text">{{ $t("fields.life") }}</Badge>
              {{ item.life }}
            </template>

            <!-- hp -->
            <template v-if="item.hp">
              <Badge class="badge-text">{{ $t("fields.hp") }}</Badge>
              {{ item.hp }}
            </template>

            <!-- bloomLevelCode -->
            <template v-if="item.bloomLevelCode">
              <Badge class="badge-text">{{ $t("fields.bloomLevel") }}</Badge>
              {{ $t(`cards.${item.id}.bloomLevel`) }}
            </template>

            <!-- batonTouchCount -->
            <template v-if="item.batonTouchCount">
              <Badge class="badge-text">{{
                $t("fields.batonTouchCount")
              }}</Badge>

              <div class="flex items-center">
                <template v-for="index in item.batonTouchCount" :key="index">
                  <NuxtPicture
                    format="webp"
                    src="/icons/arts_null.png"
                    loading="lazy"
                    :img-attrs="{ class: 'w-6 h-6' }"
                  />
                </template>

                <span class="ml-1">
                  ({{ $t(`colors.neutral`) }} {{ `x${item.batonTouchCount}` }})
                </span>
              </div>
            </template>

            <!-- oshiSkill -->
            <template v-if="item.oshiSkill">
              <Badge class="badge-text bg-[#ED798D]">{{
                $t("fields.oshiSkill")
              }}</Badge>

              <div class="">
                <!-- cost -->
                <div v-if="item.oshiSkill.cost" class="">
                  [{{ $t(`fields.cost`) }}: {{ item.oshiSkill.cost }}]
                </div>

                <!-- name -->
                <div class="text-lg font-semibold">
                  {{ $t(`cards.${item.id}.oshiSkill.name`) }}
                </div>

                <!-- effect -->
                <div class="">
                  {{ $t(`cards.${item.id}.oshiSkill.effect`) }}
                </div>
              </div>
            </template>

            <!-- spOshiSkill -->
            <template v-if="item.spOshiSkill">
              <Badge class="badge-text bg-[#ED798D]">{{
                $t("fields.spOshiSkill")
              }}</Badge>

              <div class="">
                <!-- cost -->
                <div v-if="item.spOshiSkill.cost" class="">
                  [{{ $t(`fields.cost`) }}: {{ item.spOshiSkill.cost }}]
                </div>

                <!-- name -->
                <div class="text-lg font-semibold">
                  {{ $t(`cards.${item.id}.spOshiSkill.name`) }}
                </div>

                <!-- effect -->
                <div class="">
                  {{ $t(`cards.${item.id}.spOshiSkill.effect`) }}
                </div>
              </div>
            </template>

            <!-- keyword -->
            <template v-if="item.keyword">
              <!-- origin gradient color: bg-[linear-gradient(110deg,_rgb(35,179,157),_rgb(60,203,200)_60%,_rgb(34,168,213))] -->
              <!-- WCAG AAA color contrast gradient color: bg-[linear-gradient(110deg,_rgb(19,98,86),_rgb(26,97,96)_60%,_rgb(19,94,118))] -->
              <Badge
                class="badge-text bg-[linear-gradient(110deg,_rgb(19,98,86),_rgb(26,97,96)_60%,_rgb(19,94,118))]"
              >
                {{ $t("fields.keyword") }}
              </Badge>

              <div class="">
                <!-- image -->
                <div v-if="item.keyword.typeCode" class="flex items-end gap-2">
                  <NuxtPicture
                    v-if="item.keyword.typeCode === 'collab_effect'"
                    format="webp"
                    src="/icons/collabEF.png"
                    loading="lazy"
                    :img-attrs="{ class: 'w-48' }"
                  />
                  <NuxtPicture
                    v-if="item.keyword.typeCode === 'bloom_effect'"
                    format="webp"
                    src="/icons/bloomEF.png"
                    loading="lazy"
                    :img-attrs="{ class: 'w-48' }"
                  />
                  <NuxtPicture
                    v-if="item.keyword.typeCode === 'gift'"
                    format="webp"
                    src="/icons/gift.png"
                    loading="lazy"
                    :img-attrs="{ class: 'w-28' }"
                  />

                  ({{ $t(`keywordType.${item.keyword.typeCode}`) }})
                </div>

                <!-- name -->
                <div class="text-lg font-semibold">
                  {{ $t(`cards.${item.id}.keyword.name`) }}
                </div>

                <!-- effect -->
                <div class="">
                  {{ $t(`cards.${item.id}.keyword.effect`) }}
                </div>
              </div>
            </template>

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
                        <NuxtPicture
                          format="webp"
                          :src="`/icons/arts_${
                            costType === 'neutral' ? 'null' : costType
                          }.png`"
                          loading="lazy"
                          :img-attrs="{ class: 'w-6 h-6' }"
                        />
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
                        <NuxtPicture
                          class="inline-block"
                          format="webp"
                          :src="`/icons/tokkou_50_${
                            specialTarget === 'neutral' ? 'null' : specialTarget
                          }.png`"
                          loading="lazy"
                          :img-attrs="{ class: 'w-16' }"
                        />

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
    </div>
  </DialogContent>
</template>

<style lang="postcss" scoped>
.badge-text {
  font-size: 0.875rem; /* 14px */
  align-self: start;

  @media (min-width: 80rem) {
    font-size: 1rem; /* 16px */
  }
}
</style>
