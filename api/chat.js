const SYSTEM_PROMPT = `You are NutriLens, a plain-English food nutrition assistant in a chat app.
The user previously looked up a product and received a nutritional breakdown.
Answer their follow-up question briefly in plain English — one or two short sentences.
Be direct and honest. No markdown, no bullet points.`;

export function answerFollowUpLocally(question, context) {
  const brand = context.brand ? ` (${context.brand})` : "";
  const base = `That card was for your search "${context.searchQuery}" — matched in the database as "${context.product_name}"${brand}.`;

  const lower = question.toLowerCase();
  if (
    lower.includes("is this") ||
    lower.includes("for oatly") ||
    lower.includes("correct") ||
    lower.includes("right product")
  ) {
    const brandMatch =
      context.brand &&
      lower.includes(context.brand.toLowerCase().split(",")[0].trim());
    const queryMatch = lower.includes(context.searchQuery.toLowerCase().split(" ")[0]);
    if (brandMatch || queryMatch) {
      return `Yes — ${base}`;
    }
    return base;
  }

  return base;
}

export async function answerFollowUp(question, context, apiKey) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://nutrilens.app",
      "X-Title": "NutriLens",
    },
    body: JSON.stringify({
      model: "anthropic/claude-sonnet-4",
      max_tokens: 256,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: JSON.stringify({ question, product: context }),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error("OpenRouter API request failed");
  }

  const data = await response.json();
  return { reply: data.choices?.[0]?.message?.content?.trim() ?? "" };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { question, context } = req.body;
  const apiKey = process.env.OPENROUTER_API_KEY;

  try {
    const result = apiKey
      ? await answerFollowUp(question, context, apiKey)
      : { reply: answerFollowUpLocally(question, context) };
    return res.status(200).json(result);
  } catch {
    return res.status(200).json({
      reply: answerFollowUpLocally(question, context),
    });
  }
}
