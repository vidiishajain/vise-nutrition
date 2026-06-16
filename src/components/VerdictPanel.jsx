export default function VerdictPanel({ insight, verdict, bestContext, processingNote }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
        What this means
      </h2>

      <div className="space-y-4">
        {insight && (
          <p className="text-sm text-gray-600 leading-relaxed">{insight}</p>
        )}

        {verdict && (
          <div className="bg-indigo-600 rounded-xl px-4 py-3.5">
            <p className="text-sm font-semibold text-white leading-relaxed">{verdict}</p>
          </div>
        )}

        <div className="flex flex-col gap-2 pt-1">
          {bestContext && (
            <div className="flex gap-2 items-start">
              <span className="text-base leading-none mt-0.5">💡</span>
              <p className="text-xs text-gray-500 leading-relaxed">{bestContext}</p>
            </div>
          )}
          {processingNote && (
            <div className="flex gap-2 items-start">
              <span className="text-base leading-none mt-0.5">🏭</span>
              <p className="text-xs text-gray-500 leading-relaxed">{processingNote}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
