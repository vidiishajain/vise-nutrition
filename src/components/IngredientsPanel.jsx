import { useState } from "react";

const NOVA_LABELS = {
  1: { label: "Minimally processed", color: "bg-green-500", desc: "Real food, barely touched." },
  2: { label: "Processed ingredients", color: "bg-lime-500", desc: "Refined oils, flours, sugars — used in cooking." },
  3: { label: "Processed food", color: "bg-amber-500", desc: "Has added salt, sugar, oil, or preservatives." },
  4: { label: "Ultra-processed", color: "bg-red-500", desc: "Heavily industrially formulated product." },
};

function NovaBar({ nova }) {
  if (!nova || !NOVA_LABELS[nova]) return null;
  const config = NOVA_LABELS[nova];
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500">Processing level (NOVA {nova})</span>
        <span
          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full text-white ${config.color}`}
        >
          {config.label}
        </span>
      </div>
      <div className="flex gap-1 mb-1.5">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className={`h-2 flex-1 rounded-full transition-all ${
              n <= nova ? config.color : "bg-gray-100"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-400">{config.desc}</p>
    </div>
  );
}

export default function IngredientsPanel({ novaGroup, allergens, additives, ingredientsText }) {
  const [showIngredients, setShowIngredients] = useState(false);

  const hasContent =
    novaGroup || allergens?.length || additives?.length || ingredientsText;

  if (!hasContent) return null;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
        Ingredients &amp; Processing
      </h2>

      <div className="space-y-5">
        <NovaBar nova={novaGroup} />

        {allergens?.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Allergens</p>
            <div className="flex flex-wrap gap-1.5">
              {allergens.map((a) => (
                <span
                  key={a}
                  className="px-2.5 py-1 bg-red-50 text-red-700 text-xs rounded-full font-medium capitalize"
                >
                  {a.replace(/-/g, " ")}
                </span>
              ))}
            </div>
          </div>
        )}

        {additives?.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">
              Additives ({additives.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {additives.slice(0, 8).map((a) => (
                <span
                  key={a}
                  className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs rounded-full font-medium uppercase"
                >
                  {a}
                </span>
              ))}
              {additives.length > 8 && (
                <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                  +{additives.length - 8} more
                </span>
              )}
            </div>
          </div>
        )}

        {ingredientsText && (
          <div>
            <button
              onClick={() => setShowIngredients(!showIngredients)}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors"
            >
              <span>{showIngredients ? "▾" : "▸"}</span>
              Full ingredients list
            </button>
            {showIngredients && (
              <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                {ingredientsText}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
