import { motion } from "framer-motion";
import BlobCanvas from "../components/BlobCanvas";
import MouseGlow from "../components/MouseGlow";
import GlassColumns from "../components/GlassColumns";

export default function LandingView({
  authenticated,
  firstName,
  onSignUp,
  onSignIn,
  onDashboard,
  onSignOut,
}) {
  return (
    <div
      style={{ position: "relative", minHeight: "100vh", overflow: "hidden", display: "flex", flexDirection: "column" }}
    >
      {/* Layer 0 — blob canvas (simplex-noise, fixed, z-index 0) */}
      <BlobCanvas />

      {/* Layer 1 — mouse glow (fixed, z-index 1) */}
      <MouseGlow />

      {/* Layer 2 — frosted glass columns with spring proximity (fixed, z-index 2) */}
      <GlassColumns />

      {/* Layer 3 — all content */}
      <div style={{ position: "relative", zIndex: 3, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "20px 24px 0" }}>
          <div style={{ width: 64 }} />

          {/* Wordmark */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{
              fontFamily: "Geist, system-ui",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.20em",
              color: "rgba(100,40,15,0.50)",
              textTransform: "lowercase",
            }}>
              vise
            </span>
            <div style={{ width: 26, height: 1, background: "rgba(100,40,15,0.22)", marginTop: 2 }} />
          </div>

          {/* Sign out (authenticated) */}
          <div style={{ width: 64, display: "flex", justifyContent: "flex-end" }}>
            {authenticated && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                onClick={onSignOut}
                style={{
                  fontFamily: "Inter, system-ui",
                  fontSize: 11,
                  fontWeight: 500,
                  padding: "4px 12px",
                  borderRadius: 999,
                  color: "rgba(100,40,15,0.65)",
                  border: "1px solid rgba(100,40,15,0.16)",
                  background: "rgba(255,255,255,0.32)",
                  backdropFilter: "blur(6px)",
                  cursor: "pointer",
                }}
              >
                Sign out
              </motion.button>
            )}
          </div>
        </div>

        {/* Hero — vertically centred */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 24px",
          marginTop: -24,
        }}>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: "Geist, system-ui",
              fontSize: "clamp(26px, 4.5vw, 46px)",
              fontWeight: 700,
              lineHeight: 1.18,
              color: "rgba(255,255,255,0.96)",
              maxWidth: 520,
              marginBottom: 28,
              /* subtle text shadow so it reads over the frosted columns */
              textShadow: "0 1px 18px rgba(140,50,20,0.18)",
            }}
          >
            Your nutrition and intake{" "}
            <span
              className="font-dancing"
              style={{ fontSize: "clamp(32px, 5.5vw, 56px)", fontWeight: 600 }}
            >
              data,
            </span>
            <br />
            all in one place
          </motion.h1>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}
          >
            {/* Read Up — solid white pill */}
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 4px 20px rgba(140,50,20,0.18)" }}
              whileTap={{ scale: 0.96 }}
              onClick={authenticated ? undefined : onSignIn}
              style={{
                fontFamily: "Inter, system-ui",
                fontSize: 13,
                fontWeight: 600,
                padding: "7px 18px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.90)",
                color: "#3a1508",
                border: "none",
                cursor: "pointer",
                transition: "box-shadow 0.2s",
              }}
            >
              Read Up
            </motion.button>

            {/* Dashboard / Sign Up — frosted ghost pill */}
            <motion.button
              whileHover={{ scale: 1.05, background: "rgba(255,255,255,0.28)" }}
              whileTap={{ scale: 0.96 }}
              onClick={authenticated ? onDashboard : onSignUp}
              style={{
                fontFamily: "Inter, system-ui",
                fontSize: 13,
                fontWeight: 600,
                padding: "7px 18px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.18)",
                color: "rgba(255,255,255,0.92)",
                border: "1px solid rgba(255,255,255,0.38)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                transition: "background 0.18s",
              }}
            >
              {authenticated ? "Dashboard" : "Sign Up"}
              <span style={{ fontSize: 12, opacity: 0.8 }}>→</span>
            </motion.button>
          </motion.div>

          {/* Disclaimer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.38 }}
            style={{
              fontFamily: "Inter, system-ui",
              fontSize: 11,
              lineHeight: 1.6,
              maxWidth: 300,
              color: "rgba(100,40,15,0.42)",
              textAlign: "center",
            }}
          >
            {authenticated
              ? `Welcome back${firstName ? `, ${firstName}` : ""}. Your data is private and only used to personalise your experience.`
              : "By continuing, you agree to our terms and conditions for using NutriLens and account creation."}
          </motion.p>
        </div>
      </div>
    </div>
  );
}
