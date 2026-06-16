import { useState } from "react";

export default function SearchBar({ onSubmit, isLoading, autoFocus, placeholder }) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    if (!value.trim() || isLoading) return;
    onSubmit(value.trim());
    setValue("");
  };

  return (
    <div className="w-full max-w-lg">
      <div className="flex gap-2">
        <input
          autoFocus={autoFocus}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder={placeholder ?? "Search any food or drink…"}
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-base"
        />
        <button
          onClick={handleSubmit}
          disabled={!value.trim() || isLoading}
          className="px-5 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 active:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm whitespace-nowrap"
        >
          {isLoading ? "Searching…" : "Search"}
        </button>
      </div>
    </div>
  );
}
