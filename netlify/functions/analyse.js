import { analyseNutrition } from "../../api/analyse.js";
import { generateLocalAnalysis } from "../../src/api/localAnalysis.js";

export default async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await req.json();
  const apiKey = process.env.ANTHROPIC_API_KEY;

  try {
    const result = apiKey
      ? await analyseNutrition(body, apiKey)
      : generateLocalAnalysis(body);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify(generateLocalAnalysis(body)), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config = { path: "/api/analyse" };
