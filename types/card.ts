export type CardTypeCodeType =
  | "buzzCharacter"
  | "character"
  | "oshiCharacter"
  | "supportCheer"
  | "supportEvent"
  | "supportEventLimited"
  | "supportFan"
  | "supportItem"
  | "supportLocation"
  | "supportTool";

export type ColorCodeType =
  | "blue"
  | "green"
  | "purple"
  | "red"
  | "white"
  | "yellow"
  | "unknown"; // TODO: this is a temporary placeholder for blue_red color (ID: 614)

export type RarityCodeType =
  | "C"
  | "OC"
  | "OSR"
  | "OUR"
  | "P"
  | "R"
  | "RR"
  | "S"
  | "SEC"
  | "SR"
  | "SY"
  | "U"
  | "UR";

export type TimingCodeType = "once_per_game" | "once_per_turn";

export type BloomLevelCodeType = "debut" | "first" | "second";

export type ArtsItem = {
  costCount?: number;
  costTypes?: string[];
  damage?: number;
  isPlus?: boolean;
  specialTargets?: string[];
  specialValues?: number[];
};

export type Card = {
  name: string;
  arts?: ArtsItem[];
  batonTouchCount?: number;
  bloomLevelCode?: BloomLevelCodeType;
  cardNumber: string;
  cardTypeCode: CardTypeCodeType;
  colorCode: ColorCodeType;
  hp?: number;
  id: string;
  imagePath: string;
  imageUrl: string;
  keyword?: Keyword;
  life?: number;
  oshiSkill?: OshiSkill;
  rarityCode: RarityCodeType;
  spOshiSkill?: SpOshiSkill;
  tags: string[];
  translations: Translations;
  set: string;
};

export type Keyword = {
  type?: string;
  typeCode?: string;
};

export type OshiSkill = {
  cost?: number;
  timingCode?: TimingCodeType;
};

export type SpOshiSkill = {
  cost?: number;
  timingCode?: TimingCodeType;
};

export type Translations = {
  ja?: Translation;
  tc?: Translation;
};

export type Translation = {
  abilityText?: string;
  cardType?: string;
  color?: string;
  illustrator?: string;
  name?: string;
  rarity?: string;
  set?: string;
};

export type CardCollection = Card[];
