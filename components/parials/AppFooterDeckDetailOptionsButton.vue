<script setup lang="ts">
import { CircleEllipsis, Import, ClipboardCopy } from "lucide-vue-next";
import { toast } from "vue-sonner";
import { useClipboard } from "@vueuse/core";

const route = useRoute();

const decks = useDecks();

const importDeck = () => {
  if (!route.params.code) {
    toast.error("No deck code provided.");
    return;
  }

  const code = route.params.code as string;
  const result = decks.importDeckByCode(code);

  if (result.status) {
    toast.success(result.message);
  } else {
    toast.error(result.message);
  }
};

const source = ref(window.location.href);
const { text, copy, copied, isSupported } = useClipboard({ source });

const shareDeck = () => {
  copy();
  if (!isSupported.value) {
    toast.error("Clipboard is not supported in this browser.");
    return;
  }
  toast.success(`Copied deck code URL.`);
};
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="outline">
        <CircleEllipsis />
        <span class="hidden md:inline-flex"> Options </span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuGroup>
        <DropdownMenuItem @click="importDeck">
          <Import /> Import This Deck
        </DropdownMenuItem>

        <DropdownMenuItem @click="shareDeck">
          <ClipboardCopy /> Copy Deck Code URL
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
