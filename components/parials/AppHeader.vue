<script setup lang="ts">
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
</script>

<template>
  <header
    class="border-solid sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
  >
    <div class="p-2 flex items-center gap-2">
      <!-- filter -->
      <Filter />

      <!-- search -->
      <Input id="search" type="text" placeholder="Search..." />

      <div class="flex ml-auto">
        <AppLanguageSwitcher />
        <AppColorModeSwitcher />
      </div>
    </div>

    <!-- quick filters -->
    <div class="flex items-center px-2 pb-2 gap-2">
      <!-- color -->
      <Select>
        <SelectTrigger class="">
          <SelectValue placeholder="Color" />
        </SelectTrigger>
        <SelectContent>
          <template v-for="(color, key) in $tm('colors')" :key="key">
            <SelectItem :value="key">{{ $rt(color) }}</SelectItem>
          </template>
        </SelectContent>
      </Select>

      <!-- CardTypeCodeType -->
      <Select class="mr-2">
        <SelectTrigger class="">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <template v-for="(type, key) in $tm('cardTypes')" :key="key">
            <SelectItem :value="key">{{ $rt(type) }}</SelectItem>
          </template>
        </SelectContent>
      </Select>

      <!-- Rarity -->
      <Select class="mr-2">
        <SelectTrigger class="">
          <SelectValue placeholder="Rarity" />
        </SelectTrigger>
        <SelectContent>
          <template v-for="(rarity, key) in $tm('rarity')" :key="key">
            <SelectItem :value="key">{{ $rt(rarity) }}</SelectItem>
          </template>
        </SelectContent>
      </Select>
    </div>
  </header>
</template>
