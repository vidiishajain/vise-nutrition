import Anthropic from "@anthropic-ai/sdk";
import { generateLocalAnalysis } from "../src/api/localAnalysis.js";

const DAILY = { kcal: 2000, sugar: 30, salt: 6, sat_fat: 20, fat: 70, protein: 50, fiber: 30 };

function toKitchenValue(grams, type) {
  if (grams == null) return null;
  switch (type) {
    case "kcal":
      return `${Math.round(grams)} kcal`;
    case "sugar": {
      const t = grams / 4;
      if (t < 0.3) return "almost none";
      if (t < 0.75) return "½ teaspoon";
      if (t < 1.25) return "1 teaspoon";
      if (t < 1.75) return "1½ teaspoons";
      return `${Math.round(t * 2) / 2} teaspoons`;
    }
    case "salt": {
      const t = grams / 6;
      if (t < 0.08) return "a trace";
      if (t < 0.2) return "⅛ teaspoon";
      if (t < 0.4) return "¼ teaspoon";
      if (t < 0.65) return "½ teaspoon";
      if (t < 0.9) return "¾ teaspoon";
      if (t < 1.25) return "1 teaspoon";
      return `${+(t.toFixed(1))} teaspoons`;
    }
    case "sat_fat": {
      const t = grams / 5;
      if (t < 0.25) return "a trace";
      if (t < 0.75) return "½ tsp of butter";
      if (t < 1.25) return "1 tsp of butter";
      if (t < 1.75) return "1½ tsp of butter";
      return `${Math.round(t)} tsp of butter`;
    }
    case "protein":
    case "fiber":
      return `${Math.round(grams * 10) / 10}g`;
    default:
      return `${Math.round(grams * 10) / 10}g`;
  }
}

function calcPercent(value, daily) {
  if (value == null || !daily) return null;
  return Math.min(100, Math.round((value / daily) * 100));
}

function levelFor(percent, isPositive) {
  if (percent == null) return "moderate";
  if (isPositive) {
    if (percent >= 20) return "high";
    if (percent >= 8) return "moderate";
    return "low";
  }
  if (percent <= 15) return "low";
  if (percent <= 30) return "moderate";
  return "high";
}

function buildKeyStats(everyday) {
  const { kcal, sugar, salt, sat_fat, protein, fiber } = everyday;
  const stats = [];

  if (kcal != null) {
    const pct = calcPercent(kcal, DAILY.kcal);
    stats.push({ label: "Calories", value: toKitchenValue(kcal, "kcal"), grams: Math.round(kcal), percent: pct, level: levelFor(pct, false), isPositive: false });
  }
  if (sugar != null) {
    const pct = calcPercent(sugar, DAILY.sugar);
    stats.push({ label: "Sugar", value: toKitchenValue(sugar, "sugar"), grams: Math.round(sugar * 10) / 10, percent: pct, level: levelFor(pct, false), isPositive: false });
  }
  if (salt != null) {
    const pct = calcPercent(salt, DAILY.salt);
    stats.push({ label: "Salt", value: toKitchenValue(salt, "salt"), grams: Math.round(salt * 100) / 100, percent: pct, level: levelFor(pct, false), isPositive: false });
  }
  if (sat_fat != null) {
    const pct = calcPercent(sat_fat, DAILY.sat_fat);
    stats.push({ label: "Saturated Fat", value: toKitchenValue(sat_fat, "sat_fat"), grams: Math.round(sat_fat * 10) / 10, percent: pct, level: levelFor(pct, false), isPositive: false });
  }
  if (protein != null) {
    const pct = calcPercent(protein, DAILY.protein);
    stats.push({ label: "Protein", value: toKitchenValue(protein, "protein"), grams: Math.round(protein * 10) / 10, percent: pct, level: levelFor(pct, true), isPositive: true });
  }
  if (fiber != null) {
    const pct = calcPercent(fiber, DAILY.fiber);
    stats.push({ label: "Fiber", value: toKitchenValue(fiber, "fiber"), grams: Math.round(fiber * 10) / 10, percent: pct, level: levelFor(pct, true), isPositive: true });
  }

  return stats;
}

