<script setup lang="ts">
import { Settings } from "lucide-vue-next";
import { toast } from "vue-sonner";
import { useClipboard } from "@vueuse/core";

const decks = useDecks();
const currentDeck = computed(() => decks.currentDeck.value);

const source = ref("");
const { text, copy, copied, isSupported } = useClipboard({ source });

const shareDeck = () => {
  if (currentDeck.value) {
    source.value = decks.shareDeck(currentDeck.value.id);
    copy();
    if (!isSupported.value) {
      toast.error("Clipboard is not supported in this browser.");
      return;
    }
    toast.success(
      `Copied deck "${currentDeck.value.name}" sharing URL: ${source.value}`
    );
  } else {
    toast.warning("Select one deck to share.");
  }
};
</script>

<template>
  <div class="">
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="outline">
          <Settings />
          <span class="hidden md:inline-flex"> Settings </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem @click="shareDeck">
          Share Current Deck
        </DropdownMenuItem>
        <!-- <DropdownMenuItem>Export Decks</DropdownMenuItem>
        <DropdownMenuItem>Import Decks</DropdownMenuItem> -->
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
