<script lang="ts" setup>
import { Funnel, PanelTopClose, RotateCcw } from "lucide-vue-next";
import CardDataJson from "@/data/cards_i18n.json";

const { locale } = useI18n();

// filter
const filter = useFilter();
const name = computed(() => filter.filter.value.name);
const tag = computed(() => filter.filter.value.tag);
const colors = computed(() => filter.filter.value.colors);
const cardTypes = computed(() => filter.filter.value.cardTypes);
const rarities = computed(() => filter.filter.value.rarity);
const bloomLevel = computed(() => filter.filter.value.bloomLevel);

// name filter
const isNameOpen = ref(false);

const nameList = CardDataJson.map(
  (card) => card.translations[locale.value].name
);

const uniqueNames = new Set<string>(nameList);

const nameFilterOptions = [...uniqueNames].map((name) => ({
  value: name,
  label: name,
}));

// tag filter
const isTagOpen = ref(false);

const tagsList = CardDataJson.map(
  (card) => card.translations[locale.value].tags
);

const flatTagList = tagsList
  .flat()
  .filter((tag): tag is string => tag !== "" && tag !== undefined);

const uniqueTags = new Set<string>(flatTagList);

const tagFilterOptions = [...uniqueTags].map((tag) => ({
  value: tag,
  label: tag,
}));
</script>

<template>
  <Sheet>
    <SheetTrigger as-child>
      <Button size="icon"> <Funnel /> </Button>
    </SheetTrigger>
    <SheetContent side="top" hide-top-right-close>
      <div class="flex grow">
        <ScrollArea>
          <div class="w-full max-h-[calc(100dvh-68px)]">
            <!-- quick filters -->
            <div class="flex flex-col gap-4 pt-4 px-4">
              <!-- name -->
              <div class="">
                <div class="flex items-center gap-2 font-semibold mb-2">
                  Name

                  <button @click="filter.resetName">
                    <RotateCcw class="size-4" />
                  </button>
                </div>

                <Popover v-model:open="isNameOpen">
                  <PopoverTrigger as-child>
                    <Button
                      variant="outline"
                      size="sm"
                      class="w-[150px] justify-start"
                    >
                      <template v-if="name">
                        {{ name }}
                      </template>
                      <template v-else> + Set Name </template>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    class="p-0"
                    side="bottom"
                    align="start"
                    avoid-collisions
                  >
                    <Command v-model="filter.filter.value.name">
                      <CommandInput placeholder="Change name..." />
                      <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            v-for="nameOption in nameFilterOptions"
                            :key="nameOption.value"
                            :value="nameOption.value"
                            @select="
                              () => {
                                isNameOpen = false;
                              }
                            "
                          >
                            {{ nameOption.label }}
                          </CommandItem>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <!-- tag -->
              <div class="">
                <div class="flex items-center gap-2 font-semibold mb-2">
                  Tag

                  <button @click="filter.resetTag">
                    <RotateCcw class="size-4" />
                  </button>
                </div>

                <Popover v-model:open="isTagOpen">
                  <PopoverTrigger as-child>
                    <Button
                      variant="outline"
                      size="sm"
                      class="w-[150px] justify-start"
                    >
                      <template v-if="tag">
                        {{ tag }}
                      </template>
                      <template v-else> + Set Tag </template>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    class="p-0"
                    side="bottom"
                    align="start"
                    avoid-collisions
                  >
                    <Command v-model="filter.filter.value.tag">
                      <CommandInput placeholder="Change tag..." />
                      <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            v-for="tagOption in tagFilterOptions"
                            :key="tagOption.value"
                            :value="tagOption.value"
                            @select="
                              () => {
                                isTagOpen = false;
                              }
                            "
                          >
                            {{ tagOption.label }}
                          </CommandItem>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <!-- color -->
              <div class="">
                <div class="flex items-center gap-2 font-semibold mb-2">
                  Colors

                  <button @click="filter.resetColors">
                    <RotateCcw class="size-4" />
                  </button>
                </div>
                <div class="flex flex-wrap gap-2">
                  <template v-for="(value, key) in colors" :key="key">
                    <Toggle
                      v-model="colors[key]"
                      size="sm"
                      variant="outline"
                      aria-label="Toggle Colors"
                    >
                      <Image
                        :src="`/icons/type_${key}.png`"
                        :img-attributes="{ class: 'w-4' }"
                      />

                      {{ $t(`colors.${key}`) }}
                    </Toggle>
                  </template>
                </div>
              </div>

              <!-- CardTypeCodeType -->
              <div class="">
                <div class="flex items-center gap-2 font-semibold mb-2">
                  Type

                  <button @click="filter.resetCardTypes">
                    <RotateCcw class="size-4" />
                  </button>
                </div>
                <div class="flex flex-wrap gap-2">
                  <template v-for="(type, key) in cardTypes" :key="key">
                    <Toggle
                      v-model="cardTypes[key]"
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
                <div class="flex items-center gap-2 font-semibold mb-2">
                  Rarity

                  <button @click="filter.resetRarity">
                    <RotateCcw class="size-4" />
                  </button>
                </div>
                <div class="flex flex-wrap gap-2">
                  <template v-for="(rarity, key) in rarities" :key="key">
                    <Toggle
                      v-model="rarities[key]"
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
                <div class="flex items-center gap-2 font-semibold mb-2">
                  Bloom Level

                  <button @click="filter.resetBloomLevel">
                    <RotateCcw class="size-4" />
                  </button>
                </div>
                <div class="flex flex-wrap gap-2">
                  <template v-for="(level, key) in bloomLevel" :key="key">
                    <Toggle
                      v-model="bloomLevel[key]"
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
          </div>
        </ScrollArea>
      </div>

      <SheetFooter class="pt-0 md:pt-4">
        <div class="flex items-center w-full gap-4">
          <Button class="grow" variant="outline" @click="filter.reset">
            <RotateCcw /> Reset
          </Button>

          <SheetClose as-child>
            <Button class="grow"> <PanelTopClose /> Close </Button>
          </SheetClose>
        </div>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
