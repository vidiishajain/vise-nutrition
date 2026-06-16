import { useState } from "react";
import { motion } from "framer-motion";

// ── constants ─────────────────────────────────────────────────────────────────

const ICONS = {
  Calories: "🔥",
  Sugar: "🍬",
  Salt: "🧂",
  "Saturated Fat": "🧈",
  Protein: "🥩",
  Fiber: "🌾",
};

const RATING_CONFIG = {
  high:     { label: "High",     text: "#E53935", bg: "#FFF5F5", bar: "#EF5350" },
  moderate: { label: "Moderate", text: "#F59E0B", bg: "#FFFBF0", bar: "#FBBF24" },
  low:      { label: "Low",      text: "#43A047", bg: "#F4FBF4", bar: "#66BB6A" },
  fair:     { label: "Fair",     text: "#3B82F6", bg: "#F0F6FF", bar: "#60A5FA" },
};

const TRAFFIC_CONFIG = {
  green: { label: "Looking good",    bg: "#E8F5E9", text: "#388E3C", dot: "#4CAF50" },
  amber: { label: "Enjoy mindfully", bg: "#FFF8E1", text: "#F57F17", dot: "#FFC107" },
  red:   { label: "Heads up",        bg: "#FADADD", text: "#C97070", dot: "#C97070" },
};

const NUTRISCORE_COLORS = {
  a: "#4CAF50",
  b: "#8BC34A",
  c: "#FFC107",
  d: "#FF9800",
  e: "#F44336",
};

const NOVA_BAR_COLORS = { 1: "#66BB6A", 2: "#CDDC39", 3: "#FFC107", 4: "#EF5350" };

const NOVA_LABELS = {
  1: "Minimally processed",
  2: "Processed ingredients",
  3: "Processed food",
  4: "Ultra-processed",
};

const PANEL_STYLE = {
  background: "#FFFFFF",
  borderRadius: 20,
  boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
  padding: "28px 32px",
};

const SECTION_LABEL_STYLE = {
  fontSize: 11,
  fontWeight: 600,
  color: "#AAAAAA",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
};

// ── helpers ───────────────────────────────────────────────────────────────────

function getRating(stat) {
  if (stat.isPositive) return "fair";
  if (stat.level === "high") return "high";
  if (stat.level === "moderate") return "moderate";
  return "low";
}

function shouldShowMatch(searchQuery, productName) {
  if (!searchQuery || !productName) return false;
  const q = searchQuery.toLowerCase();
  const p = productName.toLowerCase();
  return !p.includes(q) && !q.includes(p.split(" ")[0]);
}

// ── sub-components ────────────────────────────────────────────────────────────

function UserAvatar({ firstName }) {
  const initial = firstName ? firstName[0].toUpperCase() : "?";
  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: "radial-gradient(circle at 40% 40%, #8B6FEF, #5B4FCF)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: 700,
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      {initial}
    </div>
  );
}

