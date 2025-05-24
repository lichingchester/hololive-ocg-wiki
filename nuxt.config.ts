// https://nuxt.com/docs/api/configuration/nuxt-config

import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },

  ssr: false,

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
  ],

  colorMode: {
    preference: "system",
    classSuffix: "",
  },

  i18n: {
    locales: [
      { code: "tc", name: "Traditional Chinese", file: "tc.json" },
      { code: "ja", name: "Japanese", file: "ja.json" },
      // { code: 'en', name: 'English', file: 'en.json' },
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
});
