<script setup lang="ts">
import type { Card } from "@/types/card";
import { ExternalLink } from "lucide-vue-next";

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
            class="text-xs font-semibold"
          >
            {{ $t(`cards.${item.id}.oshiSkill.timing`) }}
          </Badge>

          <!-- cost -->
          <Badge
            v-if="item.oshiSkill.cost"
            variant="outline"
            class="text-xs font-semibold"
          >
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
          <Image
            v-if="item.keyword.typeCode === 'collab_effect'"
            src="/icons/collabEF.png"
            :img-attributes="{ class: 'w-28' }"
          />
          <Image
            v-if="item.keyword.typeCode === 'bloom_effect'"
            src="/icons/bloomEF.png"
            :img-attributes="{ class: 'w-28' }"
          />
          <Image
            v-if="item.keyword.typeCode === 'gift'"
            src="/icons/gift.png"
            :img-attributes="{ class: 'w-14' }"
          />
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
            <div class="flex items-center flex-wrap">
              <template
                v-for="(costType, costTypeIndex) in art.costTypes"
                :key="costTypeIndex"
              >
                <Image
                  :class="
                    costTypeIndex === art.costTypes.length - 1 ? 'mr-1' : ''
                  "
                  :src="`/icons/arts_${costType}.png`"
                  :img-attributes="{ class: 'size-6 min-w-6 min-h-6' }"
                />
              </template>

              <span class=""> ({{ getCostTypesString(art.costTypes) }}) </span>
            </div>
          </template>

          <div class="flex flex-wrap gap-1 justify-end">
            <!-- damage -->
            <Badge variant="outline" class="text-xs">
              {{ $t("fields.damage") }}:
              {{ `${art.damage}${art.isPlus ? "+" : ""}` }}
            </Badge>

            <!-- specialTargets -->
            <template v-if="art.specialTargets">
              <template
                v-for="(
                  specialTarget, specialTargetIndex
                ) in art.specialTargets"
                :key="specialTargetIndex"
              >
                <Badge variant="outline" class="text-xs">
                  <div class="flex items-center">
                    <Image
                      :src="`/icons/tokkou_50_${
                        specialTarget === 'neutral' ? 'null' : specialTarget
                      }.png`"
                      :img-attributes="{ class: 'w-12 min-w-8' }"
                    />

                    <span class="ml-1">
                      {{ $t("fields.tokkouColor") }}:
                      {{ $t(`colors.${specialTarget}`) }}
                    </span>
                  </div>
                </Badge>
              </template>
            </template>
          </div>
        </div>

        <!-- name -->
        <div class="font-semibold">
          {{ $t(`cards.${item.id}.arts[${index}].name`) }}
        </div>

        <!-- effect -->
        <div v-if="$te(`cards.${item.id}.arts[${index}].effect`)">
          {{ $t(`cards.${item.id}.arts[${index}].effect`) }}
        </div>
      </div>
    </template>
  </template>

  <!-- extra -->
  <template v-if="$te(`cards.${item.id}.extra`)">
    <div class="flex flex-col gap-2 p-2 rounded-lg border bg-accent/50">
      <div class="flex items-center justify-between gap-2">
        <span
          class="text-amber-500 bg-amber-500/20 text-xs rounded-lg px-2 py-1"
        >
          {{ $t("fields.extra") }}
        </span>
      </div>

      {{ $t(`cards.${item.id}.extra`) }}
    </div>
  </template>

  <!-- abilityText -->
  <template v-if="$te(`cards.${item.id}.abilityText`)">
    <div class="flex flex-col gap-2 p-2 rounded-lg border bg-accent/50">
      <div class="flex items-center justify-between gap-2">
        <span
          class="text-stone-800 bg-stone-800/20 dark:text-white dark:bg-white/10 text-xs rounded-lg px-2 py-1"
        >
          {{ $t("fields.ability") }}
        </span>
      </div>

      <div
        v-html="$t(`cards.${item.id}.abilityText`).replaceAll('\n', '<br>')"
      />
    </div>
  </template>

  <!-- illustrator -->
  <template v-if="$te(`cards.${item.id}.illustrator`)">
    <div class="flex flex-col gap-2 p-2 rounded-lg border bg-accent/50">
      <div class="flex items-center justify-between gap-2">
        <Badge variant="outline" class="text-xs">
          {{ $t(`fields.illustrator`) }}
        </Badge>

        <div class="text-xs">
          {{ $t(`cards.${item.id}.illustrator`) }}
        </div>
      </div>
    </div>
  </template>

  <!-- links -->
  <div class="flex justify-end">
    <Button variant="link" class="px-0 text-xs" as-child>
      <a
        :href="`https://hololive-official-cardgame.com/cardlist/?id=${item.id}`"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-1"
      >
        <ExternalLink />Official Site
      </a>
    </Button>
  </div>
</template>
