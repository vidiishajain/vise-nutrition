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

function hasNutrition(product) {
  const n = product.nutriments || {};
  return (
    n["energy-kcal_100g"] != null ||
    n["energy-kcal_serving"] != null ||
    n["energy_100g"] != null
  );
}

// Generate search variants: full query, then without trailing words one at a time.
// Cap at 3 variants so we don't drown candidates with noise from short generic terms.
function queryVariants(query) {
  const trimmed = query.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);
  const variants = [trimmed];

  for (let len = words.length - 1; len >= Math.max(1, words.length - 2); len--) {
    const v = words.slice(0, len).join(" ");
    if (v !== trimmed) variants.push(v);
  }

  return [...new Set(variants)];
}

function rankProducts(products, query) {
  const terms = query.toLowerCase().split(/\s+/).filter((w) => w.length > 1);

  return [...products]
    .map((product) => {
      const name = getProductName(product).toLowerCase();
      const brand = getBrand(product).toLowerCase();
      const combined = `${name} ${brand}`;

      let score = 0;
      let matched = 0;

      for (const term of terms) {
        if (combined.includes(term)) {
          score += 1;
          matched++;
        }
      }

      // Bonus when all query terms are present — this is the most specific match
      if (terms.length > 0 && matched === terms.length) score += 3;

      // Bonus for having nutrition data — prefer products we can actually analyse
      if (hasNutrition(product)) score += 2;

      // Slight preference for longer, more specific product names
      if (name.length > 10) score += 0.5;

      if (!name) score -= 10;

      return { product, score };
    })
    .sort((a, b) => b.score - a.score);
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
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
  try {
    const hits = await searchModern(query);
    if (hits.length > 0) return hits;
  } catch {
    // fall through to legacy
  }
  try {
    return await searchLegacy(query);
  } catch {
    return [];
  }
}

async function fetchProductByCode(code) {
  const url = `${PRODUCT_URL}/${code}?fields=product_name,product_name_en,generic_name,brands,nutriments,serving_size,nutrition_grades,nutriscore_grade,nova_group,ingredients_text,allergens_tags,additives_tags,image_front_url,labels_tags`;
  const data = await fetchJson(url);
  return data.product;
}

export async function findProductByCode(code) {
  try {
    const product = await fetchProductByCode(code);
    if (!product) return null;
    return { ...product, code };
  } catch {
    return null;
  }
}

export async function findProduct(query) {
  const seen = new Set();
  const candidates = [];

  for (const variant of queryVariants(query)) {
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

  // Walk the top candidates. Fetch full data for each; return the first one
  // that has nutritional data. Fall back to the best-named match if none do.
  const topCandidates = ranked
    .filter((r) => getProductName(r.product))
    .slice(0, 5);

  if (topCandidates.length === 0) return null;

  let bestFallback = null;

  for (const { product } of topCandidates) {
    if (!product.code) continue;

    let full = product;
    try {
      const fetched = await fetchProductByCode(product.code);
      if (fetched) full = { ...product, ...fetched, code: product.code };
    } catch {
      // use search hit as-is
    }

    if (!bestFallback && getProductName(full)) bestFallback = full;
    if (hasNutrition(full)) return full;
  }

  // Nothing had nutrition data — return the best-named result anyway
  return bestFallback;
}
