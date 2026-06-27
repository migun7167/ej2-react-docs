export default function SLABar({ slaHours, slaUsed, isOverSLA }) {
  const pct = Math.min((slaUsed / slaHours) * 100, 100);
  const color = isOverSLA ? 'bg-red-500' : pct > 80 ? 'bg-orange-500' : pct > 60 ? 'bg-yellow-500' : 'bg-green-500';
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{isOverSLA ? <span className="text-red-600 font-medium">เกิน SLA</span> : `${slaUsed}/${slaHours} ชม.`}</span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }}></div>
      </div>
    </div>
  );
}
