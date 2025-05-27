<script setup lang="ts">
import { Input } from "@/components/ui/input";
// import { Check, Search } from "lucide-vue-next";
// import { cn } from "@/lib/utils";
// import {
//   Combobox,
//   ComboboxAnchor,
//   ComboboxEmpty,
//   ComboboxGroup,
//   ComboboxInput,
//   ComboboxItem,
//   ComboboxItemIndicator,
//   ComboboxList,
// } from "@/components/ui/combobox";
// import type { LocaleMessageValue, VueMessageType } from "vue-i18n";
// import type { Card } from "~/types/card";
// const { rt, tm } = useI18n();

// // Get the unique card names from the i18n translations
// const nameList = ref<string[]>([]);

// // Get all cards translations from the i18n
// const cards = tm("cards") || {};

// // Extract unique names
// const uniqueNames = new Set<string>();

// // Process the translations to get unique names
// Object.values(cards).forEach((card: Card) => {
//   // console.log(rt(card.name || ""));
//   if (card.name) {
//     uniqueNames.add(rt(card.name || ""));
//   }
// });

// nameList.value = Array.from(uniqueNames).sort();

// console.log(nameList.value);

// const nameFilterOptions = nameList.value.map((name) => ({
//   value: name,
//   label: name,
// }));

// const frameworks = [
//   { value: "next.js", label: "Next.js" },
//   { value: "sveltekit", label: "SvelteKit" },
//   { value: "nuxt", label: "Nuxt" },
//   { value: "remix", label: "Remix" },
//   { value: "astro", label: "Astro" },
// ];

const filterState = useFilterState();
</script>

<template>
  <Input
    id="search"
    v-model="filterState.search"
    type="search"
    placeholder="Search"
  />

  <!-- <Combobox by="label" class="w-full">
    <ComboboxAnchor class="w-full">
      <div class="relative w-full max-w-sm items-center">
        <ComboboxInput
          class=""
          :display-value="(val) => val?.label ?? ''"
          placeholder="Search"
        />
        <span
          class="absolute start-0 inset-y-0 flex items-center justify-center px-3"
        >
          <Search class="size-4 text-muted-foreground" />
        </span>
      </div>
    </ComboboxAnchor>

    <ComboboxList>
      <ComboboxEmpty> No name found. </ComboboxEmpty>

      <ComboboxGroup>
        <ComboboxItem
          v-for="name in nameFilterOptions"
          :key="name.value"
          :value="name"
        >
          {{ name.label }}

          <ComboboxItemIndicator>
            <Check :class="cn('ml-auto h-4 w-4')" />
          </ComboboxItemIndicator>
        </ComboboxItem>
      </ComboboxGroup>
    </ComboboxList>
  </Combobox> -->
</template>
