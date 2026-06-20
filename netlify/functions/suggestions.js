export default async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify([]), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { query } = await req.json();
  if (!query?.trim()) {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const url =
      `https://search.openfoodfacts.org/search?q=${encodeURIComponent(query.trim())}` +
      `&page_size=6&fields=product_name,brands,image_front_small_url,image_front_thumb_url,image_front_url,code`;
    const res = await fetch(url);
    if (!res.ok) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    const data = await res.json();
    const results = (data.hits || [])
      .filter((h) => h.product_name?.trim())
      .slice(0, 5)
      .map((h) => ({
        name: h.product_name.trim(),
        brand: Array.isArray(h.brands)
          ? h.brands[0]?.trim() || ""
          : (h.brands || "").split(",")[0].trim(),
        image:
          h.image_front_small_url ||
          h.image_front_thumb_url ||
          h.image_front_url ||
          "",
        code: h.code || "",
      }));

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config = { path: "/api/suggestions" };
