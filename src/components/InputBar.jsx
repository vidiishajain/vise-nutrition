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
    <div className="flex items-center gap-2 px-3 py-3 bg-[#202C33]">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a food or drink name..."
        className="flex-1 bg-[#2A3942] text-[#E9EDEF] placeholder-[#8696A0] text-sm px-4 py-2 rounded-full outline-none"
      />
      <button
        onClick={handleSubmit}
        disabled={!value.trim() || isLoading}
        className="w-10 h-10 rounded-full bg-[#00A884] flex items-center justify-center disabled:opacity-40"
      >
        <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
          <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
        </svg>
      </button>
    </div>
  );
}
