import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "./lib/supabase";
import LandingView from "./views/LandingView";
import SignUpView from "./views/SignUpView";
import SignInView from "./views/SignInView";
import FirstNameView from "./views/FirstNameView";
import HomeView from "./views/HomeView";
import DashboardView from "./views/DashboardView";
import { searchProduct, fetchByCode } from "./api/openFoodFacts";
import { analyseProduct } from "./api/claude";

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Auth state
  const [session, setSession] = useState(undefined); // undefined = loading
  const [firstName, setFirstName] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [authStep, setAuthStep] = useState(null); // null | "signup" | "login"

  // App state — seed from URL on first load
  const [appState, setAppState] = useState(
    location.pathname === "/search" ? "search" : "landing"
  ); // landing | search | loading | result
  const [resultData, setResultData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Listen for auth changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setFirstName(null);
        setProfileLoaded(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load profile when session changes
  useEffect(() => {
    if (!session?.user) {
      setFirstName(null);
      setProfileLoaded(false);
      return;
    }
    supabase
      .from("profiles")
      .select("first_name")
      .eq("id", session.user.id)
      .single()
      .then(({ data }) => {
        setFirstName(data?.first_name ?? null);
        setProfileLoaded(true);
      });
  }, [session]);

  const handleSignOut = () => {
    supabase.auth.signOut();
    setAppState("landing");
    setResultData(null);
    setErrorMessage(null);
    setAuthStep(null);
    navigate("/");
  };

  const handleSearch = async (query, code = null) => {
    setAppState("loading");
    setErrorMessage(null);
    try {
      const product = code
        ? await fetchByCode(code)
        : await searchProduct(query);
      if (!product.found) {
        setErrorMessage(
          "Couldn't find that one — try something more specific, like 'Lays Classic Salted' instead of 'Lays'."
        );
        setAppState("search");
        return;
      }
      const analysis = await analyseProduct({
        user_query: query,
        product_name: product.product_name,
        brand: product.brand,
        serving_size: product.serving_size,
        per100g: product.per100g,
        kcal: product.kcal,
        sugar: product.sugar,
        fat: product.fat,
        sat_fat: product.sat_fat,
        salt: product.salt,
        protein: product.protein,
        fiber: product.fiber,
        carbs: product.carbs,
        nutrition_grade: product.nutrition_grade,
        nova_group: product.nova_group,
        ingredients_text: product.ingredients_text,
        allergens: product.allergens,
        additives: product.additives,
      });
      setResultData({ product, analysis, searchQuery: query });
      setAppState("result");
    } catch {
      setErrorMessage("Something went wrong — please try again.");
      setAppState("search");
    }
  };

  const handleBack = () => {
    setAppState("search");
    setResultData(null);
    setErrorMessage(null);
  };

  // ── Loading session ──────────────────────────────────────────────────────────
  if (session === undefined) {
    return (
      <div className="min-h-screen auth-bg flex items-center justify-center">
        <span className="text-gray-400 text-sm">Loading…</span>
      </div>
    );
  }

  // ── Not logged in ────────────────────────────────────────────────────────────
  if (!session) {
    if (authStep === "signup") {
      return (
        <SignUpView
          onSwitchToLogin={() => setAuthStep("login")}
          onBack={() => setAuthStep(null)}
        />
      );
    }
    if (authStep === "login") {
      return (
        <SignInView
          onSwitchToSignup={() => setAuthStep("signup")}
          onBack={() => setAuthStep(null)}
        />
      );
    }
    return (
      <LandingView
        authenticated={false}
        onSignUp={() => setAuthStep("signup")}
        onSignIn={() => setAuthStep("login")}
      />
    );
  }

  // ── Logged in: waiting for profile ───────────────────────────────────────────
  if (!profileLoaded) {
    return (
      <div className="min-h-screen auth-bg flex items-center justify-center">
        <span className="text-gray-400 text-sm">Loading…</span>
      </div>
    );
  }

  // ── Logged in: no profile yet → capture first name ───────────────────────────
  if (!firstName) {
    return (
      <FirstNameView
        userId={session.user.id}
        onComplete={(name) => setFirstName(name)}
      />
    );
  }

  // ── Logged in: result page ────────────────────────────────────────────────────
  if (appState === "result" && resultData) {
    return (
      <DashboardView
        data={resultData}
        onBack={handleBack}
        onSearch={handleSearch}
        firstName={firstName}
        onSignOut={handleSignOut}
      />
    );
  }

  // ── Logged in: search page ────────────────────────────────────────────────────
  if (appState === "search" || appState === "loading") {
    return (
      <HomeView
        onSearch={handleSearch}
        isLoading={appState === "loading"}
        error={errorMessage}
        firstName={firstName}
        onSignOut={handleSignOut}
      />
    );
  }

  // ── Logged in: landing ────────────────────────────────────────────────────────
  return (
    <LandingView
      authenticated
      firstName={firstName}
      onDashboard={() => { setAppState("search"); navigate("/search"); }}
      onSignOut={handleSignOut}
      onSignIn={handleSignOut}
    />
  );
}
