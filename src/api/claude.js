export async function analyseProduct(productData) {
  const res = await fetch("/api/analyse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(productData),
  });

  if (!res.ok) {
    throw new Error("Analysis request failed");
  }

  return res.json();
}
