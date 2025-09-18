// https://nuxt.com/docs/api/configuration/nuxt-config

import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },

  ssr: false,

  site: {
    url: "https://hololive-ocg-wiki.lichingchester.dev",
  },

  seo: {
    fallbackTitle: false,
  },

  app: {
    head: {
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { charset: "utf-8" },
      ],
      link: [
        {
          rel: "icon",
          type: "image/x-icon",
          href: "/favicon.ico",
        },
      ],
    },
  },

  css: ["~/assets/css/app.css"],

  components: [
    {
      path: "~/components",
      pathPrefix: false,
    },
  ],

  modules: [
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxt/scripts",
    "@nuxt/test-utils",
    "@nuxtjs/i18n",
    "shadcn-nuxt",
    "@nuxtjs/color-mode",
    "@vueuse/nuxt",
    "nuxt-gtag",
    "@nuxtjs/seo",
  ],

  ogImage: {
    enabled: false,
  },

  gtag: {
    id: "GTM-MZHVHBGQ",
  },

  colorMode: {
    preference: "system",
    classSuffix: "",
  },

  i18n: {
    baseUrl: "https://hololive-ocg-wiki.lichingchester.dev",
    locales: [
      { code: "tc", name: "繁體中文", file: "tc.json" },
      { code: "ja", name: "日本語", file: "ja.json" },
      { code: "en", name: "English", file: "en.json" },
      { code: "id", name: "Bahasa Indonesia", file: "id.json" },
      { code: "ko", name: "한국어", file: "ko.json" },
      { code: "th", name: "ภาษาไทย", file: "th.json" },
    ],
    defaultLocale: "tc",
    strategy: "prefix",
  },

  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: "",

    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: "./components/ui",
  },

  eslint: {
    // options here
  },

  vite: {
    plugins: [tailwindcss()],
  },

  nitro: {
    preset: "github-pages",
  },
});
