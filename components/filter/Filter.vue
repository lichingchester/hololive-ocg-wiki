<script lang="ts" setup>
import { Funnel, PanelTopClose } from "lucide-vue-next";

const filterState = useFilterState();
</script>

<template>
  <Sheet>
    <SheetTrigger as-child>
      <Button size="icon"> <Funnel /> </Button>
    </SheetTrigger>
    <SheetContent side="top">
      <!-- quick filters -->
      <div class="flex flex-col gap-4 pt-4 px-4">
        <!-- color -->
        <div class="">
          <div class="font-semibold mb-2">Colors</div>
          <div class="flex flex-wrap gap-2">
            <template v-for="(value, key) in filterState.colors" :key="key">
              <Toggle
                v-model="filterState.colors[key]"
                size="sm"
                variant="outline"
                aria-label="Toggle Colors"
              >
                <picture>
                  <source
                    :srcset="`icons/type_${key}.webp`"
                    type="image/webp"
                  />
                  <img
                    class="w-4"
                    :src="`icons/type_${key}.png`"
                    loading="lazy"
                  />
                </picture>
                {{ $t(`colors.${key}`) }}
              </Toggle>
            </template>
          </div>
        </div>

        <!-- CardTypeCodeType -->
        <div class="">
          <div class="font-semibold mb-2">Type</div>
          <div class="flex flex-wrap gap-2">
            <template v-for="(type, key) in filterState.cardTypes" :key="key">
              <Toggle
                v-model="filterState.cardTypes[key]"
                size="sm"
                variant="outline"
                aria-label="Toggle Types"
              >
                {{ $t(`cardTypes.${key}`) }}
              </Toggle>
            </template>
          </div>
        </div>

        <!-- Rarity -->
        <div class="">
          <div class="font-semibold mb-2">Rarity</div>
          <div class="flex flex-wrap gap-2">
            <template v-for="(rarity, key) in filterState.rarity" :key="key">
              <Toggle
                v-model="filterState.rarity[key]"
                size="sm"
                variant="outline"
                aria-label="Toggle Rarity"
              >
                {{ $t(`rarity.${key}`) }}
              </Toggle>
            </template>
          </div>
        </div>

        <!-- bloomLevel -->
        <div class="">
          <div class="font-semibold mb-2">Bloom Level</div>
          <div class="flex flex-wrap gap-2">
            <template v-for="(level, key) in filterState.bloomLevel" :key="key">
              <Toggle
                v-model="filterState.bloomLevel[key]"
                size="sm"
                variant="outline"
                aria-label="Toggle Bloom Level"
              >
                {{ $t(`bloomLevel.${key}`) }}
              </Toggle>
            </template>
          </div>
        </div>
      </div>

      <SheetFooter>
        <SheetClose as-child>
          <Button> <PanelTopClose /> Close </Button>
        </SheetClose>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
