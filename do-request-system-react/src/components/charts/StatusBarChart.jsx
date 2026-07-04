import React from "react";

export default function StatusBarChart({ rows }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <div className="space-y-3">
      {rows.map((r) => {
        const pct = r.count === 0 ? 0 : Math.max(4, Math.round((r.count / max) * 100));
        return (
          <div key={r.key} className="flex items-center gap-3">
            <div className="w-36 flex-none text-right text-xs font-semibold text-muted-foreground">{r.label}</div>
            <div className="h-4 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: pct + "%", backgroundColor: `hsl(var(${r.colorVar}))` }}
              />
            </div>
            <div className="w-7 flex-none text-sm font-bold tabular-nums">{r.count}</div>
          </div>
        );
      })}
    </div>
  );
}
