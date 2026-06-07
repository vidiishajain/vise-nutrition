import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function apiRoute(path, handler) {
  return async (req, res, next) => {
    if (req.url !== path) {
      next();
      return;
    }
    if (req.method !== "POST") {
      res.statusCode = 405;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Method not allowed" }));
      return;
    }

    try {
      const body = await readBody(req);
      const payload = JSON.parse(body);
      const result = await handler(payload);
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(result));
    } catch {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Request failed" }));
    }
  };
}

function apiPlugin(env) {
  return {
    name: "api-plugin",
    configureServer(server) {
      server.middlewares.use(
        apiRoute("/api/analyse", async (productData) => {
          const { analyseNutrition } = await import("./api/analyse.js");
          const { generateLocalAnalysis } = await import(
            "./src/api/localAnalysis.js"
          );
          const apiKey = env.OPENROUTER_API_KEY;

          try {
            return apiKey
              ? await analyseNutrition(productData, apiKey)
              : generateLocalAnalysis(productData);
          } catch {
            return generateLocalAnalysis(productData);
          }
        })
      );

      server.middlewares.use(
        apiRoute("/api/search", async ({ query }) => {
          const { findProduct } = await import("./src/api/offSearch.js");
          const { formatProduct } = await import("./api/search.js");

          const product = await findProduct(query?.trim() || "");
          if (!product) return { found: false };
          return formatProduct(product, query?.trim() || "");
        })
      );

      server.middlewares.use(
        apiRoute("/api/chat", async ({ question, context }) => {
          const { answerFollowUp, answerFollowUpLocally } = await import(
            "./api/chat.js"
          );
          const apiKey = env.OPENROUTER_API_KEY;

          try {
            return apiKey
              ? await answerFollowUp(question, context, apiKey)
              : { reply: answerFollowUpLocally(question, context) };
          } catch {
            return { reply: answerFollowUpLocally(question, context) };
          }
        })
      );
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), apiPlugin(env)],
    server: {
      port: 3000,
      open: true,
    },
  };
});
