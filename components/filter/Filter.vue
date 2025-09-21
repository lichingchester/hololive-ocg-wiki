<script lang="ts" setup>
import { Funnel, PanelTopClose, RotateCcw, Search } from "lucide-vue-next";

const { locale } = useI18n();
const cardStore = useCardStore();

// filter
const filter = useFilter();

// Use draft filters for UI editing
const name = computed(() => filter.draftFilter.value.name);
const tag = computed(() => filter.draftFilter.value.tag);
const set = computed(() => filter.draftFilter.value.set);
const colors = computed(() => filter.draftFilter.value.colors);
const cardTypes = computed(() => filter.draftFilter.value.cardTypes);
const rarities = computed(() => filter.draftFilter.value.rarity);
const bloomLevel = computed(() => filter.draftFilter.value.bloomLevel);

// Check if applied filters are active (for the red dot indicator)
const isFiltered = computed(() => filter.isFiltered);
// Check if there are pending changes
const hasPendingChanges = computed(() => filter.hasPendingChanges);

// Add loading state
const isLoading = computed(() => cardStore.isLoading.value);

// Filter application loading state
const isApplyingFilters = ref(false);

// Toggle states for dropdowns
const isNameOpen = ref(false);
const isTagOpen = ref(false);
const isSetOpen = ref(false);

// Initialize draft filters when component mounts
onMounted(() => {
  filter.initializeDraftFilters();
});

// Handle filter application
const handleApplyFilters = async () => {
  // Check if there are any pending changes before applying
  if (!hasPendingChanges.value) {
    console.log("No filter changes detected, skipping filter application");
    return;
  }

  isApplyingFilters.value = true;
  try {
    filter.applyFilters();
    // Close the sheet after applying filters
    // The parent SheetClose will handle this
  } finally {
    isApplyingFilters.value = false;
  }
};

// Handle cancel (reset draft to applied filters)
const handleCancel = () => {
  filter.resetDraft();
};

// Handle reset all filters
const handleResetAll = () => {
  filter.reset();
};

// Get options from cache instead of computing them in the component
const nameFilterOptions = computed(() => {
  // Only load options when dropdown is open (lazily)
  if (!isNameOpen.value) {
    return [];
  }

  // Get from cardStore's cached options
  return cardStore.getNameOptions(locale.value);
});

// Get tag options from cache
const tagFilterOptions = computed(() => {
  // Only load options when dropdown is open (lazily)
  if (!isTagOpen.value) {
    return [];
  }

  // Get from cardStore's cached options
  return cardStore.getTagOptions(locale.value);
});

// Get set options from cache
const setFilterOptions = computed(() => {
  // Only load options when dropdown is open (lazily)
  if (!isSetOpen.value) {
    return [];
  }

  // Get from cardStore's cached options
  return cardStore.getSetOptions(locale.value);
});
</script>

