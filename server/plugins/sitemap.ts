import { LOCALES } from "~/constants/app";

export default defineEventHandler(async (event) => {
  const routes = ["/", "/deck"];
  // You can add more routes here as needed

  const baseUrl = "https://lichingchester.github.io";
  const appBaseUrl = "hololive-ocg-wiki";

  // Sitemap content
  let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;

  // Add default route
  for (const route of routes) {
    sitemapContent += `  <url>
    <loc>${baseUrl}/${appBaseUrl}${route}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
`;

    // Add alternate language links
    for (const locale of LOCALES) {
      sitemapContent += `    <xhtml:link 
      rel="alternate" 
      hreflang="${
        locale === "en"
          ? "en"
          : locale === "tc"
          ? "zh-Hant"
          : locale === "ja"
          ? "ja"
          : locale === "id"
          ? "id"
          : locale === "ko"
          ? "ko"
          : "th"
      }" 
      href="${baseUrl}/${appBaseUrl}/${locale}${route}"
    />
`;
    }

    sitemapContent += `  </url>
`;
  }

  // Add localized routes
  for (const locale of LOCALES) {
    for (const route of routes) {
      sitemapContent += `  <url>
    <loc>${baseUrl}/${appBaseUrl}/${locale}${route}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
`;

      // Add alternate language links
      for (const altLocale of LOCALES) {
        sitemapContent += `    <xhtml:link 
      rel="alternate" 
      hreflang="${
        altLocale === "en"
          ? "en"
          : altLocale === "tc"
          ? "zh-Hant"
          : altLocale === "ja"
          ? "ja"
          : altLocale === "id"
          ? "id"
          : altLocale === "ko"
          ? "ko"
          : "th"
      }" 
      href="${baseUrl}/${appBaseUrl}/${altLocale}${route}"
    />
`;
      }

      sitemapContent += `  </url>
`;
    }
  }

  sitemapContent += `</urlset>`;

  // Write to file during build process
  if (process.env.NODE_ENV === "production") {
    const { writeFileSync, mkdirSync, existsSync } = await import("fs");
    const { join } = await import("path");

    const publicDir = join(process.cwd(), "public");
    if (!existsSync(publicDir)) {
      mkdirSync(publicDir, { recursive: true });
    }

    writeFileSync(join(publicDir, "sitemap.xml"), sitemapContent);
    console.log("✅ Sitemap generated successfully");
  }
});
