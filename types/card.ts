export type Locales = "ja" | "tc" | "en" | "id" | "ko" | "th";

export type CardTypeCodeType =
  | "buzzCharacter"
  | "character"
  | "oshiCharacter"
  | "supportCheer"
  | "supportEvent"
  | "supportEventLimited"
  | "supportFan"
  | "supportTool"
  | "supportItem"
  | "supportItemLimited"
  | "supportMascot"
  | "supportStaffLimited";

export type ColorCodeType =
  | "blue"
  | "green"
  | "purple"
  | "red"
  | "white"
  | "yellow"
  | "null"
  | "blue_red"
  | "white_green";

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

export type BloomLevelCodeType = "debut" | "first" | "second" | "spot";

export type ArtsItem = {
  costCount?: number;
  costTypes?: string[];
  damage?: number;
  isPlus?: boolean;
  specialTargets?: string[];
  specialValues?: number[];
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

export type QaItem = {
  title: string;
  question: string;
  answer: string;
  related_cards_html: string;
  related_card_numbers: string[];
};

// export type Translations = {
//   [L in Locales]?: Translation;
// };

// export type Translation = {
//   abilityText?: string;
//   cardType?: string;
//   color?: string;
//   illustrator?: string;
//   name?: string;
//   rarity?: string;
//   set?: string;
//   tags?: string[];
//   qa_items?: QaItem[];
// };

export type Card = {
  id: string;
  card_number: string;
  card_type_code: string;
  color_codes: string[]; // Always parsed array
  rarity_code: string;
  bloom_level_code?: string;
  image_path: string;
  image_url: string;
  hp?: number;
  life?: number;
  baton_touch_count?: number;
  baton_touch_types?: string[]; // Always parsed array
  illustrator?: string;
  card_sets?: string[]; // Always parsed array
  tags?: string[]; // Always parsed array
  // Translation fields (from the specified locale)
  name?: string;
  card_type?: string;
  color?: string;
  rarity?: string;
  set_name?: string;
  ability_text?: string;
  // Related data
  oshi_skill?: any;
  sp_oshi_skill?: any;
  arts?: any[];
  keyword?: any;
  qaItems?: any[];
  extra?: string;
  qa_items?: QaItem[];
};

export type CardCollection = Card[];
