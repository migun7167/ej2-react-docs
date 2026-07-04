import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useApp } from "../../context/AppContext.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card.jsx";
import { Button } from "../ui/button.jsx";
import { Input } from "../ui/input.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select.jsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table.jsx";
import StatusBarChart from "../charts/StatusBarChart.jsx";
import { EntitlementBadge, StatusBadge, DocStatusBadge, AgingBadge, KpiCard, RecentActivity, EmptyState } from "../shared.jsx";
import { getShipment, getDocumentStatus, bucketCounts, avgTurnaroundHours, fmtHours, agingInfo, isToday } from "../../lib/domain.js";

export default function TmoDashboard() {
  const { db, user, openRequest } = useApp();
  const [q, setQ] = useState("");
  const [company, setCompany] = useState("ALL");

  const companies = db.users.filter((u) => u.role === "FORWARDER");

  const all = useMemo(() => {
    return db.requests.filter((r) => {
      if (company !== "ALL" && r.requesterCompany !== company) return false;
      if (q) {
        const hay = (r.mawb + " " + (r.hawb || "") + " " + (r.requesterCompany || "")).toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [db.requests, q, company]);

  const qScan = all.filter((r) => r.status === "PENDING_DOCUMENT_SCAN");
  const qReady = all.filter((r) => r.status === "READY_FOR_APPROVAL");
  const qReview = all.filter((r) => r.status === "MANUAL_REVIEW");
  const qDone = all.filter((r) => r.status === "DO_ASSIGNED");
  const approvedToday = db.requests.filter((r) => r.status === "DO_ASSIGNED" && isToday(r.assignedAt)).length;
  const avgApproval = avgTurnaroundHours(db.requests);

  function QueueTable({ list, emptyMsg }) {
    if (list.length === 0) return <EmptyState>{emptyMsg}</EmptyState>;
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>MAWB/HAWB</TableHead>
            <TableHead>Forwarder</TableHead>
            <TableHead>Consignee</TableHead>
            <TableHead>Entitlement</TableHead>
            <TableHead>Document</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Aging</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.map((r) => {
            const shipment = r.shipmentId ? getShipment(db, r.shipmentId) : null;
            const aging = agingInfo(r);
            const docStatus = getDocumentStatus(db, r);
            return (
              <TableRow key={r.id}>
                <TableCell>
                  <div className="font-semibold">{r.mawb}</div>
                  {r.hawb && <div className="text-xs text-muted-foreground">HAWB {r.hawb}</div>}
                </TableCell>
                <TableCell>{r.requesterCompany || "-"}</TableCell>
                <TableCell>{shipment ? shipment.consignee : "-"}</TableCell>
                <TableCell>
                  <EntitlementBadge value={r.entitlement} />
                </TableCell>
                <TableCell>{docStatus ? <DocStatusBadge value={docStatus} /> : "-"}</TableCell>
                <TableCell>
                  <StatusBadge value={r.status} />
                </TableCell>
                <TableCell>{aging ? <AgingBadge info={aging} /> : <span className="text-xs text-muted-foreground">-</span>}</TableCell>
                <TableCell>
                  <Button size="sm" onClick={() => openRequest(r.id)}>
                    เปิดคำขอ
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">คิวคำขอ DO</h1>
        <p className="text-sm text-muted-foreground">
          {user.name} · {user.position}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard value={qScan.length} label="รอ Scan เอกสาร" />
        <KpiCard value={qReview.length} label="Manual Review" />
        <KpiCard value={approvedToday} label="Assign DO วันนี้" />
        <KpiCard value={qDone.length} label="Assign DO แล้ว (ทั้งหมด)" sub={`เฉลี่ย ${fmtHours(avgApproval)} ต่อคำขอ`} />
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
            <RecentActivity logs={db.auditLog} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="flex flex-wrap gap-2 p-5">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-8" placeholder="ค้นหา MAWB / HAWB / บริษัท Forwarder" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Select value={company} onValueChange={setCompany}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">ทุกบริษัท Forwarder</SelectItem>
              {companies.map((c) => (
                <SelectItem key={c.id} value={c.company}>
                  {c.company}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>รอคลังสินค้า Scan เอกสารแนบเครื่อง</CardTitle>
        </CardHeader>
        <CardContent>
          <QueueTable list={qScan} emptyMsg="ไม่มีคำขอรอ Scan เอกสาร" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>รอการอนุมัติ (เอกสารครบ)</CardTitle>
        </CardHeader>
        <CardContent>
          <QueueTable list={qReady} emptyMsg="ไม่มีคำขอรออนุมัติ" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>ต้องตรวจสอบเพิ่มเติม (Manual Review)</CardTitle>
        </CardHeader>
        <CardContent>
          <QueueTable list={qReview} emptyMsg="ไม่มีคำขอที่ต้องตรวจสอบเพิ่มเติม" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Assign DO แล้ว (ล่าสุด)</CardTitle>
        </CardHeader>
        <CardContent>
          <QueueTable list={qDone.slice(0, 10)} emptyMsg="ยังไม่มี DO ที่ Assign" />
        </CardContent>
      </Card>
    </div>
  );
}
