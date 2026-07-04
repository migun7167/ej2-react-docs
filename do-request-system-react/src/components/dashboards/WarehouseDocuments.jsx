import React, { useMemo, useState } from "react";
import { Search, FileStack, Settings2 } from "lucide-react";
import { useApp } from "../../context/AppContext.jsx";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card.jsx";
import { Button } from "../ui/button.jsx";
import { Input } from "../ui/input.jsx";
import { Badge } from "../ui/badge.jsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table.jsx";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../ui/dialog.jsx";
import { KpiCard, DocStatusBadge, StatusBadge, EmptyState } from "../shared.jsx";
import { computeDocStatus, fmt } from "../../lib/domain.js";

function ShipmentDocDialog({ shipmentId, onClose }) {
  const { db, attachShipmentDoc } = useApp();
  const shipment = db.shipments.find((s) => s.id === shipmentId);
  if (!shipment) return null;

  const linkedRequests = db.requests.filter((r) => r.shipmentId === shipmentId);
  const locked = linkedRequests.some((r) => r.status === "DO_ASSIGNED");
  const stateLabel = { missing: "ยังไม่แนบ", attached: "แนบแล้ว", unreadable: "อ่านไม่ออก", mismatch: "ไม่ตรงกับ Shipment" };
  const stateVariant = { missing: "muted", attached: "success", unreadable: "warning", mismatch: "destructive" };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogTitle>
          จัดการเอกสาร — {shipment.mawb}
          {shipment.hawb ? ` / ${shipment.hawb}` : ""}
        </DialogTitle>
        <DialogDescription>
          {shipment.consignee} · {shipment.flight} · {shipment.flightDate}
        </DialogDescription>

        <div className="flex flex-wrap items-center gap-2">
          <DocStatusBadge value={computeDocStatus(shipment)} />
          {linkedRequests.length === 0 ? (
            <Badge variant="muted">ยังไม่มีคำขอ DO</Badge>
          ) : (
            linkedRequests.map((r) => (
              <Badge key={r.id} variant="outline">
                คำขอ {r.mawb}: <StatusBadge value={r.status} />
              </Badge>
            ))
          )}
        </div>

        {locked && (
          <p className="text-xs text-warning">DO ของ Shipment นี้ถูก Assign แล้ว — ล็อกเอกสารไม่ให้แก้ไขเพิ่มเติม</p>
        )}

        <div className="space-y-2">
          {shipment.docChecklist.map((d, idx) => (
            <div key={idx} className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/40 px-3 py-2">
              <div>
                <div className="text-[13px] font-semibold">
                  {d.type}{" "}
                  {d.required ? <span className="text-destructive">*</span> : <span className="font-normal text-muted-foreground">(Recommended)</span>}
                </div>
                <div className="text-[11px] text-muted-foreground">{d.scannedBy ? `Scan โดย ${d.scannedBy} · ${fmt(d.scannedAt)}` : "ยังไม่มีการ Scan"}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={stateVariant[d.state]}>{stateLabel[d.state]}</Badge>
                {!locked && (
                  <div className="flex flex-wrap gap-1.5">
                    <Button size="sm" variant="success" onClick={() => attachShipmentDoc(shipment.id, idx, "attached")}>
                      แนบ (OK)
                    </Button>
                    <Button size="sm" variant="warning" onClick={() => attachShipmentDoc(shipment.id, idx, "unreadable")}>
                      อ่านไม่ออก
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => attachShipmentDoc(shipment.id, idx, "mismatch")}>
                      ไม่ตรงกัน
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => attachShipmentDoc(shipment.id, idx, "missing")}>
                      รีเซ็ต
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function WarehouseDocuments() {
  const { db } = useApp();
  const [q, setQ] = useState("");
  const [onlyIncomplete, setOnlyIncomplete] = useState(true);
  const [openShipmentId, setOpenShipmentId] = useState(null);

  const withStatus = useMemo(
    () => db.shipments.map((s) => ({ shipment: s, docStatus: computeDocStatus(s), requests: db.requests.filter((r) => r.shipmentId === s.id) })),
    [db.shipments, db.requests]
  );

  const totalIncomplete = withStatus.filter((x) => x.docStatus !== "ATTACHED_COMPLETE").length;
  const totalNoRequest = withStatus.filter((x) => x.requests.length === 0).length;

  const filtered = withStatus.filter(({ shipment, docStatus }) => {
    if (onlyIncomplete && docStatus === "ATTACHED_COMPLETE") return false;
    if (q) {
      const hay = (shipment.mawb + " " + (shipment.hawb || "") + " " + shipment.consignee).toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">เอกสารคลังสินค้า</h1>
        <p className="text-sm text-muted-foreground">แนบ/สแกนเอกสารของ Shipment ได้ทันทีที่สินค้าถึงคลัง โดยไม่ต้องรอ Freight ส่งคำขอ DO ก่อน</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard value={db.shipments.length} label="Shipment ทั้งหมดในระบบ" />
        <KpiCard value={totalIncomplete} label="เหลือที่ยังไม่แนบเอกสารครบ" />
        <KpiCard value={db.shipments.length - totalIncomplete} label="แนบเอกสารครบแล้ว" />
        <KpiCard value={totalNoRequest} label="ยังไม่มีคำขอ DO" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileStack className="h-4 w-4" /> รายการ Shipment
          </CardTitle>
          <CardDescription>งานที่ยังไม่แนบเอกสารครบจะแสดงก่อนตามค่าเริ่มต้น</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-8" placeholder="ค้นหา MAWB / HAWB / Consignee" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={onlyIncomplete} onChange={(e) => setOnlyIncomplete(e.target.checked)} className="h-4 w-4 rounded border-input" />
              แสดงเฉพาะที่ยังไม่แนบครบ
            </label>
          </div>

          {filtered.length === 0 ? (
            <EmptyState>{onlyIncomplete ? "ไม่มี Shipment ที่ค้างเอกสาร — เอกสารครบทุกรายการแล้ว" : "ไม่พบ Shipment ที่ตรงกับเงื่อนไข"}</EmptyState>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>MAWB/HAWB</TableHead>
                  <TableHead>Consignee</TableHead>
                  <TableHead>Flight</TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead>คำขอ DO</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(({ shipment, docStatus, requests }) => (
                  <TableRow key={shipment.id}>
                    <TableCell>
                      <div className="font-semibold">{shipment.mawb}</div>
                      {shipment.hawb && <div className="text-xs text-muted-foreground">HAWB {shipment.hawb}</div>}
                    </TableCell>
                    <TableCell>{shipment.consignee}</TableCell>
                    <TableCell>
                      {shipment.flight} · {shipment.flightDate}
                    </TableCell>
                    <TableCell>
                      <DocStatusBadge value={docStatus} />
                    </TableCell>
                    <TableCell>{requests.length === 0 ? <Badge variant="muted">ยังไม่มีคำขอ</Badge> : requests.map((r) => <StatusBadge key={r.id} value={r.status} />)}</TableCell>
                    <TableCell>
                      <Button size="sm" onClick={() => setOpenShipmentId(shipment.id)}>
                        <Settings2 className="h-3.5 w-3.5" /> จัดการเอกสาร
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {openShipmentId && <ShipmentDocDialog shipmentId={openShipmentId} onClose={() => setOpenShipmentId(null)} />}
    </div>
  );
}
