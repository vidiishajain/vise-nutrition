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
      <span className="typing-dot w-2 h-2 rounded-full bg-[#8696A0]" />
      <span className="typing-dot w-2 h-2 rounded-full bg-[#8696A0]" />
      <span className="typing-dot w-2 h-2 rounded-full bg-[#8696A0]" />
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
    <div
      className={`flex mb-2 ${isOutbound ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] px-3 py-2 ${
          isOutbound
            ? "bg-[#005C4B] rounded-lg rounded-tr-none"
            : "bg-[#202C33] rounded-lg rounded-tl-none"
        }`}
      >
        {isTyping ? (
          <TypingIndicator />
        ) : nutriCard ? (
          <NutriCard {...nutriCard} />
        ) : (
          <p className="text-[#E9EDEF] text-sm leading-relaxed">
            {renderEmphasis(text)}
          </p>
        )}
        {!isTyping && (
          <p
            className={`text-[11px] text-[#8696A0] mt-1 ${
              isOutbound ? "text-right" : "text-right"
            }`}
          >
            {formatTime(timestamp)}
          </p>
        )}
      </div>
    </div>
  );
}
