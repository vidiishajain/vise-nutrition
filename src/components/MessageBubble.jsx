import NutriCard from "./NutriCard";

function renderEmphasis(text) {
  const parts = text.split(/(\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={i} className="italic">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 py-1 px-0.5">
      <span className="typing-dot w-2 h-2 rounded-full bg-white/60" />
      <span className="typing-dot w-2 h-2 rounded-full bg-white/60" />
      <span className="typing-dot w-2 h-2 rounded-full bg-white/60" />
    </div>
  );
}

export default function MessageBubble({
  direction,
  text,
  nutriCard,
  isTyping,
  timestamp,
}) {
  const isOutbound = direction === "outbound";

  return (
    <div className={`flex mb-2 message-in ${isOutbound ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] px-3 py-2 backdrop-blur-sm border ${
          isOutbound
            ? "bg-black/35 border-white/10 rounded-lg rounded-tr-none"
            : "bg-white/15 border-white/15 rounded-lg rounded-tl-none"
        }`}
      >
        {isTyping ? (
          <TypingIndicator />
        ) : nutriCard ? (
          <NutriCard {...nutriCard} />
        ) : (
          <p className={`text-sm leading-relaxed ${isOutbound ? "text-white" : "text-zinc-900"}`}>
            {renderEmphasis(text)}
          </p>
        )}
        {!isTyping && (
          <p className={`text-[11px] mt-1 text-right ${isOutbound ? "text-white/40" : "text-zinc-900/40"}`}>
            {formatTime(timestamp)}
          </p>
        )}
      </div>
    </div>
  );
}
