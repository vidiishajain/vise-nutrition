import { useState } from "react";
import ChatWindow from "./components/ChatWindow";
import InputBar from "./components/InputBar";
import { searchProduct } from "./api/openFoodFacts";
import { analyseProduct } from "./api/claude";
import { isFollowUp, askFollowUp } from "./api/followUp";

const WELCOME_MESSAGE = {
  id: "welcome",
  direction: "inbound",
  text: "Hi! Type any food or drink name and I'll break down what's actually in it. Try for example *Cherry Coca Cola*, *Tomato Lays Chips*, or *Towergate Chocolate Digestives*, etc.",
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
    <div className="flex flex-col h-screen bg-[#111B21]">
      <div className="flex flex-col h-full max-w-[430px] mx-auto w-full">
        <header className="flex items-center px-4 h-14 bg-[#202C33] border-b border-[#2A3942] shrink-0">
          <span className="text-[#E9EDEF] font-semibold text-base">
            🥗 NutriLens
          </span>
        </header>
        <ChatWindow messages={messages} isLoading={isLoading} />
        <InputBar onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}