function NutrientCard({ stat, colSpan2 }) {
  const rating = getRating(stat);
  const cfg = RATING_CONFIG[rating] ?? RATING_CONFIG.moderate;
  const pct = Math.min(stat.percent ?? 0, 100);
  const analogy = stat.context || stat.analogy;

  return (
    <div
      style={{
        background: cfg.bg,
        borderRadius: 16,
        padding: 20,
        gridColumn: colSpan2 ? "span 2" : "span 1",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {/* Name + rating */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#2D2D2D" }}>
          {ICONS[stat.label] ?? ""} {stat.label}
        </span>
        <span style={{ fontSize: 12, fontWeight: 600, color: cfg.text }}>
          {cfg.label}
        </span>
      </div>

      {/* Large value */}
      <p style={{ fontSize: 28, fontWeight: 700, color: "#2D2D2D", margin: 0, lineHeight: 1 }}>
        {stat.value}
      </p>

      {/* Progress bar */}
      {pct > 0 && (
        <div>
          <div style={{ height: 4, background: "#EEEEEE", borderRadius: 2, overflow: "hidden" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{ height: "100%", background: cfg.bar, borderRadius: 2 }}
            />
          </div>
          <p style={{ fontSize: 11, color: "#AAAAAA", margin: "5px 0 0" }}>
            {pct}% of daily recommended
          </p>
        </div>
      )}

      {/* Analogy */}
      {analogy && (
        <p style={{ fontSize: 12, fontWeight: 600, color: "#2D2D2D", margin: 0 }}>
          {analogy}
        </p>
      )}
    </div>
  );
}

// ── main view ─────────────────────────────────────────────────────────────────

export default function DashboardView({ data, onBack, onSearch, firstName, onSignOut }) {
  const { product, analysis, searchQuery } = data;
  const [showIngredients, setShowIngredients] = useState(false);

  const title = searchQuery || product.product_name;
  const showMatch = shouldShowMatch(searchQuery, product.product_name);
  const trafficCfg = TRAFFIC_CONFIG[analysis.traffic_light] ?? TRAFFIC_CONFIG.amber;
  const nutriGrade = product.nutrition_grade?.toLowerCase();
  const novaGroup = product.nova_group;
  const stats = analysis.key_stats ?? [];

  const panelVariants = (i) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: "easeOut", delay: i * 0.08 },
  });

  const hasIngredients =
    novaGroup || product.allergens?.length || product.additives?.length || product.ingredients_text;

  return (
    <div
      className="auth-bg"
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      {/* Navbar */}
      <div
        style={{
          width: "100%",
          padding: "24px 16px 0",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 600,
            background: "#FFFFFF",
            borderRadius: 50,
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          {/* Left */}
          <button
            onClick={onBack}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              color: "#AAAAAA",
              fontSize: 13,
              fontFamily: "inherit",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            ← Back
          </button>
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#2D2D2D",
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </span>

          {/* Right */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
            {firstName && (
              <span style={{ fontSize: 13, color: "#AAAAAA" }}>{firstName}</span>
            )}
            <button
              onClick={onSignOut}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                color: "#AAAAAA",
                fontSize: 13,
                fontFamily: "inherit",
              }}
            >
              Sign out
            </button>
            <button
              onClick={onSignOut}
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
            >
              <UserAvatar firstName={firstName} />
            </button>
          </div>
        </div>
      </div>

      {/* Main content column */}
      <div
        style={{
          width: "100%",
          maxWidth: 720,
          padding: "24px 16px 60px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* ── Panel 1: Item header ── */}
        <motion.div {...panelVariants(0)} style={PANEL_STYLE}>
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
            {product.image_url && (
              <img
                src={product.image_url}
                alt={product.product_name}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 12,
                  objectFit: "cover",
                  flexShrink: 0,
                  background: "#F5F5F7",
                }}
                onError={(e) => { e.target.style.display = "none"; }}
              />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: "#2D2D2D", margin: "0 0 4px", lineHeight: 1.2 }}>
                {product.product_name || title}
              </h1>
              {product.brand && (
                <p style={{ fontSize: 13, color: "#AAAAAA", margin: "0 0 14px" }}>
                  {product.brand}
                </p>
              )}
              {showMatch && (
                <p style={{ fontSize: 12, color: "#AAAAAA", margin: "0 0 12px" }}>
                  Found as <span style={{ color: "#555" }}>{product.product_name}</span>
                </p>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                {/* Traffic light badge */}
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "5px 12px",
                    borderRadius: 999,
                    background: trafficCfg.bg,
                    color: trafficCfg.text,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: trafficCfg.dot,
                      flexShrink: 0,
                    }}
                  />
                  {trafficCfg.label}
                </span>

                {/* Nutri-Score */}
                {nutriGrade && NUTRISCORE_COLORS[nutriGrade] && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 12, color: "#AAAAAA", fontWeight: 500 }}>
                      Nutri-Score
                    </span>
                    <div style={{ display: "flex", gap: 4 }}>
                      {["a", "b", "c", "d", "e"].map((g) => {
                        const active = g === nutriGrade;
                        return (
                          <span
                            key={g}
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 6,
                              background: active ? NUTRISCORE_COLORS[g] : "#F0F0F0",
                              color: active ? "#FFFFFF" : "#BBBBBB",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 12,
                              fontWeight: active ? 700 : 500,
                              transform: active ? "scale(1.12)" : "scale(1)",
                              transition: "transform 0.15s",
                            }}
                          >
                            {g.toUpperCase()}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Panel 2: Breakdown ── */}
        {stats.length > 0 && (
          <motion.div {...panelVariants(1)} style={PANEL_STYLE}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <span style={SECTION_LABEL_STYLE}>Breakdown</span>
              {product.portion_label && (
                <span style={SECTION_LABEL_STYLE}>
                  Per {product.portion_label}
                  {product.portion_is_estimate ? " (est.)" : ""}
                </span>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {stats.map((stat, i) => (
                <NutrientCard
                  key={stat.label}
                  stat={stat}
                  colSpan2={i === stats.length - 1 && stats.length % 2 !== 0}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Panel 3: The Verdict ── */}
        {(analysis.insight || analysis.verdict || analysis.best_context || analysis.processing_note) && (
          <motion.div {...panelVariants(2)} style={PANEL_STYLE}>
            {/* Heading row */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
              <h2 style={{ fontSize: 21, fontWeight: 700, color: "#2D2D2D", margin: 0, lineHeight: 1.2 }}>
                {analysis.verdict_label || "The Verdict"}
              </h2>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "3px 10px",
                  borderRadius: 999,
                  background: trafficCfg.bg,
                  color: trafficCfg.text,
                  fontSize: 11,
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: trafficCfg.dot,
                    flexShrink: 0,
                  }}
                />
                {trafficCfg.label}
              </span>
            </div>

            {analysis.insight && (
              <p style={{ fontSize: 15, color: "#3D3D3D", lineHeight: 1.75, margin: "0 0 18px" }}>
                {analysis.insight}
              </p>
            )}

            {analysis.verdict && (
              <div
                style={{
                  background: trafficCfg.bg,
                  borderRadius: 16,
                  padding: "16px 20px",
                  marginBottom: 16,
                  borderLeft: `4px solid ${trafficCfg.dot}`,
                }}
              >
                <p style={{ fontSize: 15, fontWeight: 600, color: "#2D2D2D", lineHeight: 1.65, margin: 0 }}>
                  {analysis.verdict}
                </p>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {analysis.best_context && (
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 16, lineHeight: 1.2, flexShrink: 0 }}>💡</span>
                  <p style={{ fontSize: 13, color: "#666666", lineHeight: 1.6, margin: 0 }}>
                    {analysis.best_context}
                  </p>
                </div>
              )}
              {analysis.processing_note && (
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 16, lineHeight: 1.2, flexShrink: 0 }}>🏭</span>
                  <p style={{ fontSize: 13, color: "#666666", lineHeight: 1.6, margin: 0 }}>
                    {analysis.processing_note}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Panel 4: Ingredients & Processing ── */}
        {hasIngredients && (
          <motion.div {...panelVariants(3)} style={PANEL_STYLE}>
            <span style={{ ...SECTION_LABEL_STYLE, display: "block", marginBottom: 20 }}>
              Ingredients &amp; Processing
            </span>

            {/* NOVA */}
            {novaGroup && NOVA_LABELS[novaGroup] && (
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <span style={{ fontSize: 12, color: "#AAAAAA", fontWeight: 500 }}>
                    Processing level (NOVA {novaGroup})
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#2D2D2D" }}>
                    {NOVA_LABELS[novaGroup]}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  {[1, 2, 3, 4].map((n) => (
                    <div
                      key={n}
                      style={{
                        flex: 1,
                        height: 6,
                        borderRadius: 3,
                        background: n <= novaGroup ? NOVA_BAR_COLORS[novaGroup] : "#EEEEEE",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Allergens */}
            {product.allergens?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 12, color: "#AAAAAA", fontWeight: 500, marginBottom: 8 }}>
                  Allergens
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {product.allergens.map((a) => (
                    <span
                      key={a}
                      style={{
                        padding: "4px 10px",
                        background: "#FFF0F0",
                        color: "#E53935",
                        fontSize: 12,
                        fontWeight: 600,
                        borderRadius: 999,
                        textTransform: "capitalize",
                      }}
                    >
                      {a.replace(/-/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Additives */}
            {product.additives?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 12, color: "#AAAAAA", fontWeight: 500, marginBottom: 8 }}>
                  Additives ({product.additives.length})
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {product.additives.slice(0, 8).map((a) => (
                    <span
                      key={a}
                      style={{
                        padding: "4px 10px",
                        background: "#FFFBEB",
                        color: "#D97706",
                        fontSize: 12,
                        fontWeight: 600,
                        borderRadius: 999,
                        textTransform: "uppercase",
                      }}
                    >
                      {a}
                    </span>
                  ))}
                  {product.additives.length > 8 && (
                    <span
                      style={{
                        padding: "4px 10px",
                        background: "#F5F5F7",
                        color: "#AAAAAA",
                        fontSize: 12,
                        borderRadius: 999,
                      }}
                    >
                      +{product.additives.length - 8} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Full ingredients */}
            {product.ingredients_text && (
              <div>
                <button
                  onClick={() => setShowIngredients(!showIngredients)}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    fontSize: 12,
                    color: "#AAAAAA",
                    fontWeight: 500,
                    fontFamily: "inherit",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span>{showIngredients ? "▾" : "▸"}</span>
                  Full ingredients list
                </button>
                {showIngredients && (
                  <p style={{ fontSize: 12, color: "#666666", lineHeight: 1.7, marginTop: 10 }}>
                    {product.ingredients_text}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        )}

        <p style={{ textAlign: "center", fontSize: 11, color: "#CCCCCC", marginTop: 8 }}>
          Data from Open Food Facts · Analysis by Claude
        </p>
      </div>
    </div>
  );
}
