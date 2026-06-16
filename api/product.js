import { formatProduct } from "./search.js";

const PRODUCT_URL = "https://world.openfoodfacts.org/api/v2/product";
const USER_AGENT = "NutriLens/1.0 (https://nutrilens.app)";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { code } = req.body;
  if (!code?.trim()) return res.status(400).json({ error: "Barcode required" });

  try {
    const url = `${PRODUCT_URL}/${code}?fields=product_name,product_name_en,generic_name,brands,nutriments,serving_size,nutrition_grades,nutriscore_grade,nova_group,ingredients_text,allergens_tags,additives_tags,image_front_url,labels_tags`;
    const r = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (!r.ok) return res.status(404).json({ found: false });
    const data = await r.json();
    if (!data.product) return res.status(200).json({ found: false });
    return res.status(200).json(formatProduct({ ...data.product, code }, ""));
  } catch {
    return res.status(500).json({ error: "Fetch failed" });
  }
}
