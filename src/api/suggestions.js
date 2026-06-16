const API_BASE = import.meta.env.VITE_API_URL || "";

export async function fetchSuggestions(query) {
  if (!query.trim()) return [];
  try {
    const res = await fetch(`${API_BASE}/api/suggestions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}
