<script lang="ts" setup>
import { Funnel, PanelTopClose, RotateCcw } from "lucide-vue-next";

const { locale } = useI18n();

// filter
const filter = useFilter();
const name = computed(() => filter.filter.value.name);
const tag = computed(() => filter.filter.value.tag);
const set = computed(() => filter.filter.value.set);
const colors = computed(() => filter.filter.value.colors);
const cardTypes = computed(() => filter.filter.value.cardTypes);
const rarities = computed(() => filter.filter.value.rarity);
const bloomLevel = computed(() => filter.filter.value.bloomLevel);
const isFiltered = computed(() => filter.isFiltered);

// For the API version, we'll use the existing filter logic
// but fetch options from the API when needed
const isLoading = ref(false);

// Toggle states for dropdowns
const isNameOpen = ref(false);
const isTagOpen = ref(false);
const isSetOpen = ref(false);

// Loading states for each dropdown
const isLoadingNames = ref(false);
const isLoadingTags = ref(false);
const isLoadingSets = ref(false);

// Options from API
const nameFilterOptions = ref<{ value: string; label: string }[]>([]);
const tagFilterOptions = ref<{ value: string; label: string }[]>([]);
const setFilterOptions = ref<{ value: string; label: string }[]>([]);

// Configuration
const runtimeConfig = useRuntimeConfig();
const apiBaseUrl =
  runtimeConfig.public.apiUrl ||
  "https://your-worker.your-subdomain.workers.dev";

// API call helper
const loadFilterOptions = async (type: "names" | "tags" | "sets") => {
  try {
    const response = await $fetch<{
      names: { value: string; label: string }[];
      tags: { value: string; label: string }[];
      sets: { value: string; label: string }[];
    }>(`${apiBaseUrl}/api/filter-options?locale=${locale.value}`);

    return response[type] || [];
  } catch (error) {
    console.error(`Failed to load ${type} options:`, error);
    return [];
  }
};

// Load name options when dropdown opens
const loadNameOptions = async () => {
  if (nameFilterOptions.value.length > 0) return;

  isLoadingNames.value = true;
  try {
    const options = await loadFilterOptions("names");
    nameFilterOptions.value = options;
  } finally {
    isLoadingNames.value = false;
  }
};

// Load tag options when dropdown opens
const loadTagOptions = async () => {
  if (tagFilterOptions.value.length > 0) return;

  isLoadingTags.value = true;
  try {
    const options = await loadFilterOptions("tags");
    tagFilterOptions.value = options;
  } finally {
    isLoadingTags.value = false;
  }
};

// Load set options when dropdown opens
const loadSetOptions = async () => {
  if (setFilterOptions.value.length > 0) return;

  isLoadingSets.value = true;
  try {
    const options = await loadFilterOptions("sets");
    setFilterOptions.value = options;
  } finally {
    isLoadingSets.value = false;
  }
};

// Clear options when locale changes
watch(
  () => locale.value,
  () => {
    nameFilterOptions.value = [];
    tagFilterOptions.value = [];
    setFilterOptions.value = [];
  }
);
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
      <!-- Add loading overlay -->
      <div
        v-if="isLoading"
        class="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <div class="flex flex-col items-center gap-2">
          <div
            class="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"
          ></div>
          <span class="text-sm text-muted-foreground">{{
            $t("Filtering...")
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

                  <button @click="filter.resetName">
                    <RotateCcw class="size-4" />
                  </button>
                </div>

                <Popover v-model:open="isNameOpen">
                  <PopoverTrigger as-child>
                    <Button
                      variant="outline"
                      size="sm"
                      class="w-max justify-start"
                      @click="loadNameOptions"
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
                      v-if="isLoadingNames || nameFilterOptions.length === 0"
                      class="p-2 text-center text-sm text-muted-foreground"
                    >
                      <div
                        class="animate-spin h-4 w-4 border border-primary rounded-full inline-block mr-2 border-t-transparent"
                      />
                      Loading...
                    </div>
                    <Command v-else v-model="filter.filter.value.name">
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

                  <button @click="filter.resetTag">
                    <RotateCcw class="size-4" />
                  </button>
                </div>

                <Popover v-model:open="isTagOpen">
                  <PopoverTrigger as-child>
                    <Button
                      variant="outline"
                      size="sm"
                      class="w-max justify-start"
                      @click="loadTagOptions"
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
                      v-if="isLoadingTags || tagFilterOptions.length === 0"
                      class="p-2 text-center text-sm text-muted-foreground"
                    >
                      <div
                        class="animate-spin h-4 w-4 border border-primary rounded-full inline-block mr-2 border-t-transparent"
                      />
                      Loading...
                    </div>
                    <Command v-else v-model="filter.filter.value.tag">
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
                      @click="loadSetOptions"
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
                      v-if="isLoadingSets || setFilterOptions.length === 0"
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
                      @update:model-value="(val: boolean) => (colors[key] = val)"
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
                      @update:model-value="(val: boolean) => (cardTypes[key] = val)"
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
                      @update:model-value="(val: boolean) => (rarities[key] = val)"
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
                      @update:model-value="(val: boolean) => (bloomLevel[key] = val)"
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
