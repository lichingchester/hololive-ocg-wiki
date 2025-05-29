import type { Card } from "./card";

export type Deck = {
  // 1
  oshiCards: Card[];

  // 50
  mainCards: Card[];

  // 20
  yellCards: Card[];

  id: string;
  name?: string;
  author?: string;
};

export type DeckCollection = Deck[];
