import React, { useState } from "react";
import { Check, X, FileText } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import { Card, CardContent } from "./ui/card.jsx";
import { Button } from "./ui/button.jsx";
import { Textarea } from "./ui/textarea.jsx";
import { Label } from "./ui/label.jsx";
import { Badge } from "./ui/badge.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select.jsx";
import { StatusBadge, EntitlementBadge, DocStatusBadge, EmptyState } from "./shared.jsx";
import { getShipment, decideSuggestion, fmt } from "../lib/domain.js";
import { cn } from "../lib/utils.js";

function TimelineDot({ state }) {
  const map = {
    ok: "border-success/40 bg-success/10 text-success",
    bad: "border-destructive/40 bg-destructive/10 text-destructive",
    warn: "border-warning/40 bg-warning/10 text-warning",
    pending: "border-border bg-muted text-muted-foreground",
  };
  return (
    <div className={cn("flex h-8 w-8 flex-none items-center justify-center rounded-full border-2 text-sm font-bold", map[state])}>
      {state === "ok" ? <Check className="h-4 w-4" /> : state === "bad" ? <X className="h-4 w-4" /> : null}
    </div>
  );
}

function TimelineItem({ state, num, title, children, isLast }) {
  return (
    <div className="relative flex gap-3.5 pb-5 last:pb-0">
      {!isLast && <div className="absolute left-4 top-8 h-full w-0.5 -translate-x-1/2 bg-border" />}
      <TimelineDot state={state}>{num}</TimelineDot>
      <div className="min-w-0 flex-1 pt-1">
        <div className="text-sm font-bold">{title}</div>
        <div className="mt-1 text-[13px]">{children}</div>
      </div>
    </div>
  );
}

