import { motion } from "framer-motion";

// Google "G" logo SVG
function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

// Shared OR divider
export function OrDivider() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
      <div style={{ flex: 1, height: 1, background: "#EBEBEB" }} />
      <span style={{ fontSize: 11, color: "#AAAAAA", fontWeight: 500 }}>OR</span>
      <div style={{ flex: 1, height: 1, background: "#EBEBEB" }} />
    </div>
  );
}

// Shared "Sign In With Google" button
export function GoogleButton() {
  return (
    <motion.button
      type="button"
      whileHover={{ backgroundColor: "#F9F9F9" }}
      style={{
        width: "100%",
        height: 52,
        background: "#FFFFFF",
        border: "1px solid #E5E5E5",
        borderRadius: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        fontSize: 14,
        fontWeight: 500,
        color: "#1A1A1A",
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      <GoogleG />
      Sign In With Google
    </motion.button>
  );
}

// Shared switch button (peach pill — "Sign In Instead" / "Sign Up Instead")
export function SwitchButton({ onClick, children }) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        padding: "8px 16px",
        background: "#FADADD",
        border: "none",
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 500,
        color: "#C97070",
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      {children}
    </motion.button>
  );
}

// Shared primary submit button (black, full-width, with arrow)
export function PrimaryButton({ loading, loadingLabel, label }) {
  return (
    <motion.button
      type="submit"
      disabled={loading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        width: "100%",
        height: 52,
        background: loading ? "#555" : "#111111",
        color: "#FFFFFF",
        borderRadius: 12,
        border: "none",
        fontSize: 15,
        fontWeight: 700,
        cursor: loading ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        fontFamily: "inherit",
        transition: "background 0.15s",
      }}
    >
      <span>{loading ? loadingLabel : label}</span>
      {!loading && <span style={{ fontSize: 16 }}>→</span>}
    </motion.button>
  );
}

// Page wrapper — animated bg + logo + animated card + footer
export default function AuthShell({ children, onBack }) {
  return (
    <div
      className="auth-bg"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 16px 40px",
        position: "relative",
      }}
    >
      {/* Logo — top center */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: "50%",
          transform: "translateX(-50%)",
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontFamily: "Geist, Inter, system-ui",
            fontSize: 14,
            fontWeight: 600,
            color: "#2D2D2D",
            letterSpacing: "0.04em",
            whiteSpace: "nowrap",
          }}
        >
          vise
        </span>
        <div
          style={{
            height: 2,
            width: "100%",
            background: "#2D2D2D",
            borderRadius: 1,
            marginTop: 2,
          }}
        />
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          width: "100%",
          maxWidth: 380,
          background: "#FFFFFF",
          borderRadius: 20,
          boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
          padding: 40,
        }}
      >
        {children}
      </motion.div>

      {/* Footer */}
      <button
        onClick={onBack}
        style={{
          marginTop: 28,
          fontSize: 12,
          color: "#2D2D2D",
          textDecoration: "underline",
          textUnderlineOffset: 2,
          background: "none",
          border: "none",
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        Curious before you sign up?
      </button>
    </div>
  );
}
