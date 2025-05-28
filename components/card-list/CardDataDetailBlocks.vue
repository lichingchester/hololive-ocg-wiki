<script setup lang="ts">
import type { Card } from "@/types/card";

defineProps<{
  item: Card;
}>();

const { t } = useI18n();

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
  <!-- oshiSkill -->
  <template v-if="item.oshiSkill">
    <div class="flex flex-col gap-2 p-2 rounded-lg border bg-accent/50">
      <div class="flex items-center justify-between gap-2">
        <span
          class="text-[#ED798D] bg-[#ED798D]/20 text-xs rounded-lg px-2 py-1"
        >
          {{ $t("fields.oshiSkill") }}
        </span>

        <div class="flex gap-2">
          <!-- timing -->
          <Badge
            v-if="item.oshiSkill.timingCode"
            variant="outline"
            class="text-xs"
          >
            {{ $t(`cards.${item.id}.oshiSkill.timing`) }}
          </Badge>

          <!-- cost -->
          <Badge v-if="item.oshiSkill.cost" variant="outline" class="text-xs">
            {{ $t(`fields.cost`) }}: {{ item.oshiSkill.cost }}
          </Badge>
        </div>
      </div>

      <!-- name -->
      <div class="font-semibold">
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
    <div class="flex flex-col gap-2 p-2 rounded-lg border bg-accent/50">
      <div class="flex items-center justify-between gap-2">
        <span
          class="text-[#ED798D] bg-[#ED798D]/20 text-xs rounded-lg px-2 py-1"
        >
          {{ $t("fields.spOshiSkill") }}
        </span>

        <div class="flex gap-2">
          <!-- timing -->
          <Badge
            v-if="item.spOshiSkill.timingCode"
            variant="outline"
            class="text-xs"
          >
            {{ $t(`cards.${item.id}.spOshiSkill.timing`) }}
          </Badge>

          <!-- cost -->
          <Badge v-if="item.spOshiSkill.cost" variant="outline" class="text-xs">
            {{ $t(`fields.cost`) }}: {{ item.spOshiSkill.cost }}
          </Badge>
        </div>
      </div>

      <!-- name -->
      <div class="font-semibold">
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
    <div class="flex flex-col gap-2 p-2 rounded-lg border bg-accent/50">
      <div class="flex items-center justify-between gap-2">
        <template v-if="item.keyword.typeCode === 'collab_effect'">
          <span class="text-red-500 bg-red-500/20 text-xs rounded-lg px-2 py-1">
            {{ $t(`keywordType.${item.keyword.typeCode}`) }}
          </span>
        </template>
        <template v-if="item.keyword.typeCode === 'bloom_effect'">
          <span class="text-sky-600 bg-sky-600/20 text-xs rounded-lg px-2 py-1">
            {{ $t(`keywordType.${item.keyword.typeCode}`) }}
          </span>
        </template>
        <template v-if="item.keyword.typeCode === 'gift'">
          <span
            class="text-lime-600 bg-lime-600/20 text-xs rounded-lg px-2 py-1"
          >
            {{ $t(`keywordType.${item.keyword.typeCode}`) }}
          </span>
        </template>

        <div class="flex gap-2">
          <picture v-if="item.keyword.typeCode === 'collab_effect'">
            <source :srcset="`/icons/collabEF.webp`" type="image/webp" />
            <img class="w-28" :src="`/icons/collabEF.png`" loading="lazy" />
          </picture>
          <picture v-if="item.keyword.typeCode === 'bloom_effect'">
            <source :srcset="`/icons/bloomEF.webp`" type="image/webp" />
            <img class="w-28" :src="`/icons/bloomEF.png`" loading="lazy" />
          </picture>
          <picture v-if="item.keyword.typeCode === 'gift'">
            <source :srcset="`/icons/gift.webp`" type="image/webp" />
            <img class="w-14" :src="`/icons/gift.png`" loading="lazy" />
          </picture>
        </div>
      </div>

      <!-- name -->
      <div class="font-semibold">
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
      <div class="flex flex-col gap-2 p-2 rounded-lg border bg-accent/50">
        <div class="flex items-center justify-between gap-2">
          <!-- <span
            class="text-violet-500 bg-violet-500/20 text-xs rounded-lg px-2 py-1"
          >
            {{ $t("fields.arts") }}
          </span> -->

          <!-- cost -->
          <template v-if="art.costTypes">
            <div class="flex items-center">
              <template
                v-for="(costType, costTypeIndex) in art.costTypes"
                :key="costTypeIndex"
              >
                <picture>
                  <source
                    :srcset="`/icons/arts_${costType}.webp`"
                    type="image/webp"
                  />
                  <img
                    class="w-6 h-6"
                    :src="`/icons/arts_${costType}.png`"
                    loading="lazy"
                  />
                </picture>
              </template>

              <span class="ml-1 font-semibold">
                ({{ getCostTypesString(art.costTypes) }})
              </span>
            </div>
          </template>

          <div class="flex gap-2">
            <Badge variant="outline" class="text-xs">
              {{ $t("fields.damage") }}:
              {{ `${art.damage}${art.isPlus ? "+" : ""}` }}
            </Badge>
          </div>
        </div>

        <!-- name -->
        <div class="font-semibold">
          {{ $t(`cards.${item.id}.keyword.name`) }}
        </div>

        <!-- effect -->
        <div class="">
          {{ $t(`cards.${item.id}.keyword.effect`) }}
        </div>
      </div>
    </template>
  </template>
</template>
