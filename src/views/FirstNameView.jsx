import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function FirstNameView({ userId, onComplete }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    try {
      const { error: insertError } = await supabase
        .from("profiles")
        .insert({ id: userId, first_name: trimmed });

      if (insertError) throw insertError;
      onComplete(trimmed);
    } catch (err) {
      setError("Couldn't save your name. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen auth-bg flex flex-col">
      {/* Logo */}
      <div className="text-center pt-8">
        <span className="text-sm font-semibold text-gray-500 tracking-widest uppercase border-b border-gray-400 pb-0.5">
          NutriLens
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 text-center leading-tight mb-16 max-w-2xl">
          What do you want us to call you?
        </h1>

        <form onSubmit={handleSubmit} className="w-full max-w-lg">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="first name"
            autoFocus
            disabled={loading}
            className="w-full bg-transparent text-center text-2xl text-gray-700 placeholder-gray-400 border-0 border-b-2 border-gray-800 focus:outline-none focus:border-gray-900 pb-3 disabled:opacity-50"
          />
          {error && (
            <p className="text-xs text-red-500 text-center mt-4">{error}</p>
          )}
        </form>
      </div>

      {/* Bottom */}
      <div className="text-center pb-8">
        <span className="text-xs text-gray-500 underline underline-offset-2">
          Curious before you sign up?
        </span>
      </div>
    </div>
  );
}
