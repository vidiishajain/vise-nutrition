import { useState } from "react";
import ChatWindow from "./components/ChatWindow";
import InputBar from "./components/InputBar";
import { searchProduct } from "./api/openFoodFacts";
import { analyseProduct } from "./api/claude";
import { isFollowUp, askFollowUp } from "./api/followUp";

const WELCOME_PROMPTS = [
  "Hey! Think of me as the friend who reads food labels so you don't have to 🕵️ What are we investigating today? Try *Cherry Coke*, *Pringles*, or *Oat Milk*.",
  "Hi there! I speak fluent food label — so you don't have to 🥗 Drop a name and I'll tell you what's *actually* in it. Try *Nutella*, *Red Bull*, or *Greek Yoghurt*.",
  "Hello! Ready to see behind the marketing? 🔍 Type any food or drink and I'll give you the honest, friendly rundown. Try *Innocent Smoothie*, *Oreos*, or *Almond Milk*.",
  "Hey! Healthy eating shouldn't feel like a maths exam 🧮 Ask me about anything edible and I'll make the numbers make sense. Try *Granola Bar*, *Gatorade*, or *Dark Chocolate*.",
  "Hi! I'm your pocket nutritionist 🌿 No lectures, just the good stuff. Try *Lays Classic*, *Coca Cola Zero*, or *Müller Corner*.",
  "Hello! Life's too short for confusing labels 🙃 Tell me what you're eating and I'll tell you what's worth knowing. Try *Kinder Bueno*, *Tropicana OJ*, or *Peanut Butter*.",
];

const WELCOME_MESSAGE = {
  id: "welcome",
  direction: "inbound",
  text: WELCOME_PROMPTS[Math.floor(Math.random() * WELCOME_PROMPTS.length)],
  timestamp: new Date(),
};

const NOT_FOUND_MESSAGE =
  "I couldn't find that one. Try being more specific — for example, *Lays Classic Salted* instead of just *Lays*.";

const ERROR_MESSAGE = "Something went wrong on my end. Try again?";

function createId() {
  return crypto.randomUUID();
}

export default function App() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastProduct, setLastProduct] = useState(null);

  const handleFollowUp = async (query) => {
    try {
      const { reply } = await askFollowUp(query, lastProduct);
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          direction: "inbound",
          text: reply,
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          direction: "inbound",
          text: ERROR_MESSAGE,
          timestamp: new Date(),
        },
      ]);
    }
  };

  const handleProductSearch = async (query) => {
    try {
      const product = await searchProduct(query);

      if (!product.found) {
        setMessages((prev) => [
          ...prev,
          {
            id: createId(),
            direction: "inbound",
            text: NOT_FOUND_MESSAGE,
            timestamp: new Date(),
          },
        ]);
        return;
      }

      const analysis = await analyseProduct({
        user_query: query,
        product_name: product.product_name,
        brand: product.brand,
        serving_size: product.serving_size,
        per100g: product.per100g,
        kcal: product.kcal,
        sugar: product.sugar,
        fat: product.fat,
        sat_fat: product.sat_fat,
        salt: product.salt,
        nutrition_grade: product.nutrition_grade,
      });

      const context = {
        searchQuery: query,
        product_name: product.product_name,
        brand: product.brand,
        serving_size: product.serving_size,
        traffic_light: analysis.traffic_light,
        insight: analysis.insight,
        verdict: analysis.verdict,
      };
      setLastProduct(context);

      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          direction: "inbound",
          nutriCard: {
            searchQuery: query,
            productName: product.product_name,
            brand: product.brand,
            trafficLight: analysis.traffic_light,
            keyStats: analysis.key_stats,
            insight: analysis.insight,
            verdict: analysis.verdict,
            portionLabel: analysis.portion_label || product.portion_label,
            portionIsEstimate:
              analysis.portion_is_estimate ?? product.portion_is_estimate,
          },
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          direction: "inbound",
          text: ERROR_MESSAGE,
          timestamp: new Date(),
        },
      ]);
    }
  };

  const handleSubmit = async (query) => {
    setMessages((prev) => [
      ...prev,
      {
        id: createId(),
        direction: "outbound",
        text: query,
        timestamp: new Date(),
      },
    ]);
    setIsLoading(true);

    try {
      if (isFollowUp(query, lastProduct)) {
        await handleFollowUp(query);
      } else {
        await handleProductSearch(query);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen gradient-bg">
      <div className="flex flex-col h-full max-w-2xl mx-auto w-full">
        <header className="flex items-center px-5 h-14 shrink-0">
          <span className="text-white/90 font-semibold text-base tracking-wide">
            🥗 NutriLens
          </span>
        </header>
        <ChatWindow messages={messages} isLoading={isLoading} />
        <InputBar onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}
