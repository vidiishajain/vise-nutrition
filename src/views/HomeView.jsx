import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch } from "react-icons/fi";
import { fetchSuggestions } from "../api/suggestions";

function BackgroundBlobs() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <div style={{ position: "absolute", top: "-12%", left: "-8%",  width: 560, height: 560, borderRadius: "50%", background: "#F5C5A3", filter: "blur(90px)", opacity: 0.55 }} />
      <div style={{ position: "absolute", top: "18%",  right: "-12%", width: 500, height: 500, borderRadius: "50%", background: "#E8E4F5", filter: "blur(110px)", opacity: 0.60 }} />
      <div style={{ position: "absolute", bottom: "5%", left: "10%",  width: 420, height: 420, borderRadius: "50%", background: "#FADADD", filter: "blur(100px)", opacity: 0.45 }} />
      <div style={{ position: "absolute", top: "50%",  left: "30%",  width: 340, height: 340, borderRadius: "50%", background: "#D4E8F5", filter: "blur(80px)",  opacity: 0.40 }} />
      <div style={{ position: "absolute", bottom: "20%", right: "5%", width: 380, height: 380, borderRadius: "50%", background: "#F5E8C5", filter: "blur(95px)",  opacity: 0.38 }} />
    </div>
  );
}

const RECENT_CARDS = [
  { name: "Pringles Original",  description: "Salted potato crisps",       code: "5053990120009" },
  { name: "Nutella",            description: "Hazelnut cocoa spread",       code: "3017620425035" },
  { name: "Fage Greek Yoghurt", description: "High protein, live cultures", code: "5200106011008" },
];

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

export default function HomeView({ onSearch, isLoading, error, firstName, onSignOut }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const debounceRef = useRef(null);

  const hasQuery = query.trim().length > 0;

  useEffect(() => {
    if (!hasQuery) {
      setSuggestions([]);
      return;
    }
    setSuggestionsLoading(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const results = await fetchSuggestions(query.trim());
      setSuggestions(results);
      setSuggestionsLoading(false);
    }, 320);
    return () => clearTimeout(debounceRef.current);
  }, [query, hasQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q || isLoading) return;
    clearTimeout(debounceRef.current);
    setSuggestions([]);
    setSuggestionsLoading(false);
    onSearch(q);
  };

  const handleResultClick = (item) => {
    if (isLoading) return;
    clearTimeout(debounceRef.current);
    setSuggestions([]);
    setSuggestionsLoading(false);
    onSearch(item.name, item.code || null);
  };

  return (
    <div
      className="auth-bg"
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}
    >
      <BackgroundBlobs />

      {/* Navbar */}
      <div
        style={{
          width: "100%",
          padding: "24px 16px 0",
          display: "flex",
          justifyContent: "center",
          position: "relative",
          zIndex: 1,
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
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontFamily: "Geist, Inter, system-ui", fontSize: 14, fontWeight: 600, color: "#2D2D2D", letterSpacing: "0.04em" }}>
            vise
          </span>
          <button onClick={onSignOut} style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}>
            <UserAvatar firstName={firstName} />
          </button>
        </div>
      </div>

      {/* Search area */}
      <div
        style={{
          marginTop: 176,
          width: "100%",
          padding: "0 16px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            width: "100%",
            maxWidth: 600,
            background: "#FFFFFF",
            borderRadius: 20,
            boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
            padding: "0 20px",
            height: 56,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <FiSearch size={18} color="#AAAAAA" style={{ flexShrink: 0 }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for food items, meals or edibles"
            autoFocus
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 16,
              color: "#1A1A1A",
              fontFamily: "inherit",
            }}
          />
        </form>

        {error && (
          <p style={{ fontSize: 12, color: "#E05555", marginTop: 10, textAlign: "center" }}>{error}</p>
        )}

        {isLoading && (
          <p style={{ fontSize: 13, color: "#AAAAAA", marginTop: 10 }}>Searching…</p>
        )}

        <div style={{ width: "100%", maxWidth: 600, marginTop: 24 }}>
          <AnimatePresence mode="wait">
            {hasQuery && !isLoading ? (
              /* Results panel */
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                style={{
                  background: "rgba(255,255,255,0.85)",
                  backdropFilter: "blur(12px)",
                  borderRadius: 20,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.09)",
                  padding: "20px 24px",
                }}
              >
                <p style={{ fontSize: 15, fontWeight: 700, color: "#2D2D2D", marginBottom: 12 }}>
                  {suggestionsLoading
                    ? `Searching for "${query}"…`
                    : suggestions.length > 0
                    ? `Showing results for "${query}"`
                    : `No results for "${query}"`}
                </p>

                {suggestionsLoading && (
                  <p style={{ fontSize: 13, color: "#AAAAAA", textAlign: "center", padding: "12px 0" }}>
                    Loading…
                  </p>
                )}

                {!suggestionsLoading && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {suggestions.map((item, i) => (
                      <motion.button
                        key={item.code || item.name}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.22, delay: i * 0.05 }}
                        onClick={() => handleResultClick(item)}
                        disabled={isLoading}
                        style={{
                          background: "#F5F5F7",
                          borderRadius: 14,
                          padding: "10px 14px",
                          border: "none",
                          cursor: isLoading ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                          textAlign: "left",
                          width: "100%",
                          fontFamily: "inherit",
                        }}
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{ width: 48, height: 48, borderRadius: 10, objectFit: "cover", flexShrink: 0, background: "#E8E8E8" }}
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          style={{
                            width: 48, height: 48, borderRadius: 10, background: "#E0E0E0", flexShrink: 0,
                            display: item.image ? "none" : "flex", alignItems: "center", justifyContent: "center",
                          }}
                        />
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 700, color: "#2D2D2D", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {item.name}
                          </p>
                          {item.brand && (
                            <p style={{ fontSize: 12, color: "#999999", margin: "3px 0 0" }}>{item.brand}</p>
                          )}
                        </div>
                      </motion.button>
                    ))}

                    {suggestions.length > 0 && (
                      <button
                        onClick={() => !isLoading && onSearch(query.trim())}
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          fontSize: 12, color: "#AAAAAA", padding: "6px 0 0",
                          fontFamily: "inherit", textAlign: "left",
                        }}
                      >
                        Press Enter to search for &ldquo;{query}&rdquo; →
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            ) : (
              /* Recents */
              <motion.div
                key="recents"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                  <span style={{ fontSize: 17, fontWeight: 700, color: "#2D2D2D" }}>Recents</span>
                  <span style={{ fontSize: 15, color: "#AAAAAA", lineHeight: 1 }}>›</span>
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  {RECENT_CARDS.map((card) => (
                    <motion.button
                      key={card.name}
                      whileHover={{ scale: 1.02, background: "rgba(255,255,255,0.72)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => !isLoading && onSearch(card.name, card.code)}
                      disabled={isLoading}
                      style={{
                        flex: 1,
                        padding: "20px 16px",
                        borderRadius: 18,
                        border: "1px solid rgba(255,255,255,0.55)",
                        background: "rgba(255,255,255,0.42)",
                        backdropFilter: "blur(14px)",
                        WebkitBackdropFilter: "blur(14px)",
                        cursor: isLoading ? "not-allowed" : "pointer",
                        textAlign: "left",
                        fontFamily: "inherit",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                        transition: "background 0.18s ease",
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#2D2D2D", margin: 0, lineHeight: 1.3 }}>
                        {card.name}
                      </p>
                      <p style={{ fontSize: 12, color: "#888888", margin: 0, lineHeight: 1.4 }}>
                        {card.description}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
