const SEARCH_URL = "https://search.openfoodfacts.org/search";
const PRODUCT_URL = "https://world.openfoodfacts.org/api/v2/product";
const LEGACY_SEARCH_URL = "https://world.openfoodfacts.org/cgi/search.pl";
const USER_AGENT = "NutriLens/1.0 (https://nutrilens.app)";

function getProductName(product) {
  return (
    product.product_name ||
    product.product_name_en ||
    product.generic_name ||
    ""
  ).trim();
}

function getBrand(product) {
  const raw = product.brands;
  if (Array.isArray(raw)) return raw[0]?.trim() || "";
  return raw?.split(",")[0]?.trim() || "";
}

function queryVariants(query) {
  const trimmed = query.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);
  const variants = [trimmed];

  for (let len = words.length - 1; len >= 1; len--) {
    variants.push(words.slice(0, len).join(" "));
  }

  return [...new Set(variants)];
}

function rankProducts(products, query) {
  const terms = query.toLowerCase().split(/\s+/).filter((w) => w.length > 1);

  return [...products]
    .map((product) => {
      const name = getProductName(product).toLowerCase();
      const brand = getBrand(product).toLowerCase();
      const text = `${name} ${brand}`;
      let score = 0;

      for (const term of terms) {
        if (text.includes(term)) score += 1;
      }

      if (!name) score -= 10;

      return { product, score };
    })
    .sort((a, b) => b.score - a.score);
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!res.ok) throw new Error(`OFF request failed: ${res.status}`);
  return res.json();
}

async function searchModern(query) {
  const url = `${SEARCH_URL}?q=${encodeURIComponent(query)}&page_size=20`;
  const data = await fetchJson(url);
  return data.hits || [];
}

async function searchLegacy(query) {
  const url = `${LEGACY_SEARCH_URL}?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20`;
  const data = await fetchJson(url);
  return data.products || [];
}

async function searchAllSources(query) {
  const results = [];

  try {
    results.push(...(await searchModern(query)));
  } catch {
    // try legacy
  }

  if (results.length === 0) {
    try {
      results.push(...(await searchLegacy(query)));
    } catch {
      // no results from this variant
    }
  }

  return results;
}

async function fetchProductByCode(code) {
  const url = `${PRODUCT_URL}/${code}?fields=product_name,product_name_en,generic_name,brands,nutriments,serving_size,nutrition_grades,nutriscore_grade`;
  const data = await fetchJson(url);
  return data.product;
}

export async function findProduct(query) {
  const seen = new Set();
  const candidates = [];

  for (const variant of queryVariants(query).slice(0, 5)) {
    const hits = await searchAllSources(variant);

    for (const hit of hits) {
      const code = hit.code;
      if (!code || seen.has(code)) continue;
      seen.add(code);
      candidates.push(hit);
    }
  }

  if (candidates.length === 0) return null;

  const ranked = rankProducts(candidates, query);
  const match = ranked.find((r) => r.score > 0 && getProductName(r.product))?.product
    ?? ranked.find((r) => getProductName(r.product))?.product;

  if (!match) return null;

  if (match.code) {
    try {
      const full = await fetchProductByCode(match.code);
      if (full) return { ...match, ...full, code: match.code };
    } catch {
      // use search hit
    }
  }

  return match;
}
