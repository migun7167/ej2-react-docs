export default function SLABar({ used, total, showLabel = true }) {
  const pct = total > 0 ? Math.min((used / total) * 100, 100) : 0;
  const over = used > total;
  const overPct = total > 0 ? Math.round(((used - total) / total) * 100) : 0;

  let barColor = 'bg-green-500';
  let textColor = 'text-green-600';
  let bgColor = 'bg-green-100';
  if (over) { barColor = 'bg-red-500'; textColor = 'text-red-600'; bgColor = 'bg-red-100'; }
  else if (pct >= 80) { barColor = 'bg-orange-500'; textColor = 'text-orange-600'; bgColor = 'bg-orange-100'; }
  else if (pct >= 60) { barColor = 'bg-yellow-400'; textColor = 'text-yellow-700'; bgColor = 'bg-yellow-100'; }

  return (
    <div className="flex items-center gap-2 w-full min-w-[120px]">
      <div className={`flex-1 h-2 rounded-full ${bgColor} overflow-hidden`}>
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${over ? 100 : pct}%` }}
        />
      </div>
      {showLabel && (
        <span className={`text-[11px] font-semibold whitespace-nowrap ${textColor}`}>
          {over ? `+${used - total}ชม.` : `${used}/${total}`}
        </span>
      )}
    </div>
  );
}