const SYSTEM_PROMPT = `You are NutriLens — a sharp, warm nutritionist friend who tells it straight without being preachy.

Your job is to write natural language for pre-calculated nutritional data. All numbers, values, and percentages are computed from the actual product database. You must NOT recalculate, invent, or change any of the provided figures.

You receive a JSON payload with:
- product_name, brand, user_query, portion_label, nova_group, ingredients_text, allergens, additives
- key_stats_data: array of { label, value, grams, percent, level, isPositive } — all pre-computed

Return a JSON object with exactly these fields:

1. traffic_light: "green", "amber", or "red"
   Base on the overall picture. Red = one or more stats at "high" level. Amber = moderate concerns. Green = broadly fine.

2. verdict_label: 2–4 warm words that name the type of eating experience this is. Think of it as the headline a friend would text you.
   Examples: "Weekly indulgence", "Great daily staple", "Occasional treat", "Protein champion", "Mindful pleasure", "Smart snack pick", "Sneaky sugar bomb", "Surprisingly solid pick".
   Match the overall picture — don't be overly positive for a red food or overly cautious for a green one.

3. key_stats: one object per entry in key_stats_data, same order, each with:
   - label: copy exactly
   - value: copy exactly — do NOT change
   - percent: copy exactly — do NOT change
   - level: copy exactly — do NOT change
   - isPositive: copy exactly — do NOT change
   - analogy: 4 words max. A concrete, instantly visual comparison for someone with no nutrition knowledge.
     Examples: "≈ 3 sugar cubes", "like a small banana", "barely a pinch", "almost nothing", "2 digestive biscuits worth".
     Must match the actual grams. No jargon. No sentences — just the comparison phrase.

4. insight: exactly 1 sentence. Hit the single most surprising or important thing about this product in plain English — no jargon, no percentages. Use a vivid everyday analogy (e.g. "that's the sugar of five sugar cubes", "more salt than a bag of crisps"). One concrete fact, zero filler.

5. verdict: one punchy sentence. The headline — memorable, honest, specific to this product. Name it. Food critic energy, not health warning energy.

6. best_context: one sentence. Exactly when or how this fits into a real week. Specific — not "in moderation".

7. processing_note: one short sentence on nova_group if provided. Omit entirely if nova_group is null.

Rules:
- Every claim must trace to a stat in key_stats_data. No invented facts.
- No "you should", "you must", "avoid", or "however".
- Short, direct sentences. Cut every word that doesn't earn its place.
- Return only valid JSON. No markdown, no preamble.`;

function parseJsonResponse(text) {
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  return JSON.parse(cleaned);
}

export async function analyseNutrition(productData, apiKey) {
  const { toEverydayPortion } = await import("../src/api/everydayServings.js");
  const everyday = toEverydayPortion(productData);
  const keyStatsData = buildKeyStats(everyday);

  const payload = {
    user_query: productData.user_query,
    product_name: productData.product_name,
    brand: productData.brand,
    portion_label: everyday.portion_label,
    portion_is_estimate: everyday.portion_is_estimate,
    nova_group: productData.nova_group ?? null,
    nutrition_grade: productData.nutrition_grade,
    ingredients_text: productData.ingredients_text || null,
    allergens: productData.allergens || [],
    additives: productData.additives || [],
    key_stats_data: keyStatsData,
  };

  const client = new Anthropic({ apiKey });
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: JSON.stringify(payload) }],
  });

  const text = message.content[0]?.text?.trim() ?? "";
  try {
    const result = parseJsonResponse(text);
    result.portion_label = everyday.portion_label;
    result.portion_is_estimate = everyday.portion_is_estimate;
    return result;
  } catch {
    return generateLocalAnalysis(productData);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  try {
    const result = apiKey
      ? await analyseNutrition(req.body, apiKey)
      : generateLocalAnalysis(req.body);
    return res.status(200).json(result);
  } catch {
    return res.status(200).json(generateLocalAnalysis(req.body));
  }
}
