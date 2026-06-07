import { generateLocalAnalysis } from "../src/api/localAnalysis.js";

const SYSTEM_PROMPT = `You are NutriLens — a warm, witty nutritionist friend explaining food labels like you're chatting over coffee.
You receive structured nutritional data for a product, including user_query (what the user searched) and product_name (the database match).

You receive everyday_portion data with values already scaled to a real-world portion (e.g. "1 cup (~240ml)", "1 can (~330ml)", "1 bar (~50g)") — NOT per 100g.

Return a JSON object with four fields:
- traffic_light: "green", "amber", or "red"
- key_stats: array of up to 4 objects with "label", "value", "context", and "percent".
  Include Calories, Sugar, Salt, and Saturated Fat where data exists.

  value — use everyday kitchen measurements, not grams:
    Sugar: 1 teaspoon = 4g → e.g. "5 teaspoons of sugar", "just 1 sugar cube" (for ~4g)
    Salt: 1 teaspoon = 6g (that's the ENTIRE daily limit) → e.g. "½ teaspoon of salt", "a small pinch"
    Saturated Fat: think butter — 1 heaped teaspoon ≈ 5g → e.g. "1½ teaspoons of butter's worth"
    Calories: keep as kcal, add a relatable food reference in context (e.g. "like eating 3 digestive biscuits")

  context — one warm, plain-English sentence comparing to the daily limit or a relatable frame. No jargon.
  percent — integer 0–100: what % of the daily recommended intake this portion represents.
    Daily limits: Calories 2000 kcal · Sugar 30g · Salt 6g · Fat 70g · Saturated Fat 20g

- insight: 1–2 sentences. The honest scoop the label won't tell you. Gently humorous is fine, never flippant.
- verdict: one friendly sentence. A steer from a mate, not a lecture. No "you must" or "you should never".

Tone: warm, witty, slightly playful. Like a fun nutritionist, not a clinic handout.
Be honest and specific. Never preachy. Never moralise.
Return only valid JSON. No markdown, no preamble.`;

function parseJsonResponse(text) {
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  return JSON.parse(cleaned);
}

export async function analyseNutrition(productData, apiKey) {
  const { toEverydayPortion } = await import("../src/api/everydayServings.js");
  const everyday = toEverydayPortion(productData);
  const payload = {
    ...productData,
    everyday_portion: {
      label: everyday.portion_label,
      is_estimate: everyday.portion_is_estimate,
      kcal: everyday.kcal,
      sugar: everyday.sugar,
      fat: everyday.fat,
      sat_fat: everyday.sat_fat,
      salt: everyday.salt,
    },
    daily_guide: everyday.daily_guide,
  };

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
      max_tokens: 1024,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: JSON.stringify(payload) },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error("OpenRouter API request failed");
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content?.trim() ?? "";
  try {
    return parseJsonResponse(text);
  } catch {
    return generateLocalAnalysis(productData);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;

  try {
    const result = apiKey
      ? await analyseNutrition(req.body, apiKey)
      : generateLocalAnalysis(req.body);
    return res.status(200).json(result);
  } catch {
    return res.status(200).json(generateLocalAnalysis(req.body));
  }
}
