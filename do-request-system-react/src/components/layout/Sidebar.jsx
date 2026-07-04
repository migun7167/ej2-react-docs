import React from "react";
import { LayoutDashboard, FilePlus2, History, ListChecks, RotateCcw, Truck, ShieldCheck, Eye } from "lucide-react";
import { useApp } from "../../context/AppContext.jsx";
import { cn } from "../../lib/utils.js";

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors",
        active ? "bg-accent text-accent-foreground" : "text-foreground/80 hover:bg-muted"
      )}
    >
      <Icon className="h-4 w-4 flex-none" />
      <span className="truncate">{label}</span>
    </button>
  );
}

function GroupLabel({ children }) {
  return <div className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground first:pt-0">{children}</div>;
}

export default function Sidebar() {
  const { user, view, goto, resetDemo } = useApp();
  if (!user) return null;

  let content;
  if (user.role === "FORWARDER") {
    content = (
      <>
        <GroupLabel>Freight Forwarder</GroupLabel>
        <NavItem icon={LayoutDashboard} label="แดชบอร์ดของฉัน" active={view === "fwd-dashboard"} onClick={() => goto("fwd-dashboard")} />
        <NavItem icon={FilePlus2} label="+ ขอ DO ใหม่" active={view === "new-request"} onClick={() => goto("new-request")} />
        <NavItem icon={History} label="ประวัติการดำเนินการ" active={view === "audit-log"} onClick={() => goto("audit-log")} />
      </>
    );
  } else if (user.role === "TMO") {
    content = (
      <>
        <GroupLabel>TMO – AOT Cargo Terminal</GroupLabel>
        <NavItem icon={ListChecks} label="คิวคำขอ DO" active={view === "tmo-dashboard"} onClick={() => goto("tmo-dashboard")} />
        <NavItem icon={History} label="ประวัติการดำเนินการ" active={view === "audit-log"} onClick={() => goto("audit-log")} />
        <GroupLabel>System</GroupLabel>
        <NavItem icon={RotateCcw} label="รีเซ็ตข้อมูลตัวอย่าง" onClick={resetDemo} />
      </>
    );
  } else if (user.role === "SHIPPING") {
    content = (
      <>
        <GroupLabel>Shipping / ผู้ขนส่ง</GroupLabel>
        <NavItem icon={Truck} label="งานขนส่งของฉัน" active={view === "shipping-dashboard"} onClick={() => goto("shipping-dashboard")} />
        <NavItem icon={History} label="ประวัติการดำเนินการ" active={view === "audit-log"} onClick={() => goto("audit-log")} />
      </>
    );
  } else if (user.role === "CUSTOMS") {
    content = (
      <>
        <GroupLabel>Customs – ศุลกากร</GroupLabel>
        <NavItem icon={ShieldCheck} label="ตรวจสอบเอกสาร DO" active={view === "customs-dashboard"} onClick={() => goto("customs-dashboard")} />
        <NavItem icon={History} label="ประวัติการตรวจของฉัน" active={view === "audit-log"} onClick={() => goto("audit-log")} />
      </>
    );
  } else {
    content = (
      <>
        <GroupLabel>AOT – Oversight</GroupLabel>
        <NavItem icon={Eye} label="ภาพรวมระบบ & Shipment Timeline" active={view === "aot-dashboard"} onClick={() => goto("aot-dashboard")} />
        <NavItem icon={History} label="Audit Log (ทั้งหมด)" active={view === "audit-log"} onClick={() => goto("audit-log")} />
      </>
    );
  }

  return (
    <aside className="sticky top-[49px] hidden h-[calc(100vh-49px)] w-60 flex-none overflow-y-auto border-r bg-card px-3 py-4 md:block">
      {content}
    </aside>
  );
}
