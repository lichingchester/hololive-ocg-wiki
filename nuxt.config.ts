// https://nuxt.com/docs/api/configuration/nuxt-config

import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: false },

  ssr: false,

  site: {
    url: "https://hololive-ocg-wiki.lichingchester.dev",
    name: "Hololive OCG Wiki",
    description:
      "A fan-made wiki for Hololive OCG, featuring card information, deck builder, and more.",
    defaultLocale: "tc",
  },

  seo: {
    fallbackTitle: false,
  },

  sitemap: {
    autoLastmod: true,
  },

  // Runtime configuration for API endpoints
  runtimeConfig: {
    public: {
      appUrl:
        process.env.NUXT_PUBLIC_APP_URL ||
        (process.env.NODE_ENV === "production"
          ? "https://hololive-ocg-wiki.lichingchester.dev"
          : "http://localhost:3000"), // Local development URL
      infoUrl:
        process.env.NUXT_PUBLIC_INFO_URL ||
        "https://raw.githubusercontent.com/lichingchester/hololive-ocg-wiki/refs/heads/main/public/info.json",
    },
  },

  app: {
    head: {
      title: "Hololive OCG Wiki",
      titleTemplate: "%s | Hololive OCG Wiki",
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { charset: "utf-8" },
        { name: "format-detection", content: "telephone=no" },
        { name: "application-name", content: "Hololive OCG Wiki" },
        { name: "apple-mobile-web-app-title", content: "Hololive OCG Wiki" },
        { name: "apple-mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-status-bar-style", content: "default" },
        { name: "mobile-web-app-capable", content: "yes" },
      ],
      link: [
        {
          rel: "icon",
          type: "image/x-icon",
          href: "/favicon.ico",
        },
        {
          rel: "manifest",
          href: "/manifest.json",
        },
        {
          rel: "canonical",
          href:
            process.env.NUXT_PUBLIC_APP_URL ||
            (process.env.NODE_ENV === "production"
              ? "https://hololive-ocg-wiki.lichingchester.dev"
              : "http://localhost:3000"), // Local development URL
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
    enabled: true,
    defaults: {
      width: 230,
      height: 224,
      extension: "png",
    },
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
      { code: "th", name: "ภaษาไทย", file: "th.json" },
      { code: "es", name: "Español", file: "es.json" },
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
