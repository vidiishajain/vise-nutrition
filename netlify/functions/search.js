import { findProduct } from "../../src/api/offSearch.js";
import { formatProduct } from "../../api/search.js";

export default async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { query } = await req.json();
  if (!query?.trim()) {
    return new Response(JSON.stringify({ found: false }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const product = await findProduct(query.trim());
    const result = product ? formatProduct(product, query.trim()) : { found: false };
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ found: false }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config = { path: "/api/search" };
