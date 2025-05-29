import type { Card } from "./card";

export type Deck = {
  // 1
  oshiCard: Card | null;

  // 50
  mainCards: Card[];

  // 20
  yellCards: Card[];

  name?: string;
  author?: string;
};

export type DeckCollection = Deck[];
