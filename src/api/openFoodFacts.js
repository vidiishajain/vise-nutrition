const API_BASE = import.meta.env.VITE_API_URL || ''

export async function searchProduct(query) {
  const res = await fetch(`${API_BASE}/api/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error("Product search failed");
  return res.json();
}

export async function fetchByCode(code) {
  const res = await fetch(`${API_BASE}/api/product`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) throw new Error("Product fetch failed");
  return res.json();
}
