import type { FilterOptions } from "~/types/filter";

export const useFilter = () => {
  // Applied filters (what actually affects the results)
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

  // Draft filters (what user is editing in the UI before applying)
  const draftFilterState = useState(
    "draftFilter",
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

  // Initialize draft filters with current applied filters
  const initializeDraftFilters = () => {
    draftFilterState.value = JSON.parse(JSON.stringify(filterState.value));
  };

  // Apply draft filters to actual filters (this triggers filtering)
  const applyFilters = async () => {
    // Use nextTick to ensure DOM updates don't block the UI
    await nextTick();
    filterState.value = JSON.parse(JSON.stringify(draftFilterState.value));
  };

  // Reset both applied and draft filters
  const reset = () => {
    const defaultFilters = {
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

    filterState.value = JSON.parse(JSON.stringify(defaultFilters));
    draftFilterState.value = JSON.parse(JSON.stringify(defaultFilters));
  };

  // Reset only draft filters (cancel changes)
  const resetDraft = () => {
    initializeDraftFilters();
  };

  // Reset all draft filters to default values (without affecting applied filters)
  const resetDraftAll = () => {
    const defaultFilters = {
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

    draftFilterState.value = JSON.parse(JSON.stringify(defaultFilters));
  };

  // Check if draft has changes compared to applied filters
  const hasPendingChanges = computed(() => {
    return (
      JSON.stringify(draftFilterState.value) !==
      JSON.stringify(filterState.value)
    );
  });

  // Reset individual draft filter fields
  const resetDraftName = () => {
    draftFilterState.value.name = "";
  };
  const resetDraftTag = () => {
    draftFilterState.value.tag = "";
  };
  const resetDraftSet = () => {
    draftFilterState.value.set = "";
  };
  const resetDraftColors = () => {
    Object.keys(draftFilterState.value.colors).forEach((key) => {
      draftFilterState.value.colors[
        key as keyof typeof draftFilterState.value.colors
      ] = false;
    });
  };
  const resetDraftCardTypes = () => {
    Object.keys(draftFilterState.value.cardTypes).forEach((key) => {
      draftFilterState.value.cardTypes[
        key as keyof typeof draftFilterState.value.cardTypes
      ] = false;
    });
  };
  const resetDraftRarity = () => {
    Object.keys(draftFilterState.value.rarity).forEach((key) => {
      draftFilterState.value.rarity[
        key as keyof typeof draftFilterState.value.rarity
      ] = false;
    });
  };
  const resetDraftBloomLevel = () => {
    Object.keys(draftFilterState.value.bloomLevel).forEach((key) => {
      draftFilterState.value.bloomLevel[
        key as keyof typeof draftFilterState.value.bloomLevel
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
    // Applied filters (read-only in components)
    filter: filterState,

    // Draft filters (editable in components)
    draftFilter: draftFilterState,

    // Actions
    applyFilters,
    reset,
    resetDraft,
    resetDraftAll,
    initializeDraftFilters,

    // Draft field resets
    resetDraftName,
    resetDraftTag,
    resetDraftSet,
    resetDraftColors,
    resetDraftCardTypes,
    resetDraftRarity,
    resetDraftBloomLevel,

    // State checks
    isFiltered,
    hasPendingChanges,

    // Legacy aliases for backward compatibility (now operate on applied filters)
    resetName: () => {
      filterState.value.name = "";
      draftFilterState.value.name = "";
    },
    resetTag: () => {
      filterState.value.tag = "";
      draftFilterState.value.tag = "";
    },
    resetSet: () => {
      filterState.value.set = "";
      draftFilterState.value.set = "";
    },
    resetColors: () => {
      Object.keys(filterState.value.colors).forEach((key) => {
        filterState.value.colors[key as keyof typeof filterState.value.colors] =
          false;
        draftFilterState.value.colors[
          key as keyof typeof draftFilterState.value.colors
        ] = false;
      });
    },
    resetCardTypes: () => {
      Object.keys(filterState.value.cardTypes).forEach((key) => {
        filterState.value.cardTypes[
          key as keyof typeof filterState.value.cardTypes
        ] = false;
        draftFilterState.value.cardTypes[
          key as keyof typeof draftFilterState.value.cardTypes
        ] = false;
      });
    },
    resetRarity: () => {
      Object.keys(filterState.value.rarity).forEach((key) => {
        filterState.value.rarity[key as keyof typeof filterState.value.rarity] =
          false;
        draftFilterState.value.rarity[
          key as keyof typeof draftFilterState.value.rarity
        ] = false;
      });
    },
    resetBloomLevel: () => {
      Object.keys(filterState.value.bloomLevel).forEach((key) => {
        filterState.value.bloomLevel[
          key as keyof typeof filterState.value.bloomLevel
        ] = false;
        draftFilterState.value.bloomLevel[
          key as keyof typeof draftFilterState.value.bloomLevel
        ] = false;
      });
    },
  };
};