function KV({ label, value }) {
  return (
    <div className="flex justify-between gap-3 text-[12.5px]">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function DocChecklist({ req, isTmo }) {
  const { attachDoc } = useApp();
  const editable = isTmo && !["DO_ASSIGNED", "REJECTED"].includes(req.status);
  const stateLabel = { missing: "ยังไม่แนบ", attached: "แนบแล้ว", unreadable: "อ่านไม่ออก", mismatch: "ไม่ตรงกับ Shipment" };
  const stateVariant = { missing: "muted", attached: "success", unreadable: "warning", mismatch: "destructive" };
  return (
    <div className="mt-2 space-y-2">
      {req.docChecklist.map((d, idx) => (
        <div key={idx} className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/40 px-3 py-2">
          <div>
            <div className="text-[13px] font-semibold">
              {d.type} {d.required ? <span className="text-destructive">*</span> : <span className="font-normal text-muted-foreground">(Recommended)</span>}
            </div>
            <div className="text-[11px] text-muted-foreground">{d.scannedBy ? `Scan โดย ${d.scannedBy} · ${fmt(d.scannedAt)}` : "ยังไม่มีการ Scan"}</div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={stateVariant[d.state]}>{stateLabel[d.state]}</Badge>
            {editable && (
              <div className="flex flex-wrap gap-1.5">
                <Button size="sm" variant="success" onClick={() => attachDoc(req.id, idx, "attached")}>
                  แนบ (OK)
                </Button>
                <Button size="sm" variant="warning" onClick={() => attachDoc(req.id, idx, "unreadable")}>
                  อ่านไม่ออก
                </Button>
                <Button size="sm" variant="destructive" onClick={() => attachDoc(req.id, idx, "mismatch")}>
                  ไม่ตรงกัน
                </Button>
                <Button size="sm" variant="outline" onClick={() => attachDoc(req.id, idx, "missing")}>
                  รีเซ็ต
                </Button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

const SUGGESTION_MAP = {
  APPROVE_READY: ["success", "ผ่านเงื่อนครบ – พร้อมอนุมัติ"],
  PENDING_DOCUMENT: ["muted", "รอเอกสารจากคลังสินค้า"],
  PENDING_STATUS: ["warning", "รอสถานะ Customs/Cargo พร้อม"],
  MANUAL_REVIEW: ["warning", "แนะนำให้ตรวจสอบเพิ่มเติม"],
  REJECT_OR_REVIEW: ["destructive", "เอกสารไม่ตรง – แนะนำปฏิเสธ/ส่งตรวจสอบ"],
  REJECT: ["destructive", "แนะนำปฏิเสธ"],
};

function DecisionPanel({ req, isTmo }) {
  const { db, makeDecision, showToast } = useApp();
  const [reason, setReason] = useState("");
  const sug = decideSuggestion(db, req);
  const [variant, label] = SUGGESTION_MAP[sug] || ["muted", sug];

  function run(decision) {
    const res = makeDecision(req.id, decision, reason);
    if (!res.ok) showToast(res.error, "error");
  }

  return (
    <div className="space-y-3">
      <div>
        ข้อเสนอเบื้องต้นจากระบบ: <Badge variant={variant}>{label}</Badge>
      </div>
      {isTmo && !["DO_ASSIGNED", "REJECTED"].includes(req.status) ? (
        <>
          <div className="max-w-md space-y-1">
            <Label>เหตุผล (จำเป็นสำหรับ Manual Review / Reject)</Label>
            <Textarea rows={2} placeholder="ระบุเหตุผล..." value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="success" disabled={sug !== "APPROVE_READY"} onClick={() => run("APPROVE")}>
              <Check className="h-3.5 w-3.5" /> Approve &amp; Assign DO
            </Button>
            <Button variant="warning" onClick={() => run("MANUAL_REVIEW")}>
              ส่งตรวจสอบเพิ่มเติม
            </Button>
            <Button variant="destructive" onClick={() => run("REJECT")}>
              <X className="h-3.5 w-3.5" /> Reject
            </Button>
          </div>
        </>
      ) : (
        !isTmo && <p className="text-xs text-muted-foreground">รอเจ้าหน้าที่คลังสินค้า (TMO) สแกนเอกสารและอนุมัติ</p>
      )}
    </div>
  );
}

function AssignShippingForm({ req }) {
  const { db, assignShipping } = useApp();
  const shippers = db.users.filter((u) => u.role === "SHIPPING");
  const [shippingId, setShippingId] = useState(shippers[0]?.id || "");

  return (
    <div className="space-y-3">
      <div className="max-w-sm space-y-1">
        <Label>เลือกผู้ขนส่ง (Shipping)</Label>
        <Select value={shippingId} onValueChange={setShippingId}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {shippers.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name} – {s.company}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button size="sm" onClick={() => assignShipping(req.id, shippingId)}>
        มอบหมายงานขนส่ง
      </Button>
    </div>
  );
}

export default function RequestDetail() {
  const { db, user, activeRequestId, setShowDoFor } = useApp();
  const req = db.requests.find((r) => r.id === activeRequestId);
  if (!req) return <EmptyState>ไม่พบคำขอที่ระบุ</EmptyState>;

  const isTmo = user.role === "TMO";
  const canSee = isTmo || user.role === "AOT" || req.requesterId === user.id;
  if (!canSee) return <EmptyState>ไม่มีสิทธิ์ดูคำขอนี้</EmptyState>;

  const shipment = req.shipmentId ? getShipment(db, req.shipmentId) : null;
  const isOwnerForwarder = user.role === "FORWARDER" && req.requesterId === user.id;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">
            คำขอ DO – {req.mawb}
            {req.hawb ? ` / ${req.hawb}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground">
            Request ID: {req.id} · ส่งคำขอโดย {req.requesterName} ({req.requesterCompany || "-"})
          </p>
        </div>
        <StatusBadge value={req.status} />
      </div>

      <Card>
        <CardContent className="p-5">
          <TimelineItem state="ok" num="1" title="Freight ส่งคำขอ">
            MAWB {req.mawb} {req.hawb ? `/ HAWB ${req.hawb}` : "(ไม่มี HAWB)"} · {fmt(req.createdAt)}
          </TimelineItem>

          {shipment ? (
            <TimelineItem state="ok" num="2" title="ระบบพบ Shipment">
              <div className="mb-2">
                {shipment.type} · Consignee: {shipment.consignee}
              </div>
              <div className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-3">
                <KV label="Flight/Date" value={`${shipment.flight} · ${shipment.flightDate}`} />
                <KV label="Route" value={`${shipment.origin} → ${shipment.destination}`} />
                <KV label="Pieces/Weight" value={`${shipment.pieces} PCS / ${shipment.weight}`} />
                <KV label="Goods" value={shipment.goods} />
                <KV label="Customs" value={shipment.customsStatus} />
                <KV label="Cargo" value={shipment.cargoStatus} />
              </div>
            </TimelineItem>
          ) : req.status === "SHIPMENT_NOT_FOUND" ? (
            <TimelineItem state="bad" num="2" title="ระบบไม่พบ Shipment">
              {req.decisionReason}
            </TimelineItem>
          ) : (
            <TimelineItem state="warn" num="2" title="พบ Shipment หลายรายการ (Ambiguous)">
              {req.decisionReason}
            </TimelineItem>
          )}

          {req.entitlement ? (
            <TimelineItem state={req.entitlement === "FAIL" ? "bad" : "ok"} num="3" title="ตรวจสิทธิ์ (Entitlement)">
              <EntitlementBadge value={req.entitlement} />
              {req.entitlement === "FAIL" && <div className="mt-1.5">{req.decisionReason}</div>}
            </TimelineItem>
          ) : (
            <TimelineItem state="pending" num="3" title="ตรวจสิทธิ์ (Entitlement)">
              ยังไม่ถึงขั้นตอนนี้
            </TimelineItem>
          )}

          {req.docChecklist?.length ? (
            <TimelineItem
              state={req.documentStatus === "ATTACHED_COMPLETE" ? "ok" : req.documentStatus === "NOT_ATTACHED" ? "pending" : "warn"}
              num="4"
              title="คลังสินค้า Scan และแนบเอกสาร"
            >
              <DocStatusBadge value={req.documentStatus} />
              <DocChecklist req={req} isTmo={isTmo} />
            </TimelineItem>
          ) : (
            <TimelineItem state="pending" num="4" title="คลังสินค้า Scan และแนบเอกสาร">
              ยังไม่ถึงขั้นตอนนี้
            </TimelineItem>
          )}

          {req.finalDecision ? (
            <TimelineItem state={req.finalDecision === "APPROVED" ? "ok" : "bad"} num="5" title="ผลการตัดสินใจ">
              <b>{req.finalDecision}</b> โดย {req.decisionBy} · {fmt(req.decisionAt)}
              <div className="mt-1.5">{req.decisionReason}</div>
            </TimelineItem>
          ) : req.shipmentId && req.entitlement && req.entitlement !== "FAIL" ? (
            <TimelineItem state="pending" num="5" title="ผลการตัดสินใจ">
              <DecisionPanel req={req} isTmo={isTmo} />
            </TimelineItem>
          ) : (
            <TimelineItem state="pending" num="5" title="ผลการตัดสินใจ">
              ยังไม่ถึงขั้นตอนนี้
            </TimelineItem>
          )}

          {req.status === "DO_ASSIGNED" ? (
            <TimelineItem state="ok" num="6" title="Assign DO">
              DO No. <b>{req.doRequestNo}</b> · Assigned to {req.assignedTo} · {fmt(req.assignedAt)}
              <div className="mt-2.5">
                <Button size="sm" variant="gold" onClick={() => setShowDoFor(req.id)}>
                  <FileText className="h-3.5 w-3.5" /> เปิดเอกสาร DO
                </Button>
              </div>
            </TimelineItem>
          ) : (
            <TimelineItem state="pending" num="6" title="Assign DO" isLast>
              ยังไม่ถึงขั้นตอนนี้
            </TimelineItem>
          )}

          {req.status === "DO_ASSIGNED" &&
            (req.shippingId ? (
              <TimelineItem state="ok" num="7" title="มอบหมายผู้ขนส่ง (Shipping)" isLast>
                มอบหมายให้ <b>{req.shippingName}</b> โดย {req.shippingAssignedBy} · {fmt(req.shippingAssignedAt)}
                <div className="mt-1.5">
                  QR Token: <b>{req.qrToken}</b> (ให้ Customs สแกน/กรอกรหัสนี้เพื่อตรวจสอบเอกสาร)
                </div>
              </TimelineItem>
            ) : isOwnerForwarder ? (
              <TimelineItem state="pending" num="7" title="มอบหมายผู้ขนส่ง (Shipping)" isLast>
                <AssignShippingForm req={req} />
              </TimelineItem>
            ) : (
              <TimelineItem state="pending" num="7" title="มอบหมายผู้ขนส่ง (Shipping)" isLast>
                รอ Freight Forwarder มอบหมายผู้ขนส่ง (Shipping)
              </TimelineItem>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
