<script setup lang="ts">
const props = defineProps<{
  id: string;
  name: string;
  number: string;
}>();

// id
const {
  copy: copyId,
  copied: copiedId,
  isSupported: isSupportedId,
} = useClipboard({ source: props.id });

// name
const {
  copy: copyName,
  copied: copiedName,
  isSupported: isSupportedName,
} = useClipboard({ source: props.name });

// number
const {
  copy: copyNumber,
  copied: copiedNumber,
  isSupported: isSupportedNumber,
} = useClipboard({ source: props.number });
</script>

<template>
  <div
    class="p-2 justify-between flex items-center gap-2 rounded-lg border bg-accent/50"
  >
    <div class="relative">
      <button class="font-semibold" @click="copyName()">
        {{ name }}
      </button>
      <Transition name="copied">
        <span
          v-if="copiedName"
          class="absolute bottom-full md:bottom-auto md:top-[calc(100%+0.5rem)] left-2/4 -translate-x-2/4 -translate-y-1 rounded-lg bg-green-400 text-slate-800 text-xs py-1 px-2"
        >
          copied
        </span>
      </Transition>
    </div>

    <div class="flex items-center gap-2">
      <div class="relative">
        <Badge
          variant="outline"
          class="text-1 cursor-pointer"
          @click="copyId()"
        >
          {{ id }}
        </Badge>
        <Transition name="copied">
          <span
            v-if="copiedId"
            class="absolute bottom-full md:bottom-auto md:top-[calc(100%+0.5rem)] left-2/4 -translate-x-2/4 -translate-y-1 rounded-lg bg-green-400 text-slate-800 text-xs py-1 px-2"
          >
            copied
          </span>
        </Transition>
      </div>

      <div class="relative">
        <Badge
          variant="outline"
          class="text-1 cursor-pointer"
          @click="copyNumber()"
        >
          {{ number }}
        </Badge>
        <Transition name="copied">
          <span
            v-if="copiedNumber"
            class="absolute bottom-full md:bottom-auto md:top-[calc(100%+0.5rem)] left-2/4 -translate-x-2/4 -translate-y-1 rounded-lg bg-green-400 text-slate-800 text-xs py-1 px-2"
          >
            copied
          </span>
        </Transition>
      </div>
    </div>
  </div>
</template>
