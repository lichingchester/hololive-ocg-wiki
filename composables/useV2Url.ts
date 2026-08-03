/**
 * Resolves the v2 equivalent of the page the user is currently on.
 *
 * v2's URLs match v1's exactly, so most routes carry over by preserving the path verbatim:
 * someone on a shared deck link (`/[locale]/deck/[code]`) lands on the *same deck* on v2,
 * because both sites decode the code identically. Home and `/status` map the same way.
 *
 * The exception is a route that only exists on v1 (currently just `/how-to-use`). It has no
 * v2 page, so preserving the path would drop the user on a 404 the moment we tell them
 * "here's the new site" — the worst possible first impression. Those fall back to the
 * localized v2 home instead. v1 is frozen, so this deny-list can't grow: preserving by
 * default is safe.
 *
 * `route.path` is kept as-is (encoded, no query string), matching the canonical link in
 * `app.vue` — the deck code lives in the path, so nothing meaningful is lost by dropping the
 * query.
 */
const V2_ORIGIN = "https://hololive-ocg-wiki.tskrlabs.com";

// First path segment (after the locale prefix) of routes that exist on v1 but not v2.
const V1_ONLY_SEGMENTS = ["how-to-use"];

export function useV2Url() {
  const route = useRoute();
  const { locale } = useI18n();

  return computed(() => {
    // Strategy is "prefix", so every path starts with `/<locale>`. Strip it to inspect the
    // route below it.
    const afterLocale = route.path.replace(/^\/[^/]+/, "");
    const firstSegment = afterLocale.split("/").filter(Boolean)[0];

    if (firstSegment && V1_ONLY_SEGMENTS.includes(firstSegment)) {
      return `${V2_ORIGIN}/${locale.value}`;
    }

    return `${V2_ORIGIN}${route.path}`;
  });
}
