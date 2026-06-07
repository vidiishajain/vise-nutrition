const TRAFFIC_LIGHTS = {
  green: { emoji: "🟢", color: "#25D366", vibe: "Looking good" },
  amber: { emoji: "🟡", color: "#FFA500", vibe: "Enjoy mindfully" },
  red: { emoji: "🔴", color: "#FF4444", vibe: "Heads up" },
};

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
    <div className="bg-[#2A3942] rounded-lg p-3">
      <div className="mb-3 pb-3 border-b border-[#111B21]/40">
        <div className="flex items-start gap-2">
          <span className="text-lg leading-none mt-0.5">{light.emoji}</span>
          <div className="flex-1 min-w-0">
            <span className="text-[#E9EDEF] text-[15px] font-semibold leading-tight block">
              {title}
            </span>
            <span
              className="text-xs font-medium mt-1 inline-block"
              style={{ color: light.color }}
            >
              {light.vibe}
            </span>
          </div>
        </div>
        {showMatch && (
          <p className="text-[#8696A0] text-xs mt-2 leading-snug pl-7">
            Found in the database as{" "}
            <span className="text-[#E9EDEF]">{productName}</span>
            {brand ? ` · ${brand}` : ""}
          </p>
        )}
      </div>

      {portionLabel && (
        <p className="text-[#8696A0] text-xs mb-3">
          Numbers shown for{" "}
          <span className="text-[#E9EDEF]">{portionLabel.toLowerCase()}</span>
          {portionIsEstimate && " — a typical portion, since the label didn't say"}
        </p>
      )}

      {keyStats?.length > 0 && (
        <div className="mb-3">
          <p className="text-[#00A884] text-xs font-medium uppercase tracking-wide mb-2">
            The rundown
          </p>
          <div className="space-y-2.5">
            {keyStats.map((stat) => (
              <div
                key={stat.label}
                className="bg-[#111B21]/30 rounded-md px-2.5 py-2"
              >
                <div className="flex justify-between items-baseline gap-2">
                  <span className="text-[#8696A0] text-xs">{stat.label}</span>
                  <span className="text-[#E9EDEF] text-sm font-semibold shrink-0">
                    {stat.value}
                  </span>
                </div>
                <p className="text-[#E9EDEF]/80 text-xs mt-1 leading-relaxed">
                  {stat.context}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-3 pb-3 border-b border-[#111B21]/40">
        <p className="text-[#00A884] text-xs font-medium mb-1.5">
          Here's the thing…
        </p>
        <p className="text-[#E9EDEF] text-sm leading-relaxed">{insight}</p>
      </div>

      <div>
        <p className="text-[#00A884] text-xs font-medium mb-1.5">Bottom line</p>
        <p className="text-[#E9EDEF] text-sm font-medium leading-relaxed">
          {verdict}
        </p>
      </div>
    </div>
  );
}
