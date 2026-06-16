import { useState } from "react";
import { supabase } from "../lib/supabase";
import AuthShell, { OrDivider, GoogleButton, SwitchButton, PrimaryButton } from "../components/AuthShell";

export default function SignInView({ onSwitchToSignup, onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) throw err;
    } catch (err) {
      setError(friendlyError(err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell onBack={onBack}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: "#2D2D2D", margin: "0 0 16px" }}>
        Welcome Back
      </h1>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          className="auth-input"
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />

        <div>
          <input
            className="auth-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div style={{ textAlign: "right", marginTop: 6 }}>
            <button
              type="button"
              style={{
                fontSize: 11,
                color: "#999999",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                padding: 0,
              }}
            >
              Forgot Password?
            </button>
          </div>
        </div>

        {error && (
          <p style={{ fontSize: 12, color: "#E05555", margin: "2px 0 0" }}>{error}</p>
        )}

        <PrimaryButton loading={loading} label="Sign In" loadingLabel="Signing in…" />
      </form>

      <OrDivider />

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <GoogleButton />

        <SwitchButton onClick={onSwitchToSignup}>Sign Up Instead</SwitchButton>
      </div>
    </AuthShell>
  );
}

function friendlyError(message) {
  if (!message) return "Something went wrong. Please try again.";
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials") || m.includes("invalid email or password"))
    return "Incorrect email or password.";
  if (m.includes("email not confirmed"))
    return "Please check your inbox to confirm your email first.";
  return message;
}
