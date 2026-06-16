import { useState } from "react";
import { supabase } from "../lib/supabase";
import AuthShell, { OrDivider, GoogleButton, SwitchButton, PrimaryButton } from "../components/AuthShell";

export default function SignUpView({ onSwitchToLogin, onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.signUp({ email, password });
      if (err) throw err;
      // Session triggers App.jsx → profile check → FirstNameView
    } catch (err) {
      setError(friendlyError(err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell onBack={onBack}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: "#2D2D2D", margin: "0 0 16px" }}>
        Get Started
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
        <input
          className="auth-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />

        {error && (
          <p style={{ fontSize: 12, color: "#E05555", margin: "2px 0 0" }}>{error}</p>
        )}

        <PrimaryButton loading={loading} label="Sign Up" loadingLabel="Creating account…" />

        <p style={{ fontSize: 11, color: "#999999", textAlign: "center", lineHeight: 1.6, margin: "4px 0 0" }}>
          By signing up on vise, you're accepting the terms and conditions for account creation.
        </p>
      </form>

      <OrDivider />

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <GoogleButton />

        <SwitchButton onClick={onSwitchToLogin}>Sign In Instead</SwitchButton>
      </div>
    </AuthShell>
  );
}

function friendlyError(message) {
  if (!message) return "Something went wrong. Please try again.";
  const m = message.toLowerCase();
  if (m.includes("already registered") || m.includes("user already registered"))
    return "An account with this email already exists. Try signing in instead.";
  if (m.includes("password should be at least"))
    return "Password must be at least 6 characters.";
  if (m.includes("unable to validate email") || m.includes("invalid email"))
    return "Please enter a valid email address.";
  return message;
}
