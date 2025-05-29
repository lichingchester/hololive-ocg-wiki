<script setup lang="ts">
import type { Card } from "@/types/card";

defineProps<{
  item: Card;
}>();
</script>

<template>
  <div class="">
    <div class="border divide-y rounded-lg [&>*:nth-of-type(odd)]:bg-accent/50">
      <!-- cardTypeCode -->
      <CardDataRowsBlockItem
        v-if="item.cardTypeCode"
        :name="$t('fields.cardType')"
      >
        {{ $t(`cards.${item.id}.cardType`) }}
      </CardDataRowsBlockItem>

      <!-- tags -->
      <CardDataRowsBlockItem v-if="item.tags" :name="$t('fields.tags')">
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
      </CardDataRowsBlockItem>

      <!-- rarityCode -->
      <CardDataRowsBlockItem v-if="item.rarityCode" :name="$t('fields.rarity')">
        {{ $t(`cards.${item.id}.rarity`) }}
      </CardDataRowsBlockItem>

      <!-- set -->
      <CardDataRowsBlockItem
        v-if="item.translations?.ja?.set"
        :name="$t('fields.set')"
      >
        {{ $t(`cards.${item.id}.set`) }}
      </CardDataRowsBlockItem>

      <!-- colorCode -->
      <CardDataRowsBlockItem v-if="item.colorCode" :name="$t('fields.color')">
        <div class="flex items-center gap-1">
          <picture>
            <source
              :srcset="`icons/type_${item.colorCode}.webp`"
              type="image/webp"
            />
            <img
              class="w-5"
              :src="`icons/type_${item.colorCode}.png`"
              loading="lazy"
            />
          </picture>

          {{ $t(`cards.${item.id}.color`) }}
        </div>
      </CardDataRowsBlockItem>

      <!-- life -->
      <CardDataRowsBlockItem v-if="item.life" :name="$t('fields.life')">
        {{ item.life }}
      </CardDataRowsBlockItem>

      <!-- hp -->
      <CardDataRowsBlockItem v-if="item.hp" :name="$t('fields.hp')">
        {{ item.hp }}
      </CardDataRowsBlockItem>

      <!-- bloomLevelCode -->
      <CardDataRowsBlockItem
        v-if="item.bloomLevelCode"
        :name="$t('fields.bloomLevel')"
      >
        {{ $t(`cards.${item.id}.bloomLevel`) }}
      </CardDataRowsBlockItem>

      <!-- batonTouchCount -->
      <CardDataRowsBlockItem
        v-if="item.batonTouchCount"
        :name="$t('fields.batonTouchCount')"
      >
        <div class="flex items-center">
          <template v-for="index in item.batonTouchCount" :key="index">
            <picture>
              <source :srcset="`icons/arts_null.webp`" type="image/webp" />
              <img
                class="w-6 h-6"
                :src="`icons/arts_null.png`"
                loading="lazy"
              />
            </picture>
          </template>

          <span class="ml-1">
            ({{ $t(`colors.null`) }} {{ `x${item.batonTouchCount}` }})
          </span>
        </div>
      </CardDataRowsBlockItem>
    </div>
  </div>
</template>
