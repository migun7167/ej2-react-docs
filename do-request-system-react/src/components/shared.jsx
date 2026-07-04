import React from "react";
import { Badge } from "./ui/badge.jsx";
import { Card, CardContent } from "./ui/card.jsx";
import { ACTION_LABELS, fmt, sortLogsDesc } from "../lib/domain.js";

const ENTITLEMENT_MAP = {
  PASS_MASTER: ["success", "PASS_MASTER – สิทธิ์ระดับ MAWB"],
  PASS_HOUSE: ["success", "PASS_HOUSE – สิทธิ์ระดับ HAWB"],
  PASS_DELEGATED: ["default", "PASS_DELEGATED – ได้รับมอบอำนาจ"],
  FAIL: ["destructive", "FAIL – ไม่มีสิทธิ์"],
};
export function EntitlementBadge({ value }) {
  const [variant, label] = ENTITLEMENT_MAP[value] || ["muted", value || "-"];
  return <Badge variant={variant}>{label}</Badge>;
}

const STATUS_MAP = {
  REQUEST_SUBMITTED: ["default", "REQUEST_SUBMITTED"],
  SHIPMENT_NOT_FOUND: ["destructive", "SHIPMENT_NOT_FOUND"],
  ENTITLEMENT_FAILED: ["destructive", "ENTITLEMENT_FAILED"],
  PENDING_DOCUMENT_SCAN: ["warning", "PENDING_DOCUMENT_SCAN"],
  READY_FOR_APPROVAL: ["default", "READY_FOR_APPROVAL"],
  MANUAL_REVIEW: ["warning", "MANUAL_REVIEW"],
  REJECTED: ["destructive", "REJECTED"],
  DO_ASSIGNED: ["success", "DO_ASSIGNED"],
};
export function StatusBadge({ value }) {
  const [variant, label] = STATUS_MAP[value] || ["muted", value];
  return <Badge variant={variant}>{label}</Badge>;
}

const DOC_STATUS_MAP = {
  NOT_ATTACHED: ["muted", "NOT_ATTACHED"],
  PARTIAL_ATTACHED: ["warning", "PARTIAL_ATTACHED"],
  ATTACHED_COMPLETE: ["success", "ATTACHED_COMPLETE"],
  UNREADABLE: ["warning", "UNREADABLE"],
  MISMATCH: ["destructive", "MISMATCH"],
};
export function DocStatusBadge({ value }) {
  const [variant, label] = DOC_STATUS_MAP[value] || ["muted", value || "-"];
  return <Badge variant={variant}>{label}</Badge>;
}

export function AgingBadge({ info }) {
  if (!info) return null;
  const variant = info.level === "danger" ? "destructive" : info.level === "warning" ? "warning" : "muted";
  return <Badge variant={variant}>{info.text}</Badge>;
}

export function KpiCard({ value, label, sub }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1 p-5">
        <div className="text-2xl font-bold tabular-nums">{value}</div>
        <div className="text-xs font-medium text-muted-foreground">{label}</div>
        {sub && <div className="text-[11px] text-muted-foreground">{sub}</div>}
      </CardContent>
    </Card>
  );
}

export function RecentActivity({ logs, limit = 6 }) {
  const items = sortLogsDesc(logs).slice(0, limit);
  if (items.length === 0) {
    return <div className="py-6 text-center text-sm text-muted-foreground">ไม่มีกิจกรรมล่าสุด</div>;
  }
  return (
    <div className="divide-y">
      {items.map((l) => (
        <div key={l.id} className="flex items-start gap-2.5 py-2.5 first:pt-0 last:pb-0">
          <div className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-primary" />
          <div>
            <div className="text-[12.5px]">
              <b>{l.userName}</b> {ACTION_LABELS[l.action] || l.action}
            </div>
            <div className="text-[11px] text-muted-foreground">{fmt(l.at)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ icon: Icon, children }) {
  return (
    <div className="flex flex-col items-center gap-2 py-9 text-center text-sm text-muted-foreground">
      {Icon && <Icon className="h-7 w-7 opacity-60" />}
      <div>{children}</div>
    </div>
  );
}
