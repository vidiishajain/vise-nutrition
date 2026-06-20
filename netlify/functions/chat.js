import { answerFollowUp, answerFollowUpLocally } from "../../api/chat.js";

export default async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { question, context } = await req.json();
  const apiKey = process.env.ANTHROPIC_API_KEY;

  try {
    const result = apiKey
      ? await answerFollowUp(question, context, apiKey)
      : { reply: answerFollowUpLocally(question, context) };
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(
      JSON.stringify({ reply: answerFollowUpLocally(question, context) }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const config = { path: "/api/chat" };
