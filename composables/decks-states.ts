import type { Deck } from "~/types/deck";
import {
  CARD_TYPE_OSHI,
  CARD_TYPE_MAIN,
  CARD_TYPE_YELL,
} from "~/constants/card-data";
import CardDataJson from "@/data/cards_i18n.json";
import { APP_VERSION } from "~/constants/app";
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

  // Make new deck
  const createNewDeck = (name: string, author: string): Deck => {
    const newDeck: Deck = {
      id: `${name}-${useTimestamp({ offset: 0 }).value.toString()}`,
      name,
      author,
      oshiCardIds: [],
      mainCardIds: [],
      yellCardIds: [],
      version: APP_VERSION, // Set initial version
    };

    return newDeck;
  };

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
    console.log(
      `Deck with ID ${deckId} deleted. currentDeckState.value:`,
      currentDeckState.value
    );
  };

  // Set current deck
  const setCurrentDeck = (deck: Deck | null) => {
    currentDeckState.value = deck;
  };

  const toggleEditing = () => {
    isEditingState.value = !isEditingState.value;
  };

  // Add a card to the current deck
  const addCardToDeck = (cardId: string) => {
    const cardTypeCode = CardDataJson.find(
      (c) => c.id === cardId
    )?.cardTypeCode;

    if (cardTypeCode && currentDeckState.value) {
      if (CARD_TYPE_OSHI.includes(cardTypeCode)) {
        currentDeckState.value.oshiCardIds.push(cardId);
      }

      if (CARD_TYPE_MAIN.includes(cardTypeCode)) {
        currentDeckState.value.mainCardIds.push(cardId);
      }

      if (CARD_TYPE_YELL.includes(cardTypeCode)) {
        currentDeckState.value.yellCardIds.push(cardId);
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
  const removeCardFromDeck = (cardId: string) => {
    const cardTypeCode = CardDataJson.find(
      (c) => c.id === cardId
    )?.cardTypeCode;

    if (cardTypeCode && currentDeckState.value) {
      // Find which array the card belongs to based on its type
      if (CARD_TYPE_OSHI.includes(cardTypeCode)) {
        const cardIndex = currentDeckState.value.oshiCardIds.findIndex(
          (c) => c === cardId
        );
        if (cardIndex !== -1) {
          currentDeckState.value.oshiCardIds.splice(cardIndex, 1);
        }
      } else if (CARD_TYPE_MAIN.includes(cardTypeCode)) {
        const cardIndex = currentDeckState.value.mainCardIds.findIndex(
          (c) => c === cardId
        );
        if (cardIndex !== -1) {
          currentDeckState.value.mainCardIds.splice(cardIndex, 1);
        }
      } else if (CARD_TYPE_YELL.includes(cardTypeCode)) {
        const cardIndex = currentDeckState.value.yellCardIds.findIndex(
          (c) => c === cardId
        );
        if (cardIndex !== -1) {
          currentDeckState.value.yellCardIds.splice(cardIndex, 1);
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

  const getCardCount = (cardId: string) => {
    const cardTypeCode = CardDataJson.find(
      (c) => c.id === cardId
    )?.cardTypeCode;

    if (!currentDeckState.value) return 0;

    if (cardTypeCode) {
      if (CARD_TYPE_OSHI.includes(cardTypeCode)) {
        return currentDeckState.value.oshiCardIds.filter((c) => c === cardId)
          .length;
      } else if (CARD_TYPE_MAIN.includes(cardTypeCode)) {
        return currentDeckState.value.mainCardIds.filter((c) => c === cardId)
          .length;
      } else if (CARD_TYPE_YELL.includes(cardTypeCode)) {
        return currentDeckState.value.yellCardIds.filter((c) => c === cardId)
          .length;
      }
    }

    return 0;
  };

  // Get the deck code for sharing
  const getDeckCode = (
    deckId: string
  ): { code: string; localePath: string; fullUrl: string } => {
    const deck = decksState.value.find((d) => d.id === deckId);
    if (!deck) return { code: "", localePath: "", fullUrl: "" };

    // Create a compressed version of the deck
    const compressedDeck = {
      id: deck.id,
      name: deck.name,
      // Convert arrays of duplicate IDs to map of {id: count}
      oshiCards: compressCardIds(deck.oshiCardIds),
      mainCards: compressCardIds(deck.mainCardIds),
      yellCards: compressCardIds(deck.yellCardIds),
    };

    // Encode the compressed deck data as base64
    const encodedDeck = btoa(
      encodeURIComponent(JSON.stringify(compressedDeck))
    );

    // Create the URL with the encoded deck data
    const localePath = useLocalePath();
    const baseUrl = window.location.origin;

    const path = localePath({
      name: "deck-code",
      params: { code: encodedDeck },
    });

    const fullUrl = `${baseUrl}${path}`;

    return {
      code: encodedDeck,
      localePath: path,
      fullUrl: fullUrl,
    };
  };

  // Helper function to compress arrays of card IDs into {id: count} format
  const compressCardIds = (cardIds: string[]): Record<string, number> => {
    return cardIds.reduce((acc, id) => {
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  // Helper function to expand compressed cards format back to arrays
  const expandCompressedCards = (
    compressed: Record<string, number>
  ): string[] => {
    const expanded: string[] = [];
    Object.entries(compressed).forEach(([id, count]) => {
      for (let i = 0; i < count; i++) {
        expanded.push(id);
      }
    });
    return expanded;
  };

  // Import decks from JSON
  const importDecks = (jsonData: string): boolean => {
    try {
      const importedDecks = JSON.parse(jsonData) as Deck[];

      // Validate that the imported data is an array of decks
      if (!Array.isArray(importedDecks)) {
        console.error("Invalid deck data format");
        return false;
      }

      // Replace existing decks with imported ones
      decksState.value = importedDecks;
      saveDecks();
      return true;
    } catch (error) {
      console.error("Failed to import decks:", error);
      return false;
    }
  };

  // Import deck by code
  const importDeckByCode = (
    code: string
  ): { status: boolean; message: string } => {
    try {
      const decodedDeck = checkForDeckCode(code);

      if (!decodedDeck) {
        return { status: false, message: "Invalid deck code" };
      }

      // Check if a deck with this ID already exists
      const existingDeckIndex = decksState.value.findIndex(
        (d) => d.id === decodedDeck.id
      );

      if (existingDeckIndex !== -1) {
        // Update existing deck
        decksState.value[existingDeckIndex] = decodedDeck;

        saveDecks();
        return { status: true, message: "Deck updated successfully" };
      } else {
        // Add as a new deck
        decksState.value.push(decodedDeck);

        saveDecks();
        return { status: true, message: "Deck imported successfully" };
      }
    } catch (error) {
      return { status: false, message: "Failed to import deck from code" };
    }
  };

  // Check for shared deck code
  const checkForDeckCode = (code: string): Deck | false => {
    try {
      // Decode the base64 encoded deck
      const compressedDeck = JSON.parse(decodeURIComponent(atob(code)));

      // Convert compressed format back to full deck
      const decodedDeck: Deck = {
        id: compressedDeck.id,
        name: compressedDeck.name,
        author: compressedDeck.author,
        oshiCardIds: expandCompressedCards(compressedDeck.oshiCards),
        mainCardIds: expandCompressedCards(compressedDeck.mainCards),
        yellCardIds: expandCompressedCards(compressedDeck.yellCards),
        version: compressedDeck.version,
      };

      return decodedDeck;
    } catch (error) {
      return false;
    }
  };

  // Export all decks as JSON
  const exportDecks = (): string => {
    return JSON.stringify(decksState.value);
  };

  // Initialize - check for shared deck
  // onMounted(() => {
  //   checkForDeckCode();
  // });

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

    createNewDeck,

    // Add new functions to the returned object
    getDeckCode,
    exportDecks,
    importDecks,
    checkForDeckCode,
    importDeckByCode,
  };
};
