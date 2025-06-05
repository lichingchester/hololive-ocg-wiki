export default defineNuxtPlugin(async (nuxtApp) => {
  // Get the card store
  const cardStore = useCardStore();

  // Load cards once at app startup with error handling
  try {
    await cardStore.loadCards();
    console.log("Cards data loaded successfully");
  } catch (error) {
    console.error("Failed to load cards data:", error);
  }

  // Make sure it's available to all components
  return {
    provide: {
      cardStore,
    },
  };
});
