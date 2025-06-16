import type { FilterOptions } from "~/types/filter";

export const useFilter = () => {
  const filterState = useState(
    "filter",
    (): FilterOptions => ({
      search: "",
      name: "",
      tag: "",
      set: "",
      colors: {
        white: false,
        green: false,
        red: false,
        blue: false,
        purple: false,
        yellow: false,
        blue_red: false,
        white_green: false,
        null: false,
      },
      cardTypes: {
        buzzCharacter: false,
        character: false,
        oshiCharacter: false,
        supportCheer: false,
        supportEvent: false,
        supportEventLimited: false,
        supportFan: false,
        supportTool: false,
        supportItem: false,
        supportItemLimited: false,
        supportMascot: false,
        supportStaffLimited: false,
      },
      rarity: {
        C: false,
        OC: false,
        OSR: false,
        OUR: false,
        P: false,
        R: false,
        RR: false,
        S: false,
        SEC: false,
        SR: false,
        SY: false,
        U: false,
        UR: false,
      },
      bloomLevel: {
        debut: false,
        first: false,
        second: false,
        spot: false,
      },
    })
  );

  const reset = () => {
    filterState.value = {
      search: "",
      name: "",
      tag: "",
      set: "",
      colors: {
        white: false,
        green: false,
        red: false,
        blue: false,
        purple: false,
        yellow: false,
        blue_red: false,
        white_green: false,
        null: false,
      },
      cardTypes: {
        buzzCharacter: false,
        character: false,
        oshiCharacter: false,
        supportCheer: false,
        supportEvent: false,
        supportEventLimited: false,
        supportFan: false,
        supportTool: false,
        supportItem: false,
        supportItemLimited: false,
        supportMascot: false,
        supportStaffLimited: false,
      },
      rarity: {
        C: false,
        OC: false,
        OSR: false,
        OUR: false,
        P: false,
        R: false,
        RR: false,
        S: false,
        SEC: false,
        SR: false,
        SY: false,
        U: false,
        UR: false,
      },
      bloomLevel: {
        debut: false,
        first: false,
        second: false,
        spot: false,
      },
    };
  };

  const resetName = () => {
    filterState.value.name = "";
  };
  const resetTag = () => {
    filterState.value.tag = "";
  };
  const resetSet = () => {
    filterState.value.set = "";
  };
  const resetColors = () => {
    Object.keys(filterState.value.colors).forEach((key) => {
      filterState.value.colors[key as keyof typeof filterState.value.colors] =
        false;
    });
  };
  const resetCardTypes = () => {
    Object.keys(filterState.value.cardTypes).forEach((key) => {
      filterState.value.cardTypes[
        key as keyof typeof filterState.value.cardTypes
      ] = false;
    });
  };
  const resetRarity = () => {
    Object.keys(filterState.value.rarity).forEach((key) => {
      filterState.value.rarity[key as keyof typeof filterState.value.rarity] =
        false;
    });
  };
  const resetBloomLevel = () => {
    Object.keys(filterState.value.bloomLevel).forEach((key) => {
      filterState.value.bloomLevel[
        key as keyof typeof filterState.value.bloomLevel
      ] = false;
    });
  };

  const isFiltered = () => {
    const filter = filterState.value;

    // Check if search fields have values
    if (
      filter.search.trim() !== "" ||
      filter.name.trim() !== "" ||
      filter.tag.trim() !== ""
    ) {
      return true;
    }

    // Check if any color filters are active
    if (Object.values(filter.colors).some((value) => value === true)) {
      return true;
    }

    // Check if any card type filters are active
    if (Object.values(filter.cardTypes).some((value) => value === true)) {
      return true;
    }

    // Check if any rarity filters are active
    if (Object.values(filter.rarity).some((value) => value === true)) {
      return true;
    }

    // Check if any bloom level filters are active
    if (Object.values(filter.bloomLevel).some((value) => value === true)) {
      return true;
    }

    return false;
  };

  return {
    filter: filterState,
    reset,
    resetName,
    resetTag,
    resetSet,
    resetColors,
    resetCardTypes,
    resetRarity,
    resetBloomLevel,
    isFiltered,
  };
};
