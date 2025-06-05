import { APP_BASE_URL_NAME } from "~/constants/app";

export default defineNuxtPlugin(() => {
  useHead(() => {
    const { locale } = useI18n();
    const currentLocale = locale.value;

    // Define locale-specific content
    const localeDescriptions: Record<string, string> = {
      tc: "Hololive OCG 的粉絲製作維基，提供卡牌資訊、牌組構建等內容。",
      ja: "ホロライブOCGのファンメイドWiki、カード情報やデッキ構築などを提供。",
      en: "A fan-made wiki for Hololive OCG, featuring card information, deck building, and more.",
      id: "Wiki buatan penggemar untuk Hololive OCG, menampilkan informasi kartu, pembuatan dek, dan lainnya.",
      ko: "홀로라이브 OCG의 팬 제작 위키, 카드 정보, 덱 빌딩 등을 제공합니다.",
      th: "วิกิที่แฟนสร้างขึ้นสำหรับ Hololive OCG มีข้อมูลการ์ด การสร้างเด็ค และอื่นๆ",
    };

    const localeTitles: Record<string, string> = {
      tc: "Hololive OCG 維基 - 粉絲創建的卡牌資訊平台",
      ja: "ホロライブOCG Wiki - ファン作成のカード情報プラットフォーム",
      en: "Hololive OCG Wiki - Fan-Created Card Information Platform",
      id: "Hololive OCG Wiki - Platform Informasi Kartu Buatan Penggemar",
      ko: "홀로라이브 OCG 위키 - 팬이 만든 카드 정보 플랫폼",
      th: "Hololive OCG Wiki - แพลตฟอร์มข้อมูลการ์ดที่สร้างโดยแฟน",
    };

    // Current content based on locale
    const title = localeTitles[currentLocale] || localeTitles.en;
    const description =
      localeDescriptions[currentLocale] || localeDescriptions.en;

    // URLs
    const baseUrl = process.client
      ? window.location.origin
      : "https://lichingchester.github.io";
    const fullUrl = `${baseUrl}/${APP_BASE_URL_NAME}${useRoute().path}`;
    // const ogImageUrl = `${baseUrl}/${APP_BASE_URL_NAME}/images/og-image.jpg`;

    // OG Locale
    const ogLocale =
      currentLocale === "en"
        ? "en_US"
        : currentLocale === "tc"
        ? "zh_HK"
        : currentLocale === "ja"
        ? "ja_JP"
        : currentLocale === "id"
        ? "id_ID"
        : currentLocale === "ko"
        ? "ko_KR"
        : "th_TH";

    // Alternate languages for hreflang tags
    const hrefLangLinks = Object.keys(localeDescriptions).map((lang) => {
      const { localeProperties } = useI18n();
      const route = useRoute();
      const path = route.path;
      const basePath = path.replace(/^\/[^\/]+/, "");
      const localePath =
        lang === localeProperties.value.defaultLocale
          ? basePath
          : `/${lang}${basePath}`;

      return {
        rel: "alternate",
        hreflang:
          lang === "en"
            ? "en"
            : lang === "tc"
            ? "zh-Hant"
            : lang === "ja"
            ? "ja"
            : lang === "id"
            ? "id"
            : lang === "ko"
            ? "ko"
            : "th",
        href: `${baseUrl}/${APP_BASE_URL_NAME}${localePath}`,
      };
    });

    // JSON-LD structured data
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: title,
      description: description,
      url: fullUrl,
      inLanguage:
        currentLocale === "en"
          ? "en-US"
          : currentLocale === "tc"
          ? "zh-HK"
          : currentLocale === "ja"
          ? "ja-JP"
          : currentLocale === "id"
          ? "id-ID"
          : currentLocale === "ko"
          ? "ko-KR"
          : "th-TH",
      potentialAction: {
        "@type": "SearchAction",
        target: `${baseUrl}/${APP_BASE_URL_NAME}?search={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    };

    // Meta tags for alternate locales
    const ogLocaleAlternates = Object.keys(localeDescriptions).map((lang) => ({
      property: "og:locale:alternate",
      content:
        lang === "en"
          ? "en_US"
          : lang === "tc"
          ? "zh_HK"
          : lang === "ja"
          ? "ja_JP"
          : lang === "id"
          ? "id_ID"
          : lang === "ko"
          ? "ko_KR"
          : "th_TH",
    }));

    return {
      title: title,
      meta: [
        {
          name: "description",
          content: description,
        },
        // Open Graph tags
        {
          property: "og:title",
          content: title,
        },
        {
          property: "og:description",
          content: description,
        },
        {
          property: "og:type",
          content: "website",
        },
        // {
        //   property: "og:image",
        //   content: ogImageUrl,
        // },
        // {
        //   property: "og:image:width",
        //   content: "1200",
        // },
        // {
        //   property: "og:image:height",
        //   content: "630",
        // },
        {
          property: "og:locale",
          content: ogLocale,
        },
        // Add og:locale:alternate tags
        ...ogLocaleAlternates,
        // Twitter Card
        {
          name: "twitter:card",
          content: "summary_large_image",
        },
        {
          name: "twitter:title",
          content: title,
        },
        {
          name: "twitter:description",
          content: description,
        },
        // {
        //   name: "twitter:image",
        //   content: ogImageUrl,
        // },
      ],
      link: [
        // Canonical URL
        {
          rel: "canonical",
          href: fullUrl,
        },
        // Add all alternate language links
        ...hrefLangLinks,
      ],
      script: [
        {
          type: "application/ld+json",
          children: JSON.stringify(jsonLd),
        },
      ],
    };
  });
});
