export type FilterOptions = {
  search: string;
  name: string;
  tag: string;
  set: string;
  colors: {
    white: Boolean;
    green: Boolean;
    red: Boolean;
    blue: Boolean;
    purple: Boolean;
    yellow: Boolean;
    blue_red: Boolean;
    white_green: Boolean;
    null: Boolean;
  };
  cardTypes: {
    buzzCharacter: Boolean;
    character: Boolean;
    oshiCharacter: Boolean;
    supportCheer: Boolean;
    supportEvent: Boolean;
    supportEventLimited: Boolean;
    supportFan: Boolean;
    supportTool: Boolean;
    supportItem: Boolean;
    supportItemLimited: Boolean;
    supportMascot: Boolean;
    supportStaffLimited: Boolean;
  };
  rarity: {
    C: Boolean;
    OC: Boolean;
    OSR: Boolean;
    OUR: Boolean;
    P: Boolean;
    R: Boolean;
    RR: Boolean;
    S: Boolean;
    SEC: Boolean;
    SR: Boolean;
    SY: Boolean;
    U: Boolean;
    UR: Boolean;
  };
  bloomLevel: {
    debut: Boolean;
    first: Boolean;
    second: Boolean;
    spot: Boolean;
  };
};
