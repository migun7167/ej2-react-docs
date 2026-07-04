import React, { useMemo, useState } from "react";
import { Package, Search } from "lucide-react";
import { useApp } from "../../context/AppContext.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card.jsx";
import { Button } from "../ui/button.jsx";
import { Input } from "../ui/input.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select.jsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table.jsx";
import StatusBarChart from "../charts/StatusBarChart.jsx";
import { EntitlementBadge, StatusBadge, AgingBadge, KpiCard, RecentActivity, EmptyState } from "../shared.jsx";
import { getShipment, bucketOf, bucketCounts, avgTurnaroundHours, fmtHours, agingInfo, fmt } from "../../lib/domain.js";

export default function ForwarderDashboard() {
  const { db, user, goto, openRequest } = useApp();
  const [q, setQ] = useState("");
  const [bucket, setBucket] = useState("ALL");

  const mine = useMemo(() => db.requests.filter((r) => r.requesterId === user.id), [db.requests, user.id]);
  const kAll = mine.length;
  const kPending = mine.filter((r) => ["PENDING_DOCUMENT_SCAN", "READY_FOR_APPROVAL"].includes(r.status)).length;
  const kReview = mine.filter((r) => r.status === "MANUAL_REVIEW").length;
  const kAssigned = mine.filter((r) => r.status === "DO_ASSIGNED").length;
  const avgTurn = avgTurnaroundHours(mine);

  const filtered = mine.filter((r) => {
    if (bucket !== "ALL" && bucketOf(r.status) !== bucket) return false;
    if (q) {
      const hay = (r.mawb + " " + (r.hawb || "")).toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  const myReqIds = mine.map((r) => r.id);
  const myLogs = db.auditLog.filter((l) => l.userId === user.id || (l.meta?.requestId && myReqIds.includes(l.meta.requestId)));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">แดชบอร์ดของฉัน</h1>
          <p className="text-sm text-muted-foreground">
            {user.company} · Tax ID {user.taxId}
          </p>
        </div>
        <Button onClick={() => goto("new-request")}>+ ขอ DO ใหม่</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard value={kAll} label="คำขอทั้งหมด" />
        <KpiCard value={kPending} label="กำลังดำเนินการ" />
        <KpiCard value={kReview} label="รอตรวจสอบเพิ่มเติม" />
        <KpiCard value={kAssigned} label="Assign DO แล้ว" sub={`เฉลี่ย ${fmtHours(avgTurn)} จนถึง Assign`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>สัดส่วนคำขอตามสถานะ</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBarChart rows={bucketCounts(mine)} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>กิจกรรมล่าสุด</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivity logs={myLogs} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายการคำขอ DO ของฉัน</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-8" placeholder="ค้นหา MAWB / HAWB" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <Select value={bucket} onValueChange={setBucket}>
              <SelectTrigger className="w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">ทุกสถานะ</SelectItem>
                <SelectItem value="ACTIVE">กำลังดำเนินการ</SelectItem>
                <SelectItem value="REVIEW">รอตรวจสอบเพิ่มเติม</SelectItem>
                <SelectItem value="ASSIGNED">Assign DO แล้ว</SelectItem>
                <SelectItem value="REJECTED">ถูกปฏิเสธ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {mine.length === 0 ? (
            <EmptyState icon={Package}>ยังไม่มีคำขอ DO – กด "+ ขอ DO ใหม่" เพื่อเริ่มต้น</EmptyState>
          ) : filtered.length === 0 ? (
            <EmptyState>ไม่พบคำขอที่ตรงกับเงื่อนไขการค้นหา</EmptyState>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>MAWB/HAWB</TableHead>
                  <TableHead>Consignee</TableHead>
                  <TableHead>Entitlement</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Age / Updated</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => {
                  const shipment = r.shipmentId ? getShipment(db, r.shipmentId) : null;
                  const aging = agingInfo(r);
                  return (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div className="font-semibold">{r.mawb}</div>
                        {r.hawb && <div className="text-xs text-muted-foreground">HAWB {r.hawb}</div>}
                      </TableCell>
                      <TableCell>{shipment ? shipment.consignee : "-"}</TableCell>
                      <TableCell>
                        <EntitlementBadge value={r.entitlement} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge value={r.status} />
                      </TableCell>
                      <TableCell>{aging ? <AgingBadge info={aging} /> : <span className="text-xs text-muted-foreground">{fmt(r.updatedAt)}</span>}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => openRequest(r.id)}>
                          ดูรายละเอียด
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
