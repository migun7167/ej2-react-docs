import React, { useState } from "react";
import { Search } from "lucide-react";
import { useApp } from "../../context/AppContext.jsx";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card.jsx";
import { Button } from "../ui/button.jsx";
import { Input } from "../ui/input.jsx";
import StatusBarChart from "../charts/StatusBarChart.jsx";
import { KpiCard, RecentActivity, StatusBadge, EmptyState } from "../shared.jsx";
import { ACTION_LABELS, bucketCounts, fmt, sortLogsAsc } from "../../lib/domain.js";

export default function AotDashboard() {
  const { db, user } = useApp();
  const [mawbInput, setMawbInput] = useState("");
  const [mawbQuery, setMawbQuery] = useState("");

  const totalReviews = db.auditLog.filter((l) => l.action === "CUSTOMS_REVIEWED").length;
  const totalAssigned = db.requests.filter((r) => r.status === "DO_ASSIGNED").length;
  const shippedOut = db.requests.filter((r) => !!r.shippingId).length;

  const matches = mawbQuery ? db.requests.filter((r) => r.mawb === mawbQuery) : [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">ภาพรวมระบบ (AOT Oversight)</h1>
        <p className="text-sm text-muted-foreground">
          {user.name} · {user.position}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard value={db.requests.length} label="คำขอ DO ทั้งหมดในระบบ" />
        <KpiCard value={totalAssigned} label="Assign DO แล้ว" />
        <KpiCard value={shippedOut} label="มอบหมายผู้ขนส่งแล้ว" />
        <KpiCard value={totalReviews} label="ครั้งที่ Customs ตรวจสอบเอกสาร" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>ภาพรวม Pipeline ทั้งระบบ</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBarChart rows={bucketCounts(db.requests)} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>กิจกรรมล่าสุดทั้งระบบ</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivity logs={db.auditLog} limit={8} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ค้นหา Shipment Timeline</CardTitle>
          <CardDescription>กรอกเลข MAWB เพื่อดูลำดับเหตุการณ์ทั้งหมดของคำขอ DO ที่เกี่ยวข้อง (ใครทำอะไร เมื่อไหร่ ผลเป็นอย่างไร)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="เช่น 217-12345678"
                value={mawbInput}
                onChange={(e) => setMawbInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && setMawbQuery(mawbInput.trim())}
              />
            </div>
            <Button onClick={() => setMawbQuery(mawbInput.trim())}>ค้นหา Timeline</Button>
          </div>

          {mawbQuery && matches.length === 0 && <EmptyState>ไม่พบคำขอ DO สำหรับ MAWB นี้</EmptyState>}

          {matches.map((req) => {
            const entries = sortLogsAsc(
              db.auditLog.filter((l) => l.meta?.requestId === req.id || (req.shipmentId && l.meta?.shipmentId === req.shipmentId))
            );
            return (
              <div key={req.id} className="border-t pt-4 first:border-none first:pt-0">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-sm font-semibold">
                    {req.mawb}
                    {req.hawb ? ` / ${req.hawb}` : ""} <span className="font-normal text-muted-foreground">· Request ID {req.id}</span>
                  </div>
                  <StatusBadge value={req.status} />
                </div>
                {entries.length === 0 ? (
                  <EmptyState>ไม่มีเหตุการณ์บันทึกไว้</EmptyState>
                ) : (
                  <div className="divide-y">
                    {entries.map((l) => (
                      <div key={l.id} className="flex gap-3 py-1.5 text-[12.5px]">
                        <div className="w-32 flex-none text-[11px] text-muted-foreground">{fmt(l.at)}</div>
                        <div>
                          <span className="font-semibold">{l.userName}</span> ({l.role}) — {ACTION_LABELS[l.action] || l.action}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
