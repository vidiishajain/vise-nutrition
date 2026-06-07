import { findProduct } from "../src/api/offSearch.js";
import { toEverydayPortion } from "../src/api/everydayServings.js";

function getNutrient(nutriments, servingKey, per100Key) {
  if (nutriments[servingKey] != null) {
    return { value: nutriments[servingKey], perServing: true };
  }
  if (nutriments[per100Key] != null) {
    return { value: nutriments[per100Key], perServing: false };
  }
  return { value: null, perServing: true };
}

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

export function formatProduct(product, userQuery = "") {
  const product_name = getProductName(product);
  if (!product_name) return { found: false };

  const nutriments = product.nutriments || {};
  const kcal = getNutrient(nutriments, "energy-kcal_serving", "energy-kcal_100g");
  const sugar = getNutrient(nutriments, "sugars_serving", "sugars_100g");
  const fat = getNutrient(nutriments, "fat_serving", "fat_100g");
  const satFat = getNutrient(
    nutriments,
    "saturated-fat_serving",
    "saturated-fat_100g"
  );
  const salt = getNutrient(nutriments, "salt_serving", "salt_100g");

  const per100g =
    !kcal.perServing ||
    !sugar.perServing ||
    !fat.perServing ||
    !satFat.perServing ||
    !salt.perServing;

  const base = {
    found: true,
    product_name,
    brand: getBrand(product),
    serving_size:
      product.serving_size || (per100g ? "per 100g" : "per serving"),
    kcal: kcal.value,
    sugar: sugar.value,
    fat: fat.value,
    sat_fat: satFat.value,
    salt: salt.value,
    nutrition_grade:
      product.nutrition_grades || product.nutriscore_grade || "",
    per100g,
  };

  const everyday = toEverydayPortion({ ...base, user_query: userQuery });

  return {
    ...base,
    portion_label: everyday.portion_label,
    portion_is_estimate: everyday.portion_is_estimate,
    everyday_kcal: everyday.kcal,
    everyday_sugar: everyday.sugar,
    everyday_fat: everyday.fat,
    everyday_sat_fat: everyday.sat_fat,
    everyday_salt: everyday.salt,
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { query } = req.body;
  if (!query?.trim()) {
    return res.status(400).json({ error: "Query required" });
  }

  try {
    const product = await findProduct(query.trim());
    if (!product) return res.status(200).json({ found: false });
    return res.status(200).json(formatProduct(product, query.trim()));
  } catch {
    return res.status(500).json({ error: "Search failed" });
  }
}
