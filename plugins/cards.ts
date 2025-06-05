export default defineNuxtPlugin(async (nuxtApp) => {
  // Get the card store
  const cardStore = useCardStore();

  // Load cards once at app startup
  await cardStore.loadCards();

  // Make sure it's available to all components
  return {
    provide: {
      cardStore,
    },
  };
});
