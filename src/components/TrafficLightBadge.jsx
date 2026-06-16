const CONFIGS = {
  green: { label: "Looking good", bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
  amber: { label: "Enjoy mindfully", bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
  red: { label: "Heads up", bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
};

export default function TrafficLightBadge({ value }) {
  const config = CONFIGS[value] || CONFIGS.amber;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${config.bg} ${config.text}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
