<script setup lang="ts">
const { t, locale } = useI18n();

// SEO Meta tags for the main page
useSeoMeta({
  title: t("Card List"),
  description: t("nuxtSiteConfig.description"),
  keywords:
    "Hololive, OCG, Official Card Game, trading cards, card database, deck builder, VTuber, virtual YouTuber, card search, game wiki",
  author: "Hololive OCG Wiki Contributors",
  robots: "index, follow",
  ogTitle: t("Card List"),
  ogDescription: t("nuxtSiteConfig.description"),
  ogType: "website",
  ogUrl: "https://hololive-ocg-wiki.lichingchester.dev",
  ogImage: "https://hololive-ocg-wiki.lichingchester.dev/icon.png",
  ogSiteName: t("Card List"),
  twitterCard: "summary_large_image",
  twitterTitle: t("Card List"),
  twitterDescription: t("nuxtSiteConfig.description"),
  twitterImage: "https://hololive-ocg-wiki.lichingchester.dev/icon.png",
});

useHead({
  bodyAttrs: {
    class: "overflow-hidden",
  },
  htmlAttrs: {
    lang: locale.value,
  },
});
</script>

<template>
  <AppHeader>
    <!-- filter -->
    <FilterAPI />

    <!-- search -->
    <SearchInputAPI />
  </AppHeader>

  <!-- Card List -->
  <div class="grow">
    <CardListViewAPI />
  </div>

  <FloatingDeck />

  <AppFooter>
    <AppFooterCurrentDeck />
    <div class="ml-auto flex items-center gap-2">
      <AppFooterOptionsButton />
      <AppFooterDeckButton />
    </div>
  </AppFooter>
</template>
