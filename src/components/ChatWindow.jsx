import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

export default function ChatWindow({ messages, isLoading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3">
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          direction={msg.direction}
          text={msg.text}
          nutriCard={msg.nutriCard}
          timestamp={msg.timestamp}
        />
      ))}
      {isLoading && (
        <MessageBubble direction="inbound" isTyping timestamp={new Date()} />
      )}
      <div ref={bottomRef} />
    </div>
  );
}
