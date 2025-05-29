<script setup lang="ts">
import { PackagePlus, Trash2, Layers } from "lucide-vue-next";
import type { Deck } from "@/types/deck";
import { toast } from "vue-sonner";
import { useTimestamp } from "@vueuse/core";

const decks = useDecks();

// create deck
const name = ref("");
const author = ref("");

const isCreateDeckDialogOpen = ref(false);

const createDeck = () => {
  if (!name.value) {
    toast.error("Deck name is required.");
    return;
  }

  const newDeck: Deck = {
    id: `${name.value}-${useTimestamp({ offset: 0 }).value.toString()}`, // Ensure the deck has a unique ID
    name: name.value,
    author: author.value,
    oshiCardIds: [],
    mainCardIds: [],
    yellCardIds: [],
  };

  decks.addDeck(newDeck);
  decks.setCurrentDeck(newDeck);

  // Close the dialog
  isCreateDeckDialogOpen.value = false;

  // Reset fields after creation
  name.value = "";
  author.value = "";

  toast.success("Deck created successfully!");
};

const deleteDeck = (deck: Deck) => {
  decks.deleteDeck(deck.id);
  toast.success("Deck deleted successfully!");
};
</script>

<template>
  <Dialog v-model:open="isCreateDeckDialogOpen">
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button> <Layers />Decks </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DialogTrigger as-child>
          <DropdownMenuItem @click="isCreateDeckDialogOpen = true">
            <PackagePlus /> New Deck
          </DropdownMenuItem>
        </DialogTrigger>

        <template v-if="decks.decks.value.length">
          <DropdownMenuSeparator />

          <div class="flex">
            <ScrollArea class="w-full max-h-[50vh]">
              <template v-for="(deck, index) in decks.decks.value" :key="index">
                <DropdownMenuItem
                  class="flex items-center justify-between"
                  @click="decks.setCurrentDeck(deck)"
                >
                  {{ deck.name }}

                  <Button
                    variant="outline"
                    size="icon"
                    class="size-6 hover:bg-red-500/10 dark:hover:bg-red-500/20"
                    @click.stop.prevent="deleteDeck(deck)"
                  >
                    <Trash2 class="text-red-500 size-3" />
                  </Button>
                </DropdownMenuItem>
              </template>
            </ScrollArea>
          </div>
        </template>
      </DropdownMenuContent>
    </DropdownMenu>

    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>New Deck</DialogTitle>
      </DialogHeader>

      <div class="space-y-4">
        <div class="grid gap-2">
          <Label for="name">Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="My New Deck"
            v-model="name"
          />
        </div>

        <div class="grid gap-2">
          <Label for="author">Author</Label>
          <Input id="author" type="text" placeholder="Me" v-model="author" />
        </div>

        <DialogFooter>
          <Button class="w-full" @click="createDeck">Create Deck</Button>
        </DialogFooter>
      </div>
    </DialogContent>
  </Dialog>
</template>
