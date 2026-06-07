export function isFollowUp(query, hasContext) {
  if (!hasContext) return false;

  const q = query.trim();
  if (q.length < 3) return false;

  const lower = q.toLowerCase();
  if (q.includes("?")) return true;
  if (
    /^(is|are|was|were|does|do|did|can|could|would|what|why|how|who|tell|so|and)\b/i.test(
      lower
    )
  ) {
    return true;
  }
  if (/\b(this|that|it|the card|above|same|correct|right|for)\b/i.test(lower)) {
    return true;
  }

  return false;
}

export async function askFollowUp(question, context) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, context }),
  });

  if (!res.ok) {
    throw new Error("Follow-up request failed");
  }

  return res.json();
}
