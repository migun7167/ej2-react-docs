import React from "react";
import { Moon, Sun, LogOut, Plane } from "lucide-react";
import { useApp } from "../../context/AppContext.jsx";
import { Button } from "../ui/button.jsx";

export default function Topbar() {
  const { user, theme, toggleTheme, logout } = useApp();
  const initials = user?.name?.trim()?.slice(0, 1) || "?";

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b bg-gradient-to-r from-primary to-primary/80 px-5 py-2.5 text-primary-foreground shadow-md">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-gold text-[13px] font-bold text-gold-foreground shadow ring-2 ring-white/20">
          <Plane className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-bold leading-tight">AOT Cargo Community – DO Request &amp; Assign</div>
          <div className="truncate text-[11px] text-primary-foreground/75">Airports of Thailand PCL · Minimal-Input DO Workflow (Prototype)</div>
        </div>
      </div>
      <div className="flex flex-none items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-primary-foreground hover:bg-white/15 hover:text-primary-foreground">
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        {user && (
          <div className="hidden items-center gap-2 rounded-full bg-white/10 py-1 pl-1 pr-3 sm:flex">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gold text-xs font-bold text-gold-foreground">
              {initials}
            </div>
            <div className="leading-tight">
              <div className="text-xs font-semibold">{user.name}</div>
              <div className="text-[10px] text-primary-foreground/75">{user.position || user.company}</div>
            </div>
          </div>
        )}
        {user && (
          <Button variant="ghost" size="sm" onClick={logout} className="gap-1.5 text-primary-foreground hover:bg-white/15 hover:text-primary-foreground">
            <LogOut className="h-3.5 w-3.5" />
            ออกจากระบบ
          </Button>
        )}
      </div>
    </header>
  );
}
