<script setup lang="ts">
import { Input } from "@/components/ui/input";

const filter = useFilter();
</script>

<template>
  <Input
    id="search"
    v-model="filter.filter.value.search"
    type="search"
    :placeholder="$t('Search')"
  />
</template>
