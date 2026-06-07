const TRAFFIC_LIGHTS = {
  green: { emoji: "🟢", color: "#15803d", vibe: "Looking good" },
  amber: { emoji: "🟡", color: "#b45309", vibe: "Enjoy mindfully" },
  red:   { emoji: "🔴", color: "#dc2626", vibe: "Heads up" },
};

function barColor(pct) {
  if (pct <= 15) return "#15803d";
  if (pct <= 30) return "#b45309";
  return "#dc2626";
}

function shouldShowMatchNote(searchQuery, databaseName, brand) {
  if (!searchQuery || !databaseName) return false;
  const q = searchQuery.toLowerCase();
  const db = databaseName.toLowerCase();
  if (db.includes(q) || q.includes(db)) return false;
  if (brand && q.includes(brand.toLowerCase())) return true;
  return searchQuery.trim().toLowerCase() !== databaseName.trim().toLowerCase();
}

export default function NutriCard({
  searchQuery,
  productName,
  brand,
  trafficLight,
  keyStats,
  insight,
  verdict,
  portionLabel,
  portionIsEstimate,
}) {
  const light = TRAFFIC_LIGHTS[trafficLight] || TRAFFIC_LIGHTS.amber;
  const title = searchQuery || productName;
  const showMatch = shouldShowMatchNote(searchQuery, productName, brand);

  return (
    <div className="rounded-xl p-3">
      <div className="mb-3 pb-3 border-b border-zinc-900/10">
        <div className="flex items-start gap-2">
          <span className="text-lg leading-none mt-0.5">{light.emoji}</span>
          <div className="flex-1 min-w-0">
            <span className="text-zinc-900 text-[15px] font-semibold leading-tight block">
              {title}
            </span>
            <span
              className="text-xs font-semibold mt-1 inline-block"
              style={{ color: light.color }}
            >
              {light.vibe}
            </span>
          </div>
        </div>
        {showMatch && (
          <p className="text-zinc-400 text-xs mt-2 leading-snug pl-7">
            Found as{" "}
            <span className="text-zinc-600">{productName}</span>
            {brand ? ` · ${brand}` : ""}
          </p>
        )}
      </div>

      {portionLabel && (
        <p className="text-zinc-500 text-xs mb-3">
          Numbers shown for{" "}
          <span className="text-zinc-800 font-medium">{portionLabel.toLowerCase()}</span>
          {portionIsEstimate && " — a typical portion, since the label didn't say"}
        </p>
      )}

      {keyStats?.length > 0 && (
        <div className="mb-3">
          <p className="text-zinc-500 text-xs font-medium uppercase tracking-wide mb-2">
            The rundown
          </p>
          <div className="space-y-2">
            {keyStats.map((stat) => (
              <div
                key={stat.label}
                className="bg-zinc-900/8 rounded-lg px-2.5 py-2"
              >
                <div className="flex justify-between items-baseline gap-2">
                  <span className="text-zinc-500 text-xs">{stat.label}</span>
                  <span className="text-zinc-900 text-sm font-semibold shrink-0">
                    {stat.value}
                  </span>
                </div>
                {stat.percent != null && (
                  <div className="mt-1.5 h-1.5 rounded-full bg-zinc-200 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(stat.percent, 100)}%`,
                        backgroundColor: barColor(stat.percent),
                      }}
                    />
                  </div>
                )}
                <p className="text-zinc-500 text-xs mt-1 leading-relaxed">
                  {stat.context}
                  {stat.percent != null && (
                    <span className="ml-1 font-medium" style={{ color: barColor(stat.percent) }}>
                      {stat.percent}% of daily
                    </span>
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-3 pb-3 border-b border-zinc-900/10">
        <p className="text-zinc-500 text-xs font-medium mb-1.5">Here's the thing…</p>
        <p className="text-zinc-900 text-sm leading-relaxed">{insight}</p>
      </div>

      <div>
        <p className="text-zinc-500 text-xs font-medium mb-1.5">Bottom line</p>
        <p className="text-zinc-900 text-sm font-semibold leading-relaxed">{verdict}</p>
      </div>
    </div>
  );
}
