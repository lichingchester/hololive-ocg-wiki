import type { Deck, DeckCollection } from "~/types/deck";

// Comprehensive deck management with localStorage
export const useDecks = () => {
  const decksState = useState<Deck[]>("decks", () => []);
  const currentDeckState = useState<Deck | null>("currentDeck", () => null);
  const isEditingState = useState<boolean>("isEditing", () => false);
  const localStorageKey = "hololive-ocg-wiki-decks";

  // Load decks from localStorage on init
  onMounted(() => {
    try {
      const storedDecks = localStorage.getItem(localStorageKey);
      if (storedDecks) {
        decksState.value = JSON.parse(storedDecks);
      }
    } catch (error) {
      console.error("Failed to load decks from localStorage:", error);
    }
  });

  // Save decks to localStorage
  const saveDecks = () => {
    try {
      localStorage.setItem(localStorageKey, JSON.stringify(decksState.value));
    } catch (error) {
      console.error("Failed to save decks to localStorage:", error);
    }
  };

  // Add a new deck
  const addDeck = (deck: Deck) => {
    decksState.value.push(deck);
    saveDecks();
    return deck;
  };

  // Update an existing deck
  const updateDeck = (deckIndex: number, updates: Partial<Deck>) => {
    if (deckIndex !== -1) {
      decksState.value[deckIndex] = {
        ...decksState.value[deckIndex],
        ...updates,
      };
      saveDecks();
      return decksState.value[deckIndex];
    }
    return null;
  };

  // Delete a deck
  const deleteDeck = (deckIndex: number) => {
    if (deckIndex >= 0 && deckIndex < decksState.value.length) {
      decksState.value.splice(deckIndex, 1);
    }
    saveDecks();
  };

  // Set current deck
  const setCurrentDeck = (deck: Deck | null) => {
    currentDeckState.value = deck;
  };

  const toggleEditing = () => {
    isEditingState.value = !isEditingState.value;
    console.log("Editing mode:", isEditingState.value);
  };

  return {
    decks: decksState,
    currentDeck: currentDeckState,
    isEditing: isEditingState,
    toggleEditing,
    addDeck,
    updateDeck,
    deleteDeck,
    setCurrentDeck,
    saveDecks,
  };
};