<template>
  <Sheet>
    <SheetTrigger as-child>
      <Button size="icon" class="relative">
        <!-- filtered dot -->
        <div
          v-if="isFiltered()"
          class="absolute left-0 top-0 -translate-2/4 size-2.5 bg-red-500 rounded-full"
        ></div>

        <Funnel />
      </Button>
    </SheetTrigger>
    <SheetContent side="top" hide-top-right-close>
      <DialogHeader class="h-0 overflow-hidden">
        <DialogTitle>Filter</DialogTitle>
        <DialogDescription>Filter</DialogDescription>
      </DialogHeader>

      <!-- Add loading overlay for filter application -->
      <div
        v-if="isLoading || isApplyingFilters"
        class="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <div class="flex flex-col items-center gap-2">
          <div
            class="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"
          ></div>
          <span class="text-sm text-muted-foreground">{{
            isApplyingFilters ? $t("Applying filters...") : $t("Filtering...")
          }}</span>
        </div>
      </div>

      <div class="flex grow">
        <ScrollArea>
          <div class="w-full max-h-[calc(100dvh-68px)]">
            <!-- quick filters -->
            <div class="flex flex-col gap-4 pt-4 px-4">
              <!-- name -->
              <div class="">
                <div class="flex items-center gap-2 font-semibold mb-2">
                  {{ $t("fields.name") }}

                  <button @click="filter.resetDraftName">
                    <RotateCcw class="size-4" />
                  </button>
                </div>

                <Popover v-model:open="isNameOpen">
                  <PopoverTrigger as-child>
                    <Button
                      variant="outline"
                      size="sm"
                      class="w-max justify-start"
                    >
                      <template v-if="name">
                        {{ name }}
                      </template>
                      <template v-else> + {{ $t("fields.name") }} </template>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    class="p-0"
                    side="bottom"
                    align="start"
                    avoid-collisions
                  >
                    <div
                      v-if="nameFilterOptions.length === 0"
                      class="p-2 text-center text-sm text-muted-foreground"
                    >
                      <div
                        class="animate-spin h-4 w-4 border border-primary rounded-full inline-block mr-2 border-t-transparent"
                      />
                      Loading...
                    </div>
                    <Command v-else v-model="filter.draftFilter.value.name">
                      <CommandInput placeholder="Change name..." />
                      <CommandList>
                        <CommandEmpty>
                          {{ $t("No results found.") }}
                        </CommandEmpty>
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
                  {{ $t("fields.tags") }}

                  <button @click="filter.resetDraftTag">
                    <RotateCcw class="size-4" />
                  </button>
                </div>

                <Popover v-model:open="isTagOpen">
                  <PopoverTrigger as-child>
                    <Button
                      variant="outline"
                      size="sm"
                      class="w-max justify-start"
                    >
                      <template v-if="tag">
                        {{ tag }}
                      </template>
                      <template v-else> + {{ $t("fields.tags") }} </template>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    class="p-0"
                    side="bottom"
                    align="start"
                    avoid-collisions
                  >
                    <div
                      v-if="tagFilterOptions.length === 0"
                      class="p-2 text-center text-sm text-muted-foreground"
                    >
                      <div
                        class="animate-spin h-4 w-4 border border-primary rounded-full inline-block mr-2 border-t-transparent"
                      />
                      Loading...
                    </div>
                    <Command v-else v-model="filter.draftFilter.value.tag">
                      <CommandInput placeholder="Change tag..." />
                      <CommandList>
                        <CommandEmpty>
                          {{ $t("No results found.") }}
                        </CommandEmpty>
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

              <!-- set -->
              <div class="">
                <div class="flex items-center gap-2 font-semibold mb-2">
                  {{ $t("fields.set") }}

                  <button @click="filter.resetSet">
                    <RotateCcw class="size-4" />
                  </button>
                </div>

                <Popover v-model:open="isSetOpen">
                  <PopoverTrigger as-child>
                    <Button
                      variant="outline"
                      size="sm"
                      class="w-max justify-start"
                    >
                      <template v-if="set">
                        {{ set }}
                      </template>
                      <template v-else> + {{ $t("fields.set") }} </template>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    class="p-0"
                    side="bottom"
                    align="start"
                    avoid-collisions
                  >
                    <div
                      v-if="setFilterOptions.length === 0"
                      class="p-2 text-center text-sm text-muted-foreground"
                    >
                      <div
                        class="animate-spin h-4 w-4 border border-primary rounded-full inline-block mr-2 border-t-transparent"
                      />
                      Loading...
                    </div>
                    <Command v-else v-model="filter.filter.value.set">
                      <CommandInput placeholder="Change set..." />
                      <CommandList>
                        <CommandEmpty>
                          {{ $t("No results found.") }}
                        </CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            v-for="setOption in setFilterOptions"
                            :key="setOption.value"
                            :value="setOption.value"
                            @select="
                              () => {
                                isSetOpen = false;
                              }
                            "
                          >
                            {{ setOption.label }}
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
                  {{ $t("fields.color") }}

                  <button @click="filter.resetColors">
                    <RotateCcw class="size-4" />
                  </button>
                </div>
                <div class="flex flex-wrap gap-2">
                  <template v-for="(value, key) in colors" :key="key">
                    <Toggle
                      :model-value="!!colors[key]"
                      @update:model-value="(val) => (colors[key] = val)"
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
                  {{ $t("fields.cardType") }}

                  <button @click="filter.resetCardTypes">
                    <RotateCcw class="size-4" />
                  </button>
                </div>
                <div class="flex flex-wrap gap-2">
                  <template v-for="(type, key) in cardTypes" :key="key">
                    <Toggle
                      :model-value="!!cardTypes[key]"
                      @update:model-value="(val) => (cardTypes[key] = val)"
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
                  {{ $t("fields.rarity") }}

                  <button @click="filter.resetRarity">
                    <RotateCcw class="size-4" />
                  </button>
                </div>
                <div class="flex flex-wrap gap-2">
                  <template v-for="(rarity, key) in rarities" :key="key">
                    <Toggle
                      :model-value="!!rarities[key]"
                      @update:model-value="(val) => (rarities[key] = val)"
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
                  {{ $t("fields.bloomLevel") }}

                  <button @click="filter.resetBloomLevel">
                    <RotateCcw class="size-4" />
                  </button>
                </div>
                <div class="flex flex-wrap gap-2">
                  <template v-for="(level, key) in bloomLevel" :key="key">
                    <Toggle
                      :model-value="!!bloomLevel[key]"
                      @update:model-value="(val) => (bloomLevel[key] = val)"
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
            <RotateCcw /> {{ $t("Reset") }}
          </Button>

          <SheetClose as-child>
            <Button class="grow"> <PanelTopClose /> {{ $t("Close") }} </Button>
          </SheetClose>
        </div>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
