import React from "react";
import { useApp } from "../context/AppContext.jsx";
import { cn } from "../lib/utils.js";

export default function ToastViewport() {
  const { toasts } = useApp();
  if (toasts.length === 0) return null;
  return (
    <div className="fixed right-4 top-16 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "min-w-[220px] rounded-md px-4 py-3 text-sm font-semibold shadow-lg animate-slide-up",
            t.kind === "ok" && "bg-success text-success-foreground",
            t.kind === "error" && "bg-destructive text-destructive-foreground",
            t.kind === "info" && "bg-primary text-primary-foreground"
          )}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
