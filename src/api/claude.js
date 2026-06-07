const API_BASE = import.meta.env.VITE_API_URL || ''

export async function analyseProduct(productData) {
  const res = await fetch(`${API_BASE}/api/analyse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(productData),
  });

  if (!res.ok) {
    throw new Error("Analysis request failed");
  }

  return res.json();
}
