import type { Card } from "~/types/card";
import type { Deck, DeckCollection } from "~/types/deck";
import {
  CARD_TYPE_OSHI,
  CARD_TYPE_MAIN,
  CARD_TYPE_YELL,
} from "~/constants/card-data";
import { useTimestamp } from "@vueuse/core";

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
    const id = useTimestamp({ offset: 0 });
    deck.id = `${deck.name}-${id.value.toString()}`; // Ensure the deck has a unique ID
    deck.oshiCards = [];
    deck.mainCards = [];
    deck.yellCards = [];

    decksState.value.push(deck);
    saveDecks();
    return deck;
  };

  // Update an existing deck
  const updateDeck = (deckId: string, updates: Partial<Deck>) => {
    const deckIndex = decksState.value.findIndex((deck) => deck.id === deckId);
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
  const deleteDeck = (deckId: string) => {
    const deckIndex = decksState.value.findIndex((deck) => deck.id === deckId);
    if (deckIndex !== -1) {
      decksState.value.splice(deckIndex, 1);
    }
    saveDecks();

    setCurrentDeck(null); // Clear current deck if deleted
  };

  // Set current deck
  const setCurrentDeck = (deck: Deck | null) => {
    currentDeckState.value = deck;
  };

  const toggleEditing = () => {
    isEditingState.value = !isEditingState.value;
  };

  // Add a card to the current deck
  const addCardToDeck = (card: Card) => {
    if (currentDeckState.value) {
      //       CARD_TYPE_OSHI
      // CARD_TYPE_MAIN
      // CARD_TYPE_YELL
      if (CARD_TYPE_OSHI.includes(card.cardTypeCode)) {
        currentDeckState.value.oshiCards.push(card);
      }

      if (CARD_TYPE_MAIN.includes(card.cardTypeCode)) {
        currentDeckState.value.mainCards.push(card);
      }

      if (CARD_TYPE_YELL.includes(card.cardTypeCode)) {
        currentDeckState.value.yellCards.push(card);
      }

      // Update the deck in the main decks array
      if (currentDeckState.value.id) {
        updateDeck(currentDeckState.value.id, {
          ...currentDeckState.value,
        });
      }
    }
  };

  // Remove a card from the current deck
  const removeCardFromDeck = (card: Card) => {
    if (currentDeckState.value) {
      // Find which array the card belongs to based on its type
      if (CARD_TYPE_OSHI.includes(card.cardTypeCode)) {
        const cardIndex = currentDeckState.value.oshiCards.findIndex(
          (c) => c.id === card.id
        );
        if (cardIndex !== -1) {
          currentDeckState.value.oshiCards.splice(cardIndex, 1);
        }
      } else if (CARD_TYPE_MAIN.includes(card.cardTypeCode)) {
        const cardIndex = currentDeckState.value.mainCards.findIndex(
          (c) => c.id === card.id
        );
        if (cardIndex !== -1) {
          currentDeckState.value.mainCards.splice(cardIndex, 1);
        }
      } else if (CARD_TYPE_YELL.includes(card.cardTypeCode)) {
        const cardIndex = currentDeckState.value.yellCards.findIndex(
          (c) => c.id === card.id
        );
        if (cardIndex !== -1) {
          currentDeckState.value.yellCards.splice(cardIndex, 1);
        }
      }

      // Update the deck in the main decks array
      if (currentDeckState.value.id) {
        updateDeck(currentDeckState.value.id, {
          ...currentDeckState.value,
        });
      }
    }
  };

  const getCardCount = (card: Card) => {
    if (!currentDeckState.value) return 0;

    if (CARD_TYPE_OSHI.includes(card.cardTypeCode)) {
      return currentDeckState.value.oshiCards.filter((c) => c.id === card.id)
        .length;
    } else if (CARD_TYPE_MAIN.includes(card.cardTypeCode)) {
      return currentDeckState.value.mainCards.filter((c) => c.id === card.id)
        .length;
    } else if (CARD_TYPE_YELL.includes(card.cardTypeCode)) {
      return currentDeckState.value.yellCards.filter((c) => c.id === card.id)
        .length;
    }
    return 0;
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
    addCardToDeck,
    removeCardFromDeck,
    getCardCount,
  };
};
