const ICONS = {
  Calories: "🔥",
  Sugar: "🍬",
  Salt: "🧂",
  "Saturated Fat": "🧈",
  Protein: "🥩",
  Fiber: "🌾",
};

const LEVEL_STYLES = {
  warning: {
    low:      { card: "bg-green-50 border-green-100",  badge: "bg-green-100 text-green-700",  bar: "bg-green-500",  label: "Low"      },
    moderate: { card: "bg-amber-50 border-amber-100",  badge: "bg-amber-100 text-amber-700",  bar: "bg-amber-500",  label: "Moderate" },
    high:     { card: "bg-red-50 border-red-100",      badge: "bg-red-100 text-red-700",      bar: "bg-red-500",    label: "High"     },
  },
  positive: {
    low:      { card: "bg-gray-50 border-gray-100",    badge: "bg-gray-100 text-gray-500",    bar: "bg-gray-400",   label: "Low"      },
    moderate: { card: "bg-gray-50 border-gray-100",    badge: "bg-blue-100 text-blue-600",    bar: "bg-blue-400",   label: "Fair"     },
    high:     { card: "bg-green-50 border-green-100",  badge: "bg-green-100 text-green-700",  bar: "bg-green-500",  label: "Good"     },
  },
};

function NutriStatCard({ stat }) {
  const family = stat.isPositive ? "positive" : "warning";
  const styles = LEVEL_STYLES[family][stat.level] ?? LEVEL_STYLES[family].moderate;

  return (
    <div className={`rounded-2xl border p-4 flex flex-col gap-2 ${styles.card}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">
          {ICONS[stat.label] ?? ""} {stat.label}
        </span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${styles.badge}`}>
          {styles.label}
        </span>
      </div>

      <p className="text-2xl font-bold text-gray-900 leading-none">{stat.value}</p>

      {stat.percent != null && (
        <div>
          <div className="h-1.5 bg-black/8 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full bar-animate ${styles.bar}`}
              style={{ width: `${Math.min(stat.percent, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">{stat.percent}% of daily recommended</p>
        </div>
      )}

      {stat.analogy && (
        <p className="text-xs text-gray-500 font-medium">{stat.analogy}</p>
      )}
    </div>
  );
}

export default function NutritionPanel({ keyStats, portionLabel, portionIsEstimate }) {
  if (!keyStats?.length) return null;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Breakdown
        </h2>
        {portionLabel && (
          <p className="text-xs text-gray-400">
            Per <span className="font-medium text-gray-600">{portionLabel}</span>
            {portionIsEstimate && " (est.)"}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {keyStats.map((stat) => (
          <NutriStatCard key={stat.label} stat={stat} />
        ))}
      </div>
    </div>
  );
}
