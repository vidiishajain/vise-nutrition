import { useState } from "react";

export default function InputBar({ onSubmit, isLoading }) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    if (!value.trim() || isLoading) return;
    onSubmit(value.trim());
    setValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="px-4 py-4 shrink-0">
      <div className="flex items-center gap-3 bg-[#1c1c1e]/90 backdrop-blur-md rounded-2xl px-4 py-3 shadow-2xl border border-white/10">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a food or drink name..."
          className="flex-1 bg-transparent text-white placeholder-white/35 text-sm outline-none"
        />
        <button
          onClick={handleSubmit}
          disabled={!value.trim() || isLoading}
          className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 transition-colors flex items-center justify-center disabled:opacity-30 shrink-0"
        >
          <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
            <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
