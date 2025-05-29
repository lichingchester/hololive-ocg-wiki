<script setup lang="ts">
import { PackagePlus } from "lucide-vue-next";
import type { Deck, DeckCollection } from "@/types/deck";
import { toast } from "vue-sonner";

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
    name: name.value,
    author: author.value,
  };

  decks.addDeck(newDeck);

  // Close the dialog
  isCreateDeckDialogOpen.value = false;

  // Reset fields after creation
  name.value = "";
  author.value = "";

  toast.success("Deck created successfully!");
};
</script>

<template>
  <Dialog v-model:open="isCreateDeckDialogOpen">
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button> Decks </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DialogTrigger as-child>
          <DropdownMenuItem @click="isCreateDeckDialogOpen = true">
            <PackagePlus /> New Deck
          </DropdownMenuItem>
        </DialogTrigger>

        <template v-if="decks.decks.value.length">
          <DropdownMenuSeparator />

          <ScrollArea class="max-h-20">
            <template v-for="(deck, index) in decks.decks.value" :key="index">
              <DropdownMenuItem @click="decks.setCurrentDeck(deck)">
                {{ deck.name }}
              </DropdownMenuItem>
            </template>
          </ScrollArea>
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
