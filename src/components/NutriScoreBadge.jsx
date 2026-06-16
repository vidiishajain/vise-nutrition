const GRADES = {
  a: "bg-green-600",
  b: "bg-lime-500",
  c: "bg-yellow-400",
  d: "bg-orange-500",
  e: "bg-red-600",
};

export default function NutriScoreBadge({ grade }) {
  if (!grade) return null;
  const key = grade.toLowerCase();
  if (!GRADES[key]) return null;

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-gray-400 font-medium">Nutri-Score</span>
      <div className="flex gap-0.5">
        {["a", "b", "c", "d", "e"].map((g) => (
          <span
            key={g}
            className={`w-6 h-6 flex items-center justify-center rounded text-xs font-bold text-white transition-transform ${
              g === key ? `${GRADES[g]} scale-110` : "bg-gray-200 text-gray-400"
            }`}
          >
            {g.toUpperCase()}
          </span>
        ))}
      </div>
    </div>
  );
}
