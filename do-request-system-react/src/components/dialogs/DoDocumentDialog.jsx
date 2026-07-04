import React from "react";
import { Printer, Plane } from "lucide-react";
import { useApp } from "../../context/AppContext.jsx";
import { Dialog, DialogContent } from "../ui/dialog.jsx";
import { Button } from "../ui/button.jsx";
import { Badge } from "../ui/badge.jsx";
import { getShipment, computeDocStatus, fmt } from "../../lib/domain.js";
import { nowIso } from "../../lib/db.js";

const WATERMARK_LINE = "SAMPLE / MOCKUP  •  AOT DO SYSTEM  •  NOT A REAL DOCUMENT";

function Watermark() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute left-[-40%] top-[-30%] w-[180%] select-none text-center text-xl font-extrabold leading-[62px] tracking-wide text-red-900/10"
        style={{ transform: "rotate(-27deg)" }}
      >
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i}>{WATERMARK_LINE}</div>
        ))}
      </div>
    </div>
  );
}

function KV({ label, value }) {
  return (
    <div className="flex justify-between gap-3 py-0.5 text-[12px]">
      <span className="text-[#5a5040]">{label}</span>
      <span className="text-right font-bold text-[#20201d]">{value}</span>
    </div>
  );
}

export default function DoDocumentDialog() {
  const { db, showDoFor, setShowDoFor } = useApp();
  const req = showDoFor ? db.requests.find((r) => r.id === showDoFor) : null;
  const open = !!req && req.status === "DO_ASSIGNED";
  if (!req || !open) return null;
  const s = getShipment(db, req.shipmentId);
  const approver = db.users.find((u) => u.name === req.decisionBy);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && setShowDoFor(null)}>
      <DialogContent className="max-w-3xl p-0" hideClose>
        <div className="no-print flex items-center justify-between border-b px-5 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            เอกสาร Delivery Order <Badge variant="success">DO_ASSIGNED</Badge>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => window.print()}>
              <Printer className="h-3.5 w-3.5" /> พิมพ์ / Save PDF
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowDoFor(null)}>
              ปิด
            </Button>
          </div>
        </div>

        <div className="max-h-[75vh] overflow-y-auto bg-muted/40 p-5">
          <div className="do-print-area relative overflow-hidden rounded-md border border-[#d8cfa8] bg-[#fdfaf3] p-7 pb-24 text-[#20201d] shadow-lg">
            <Watermark />

            <div className="relative z-10 mb-3.5 flex items-stretch justify-between gap-3.5 border-b-[3px] border-[#7a1f2b] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-11 w-11 flex-none items-center justify-center rounded-full border-2 border-[#7a5b17] bg-gradient-to-br from-[#e6c877] to-[#a9821f] text-[#1a1a1a]">
                  <Plane className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[13.5px] font-extrabold text-[#0a3d67]">AOT Cargo Community System</div>
                  <div className="text-[10.5px] text-[#4a5a68]">Airports of Thailand Public Company Limited</div>
                </div>
              </div>
              <div className="min-w-[210px] rounded-lg bg-gradient-to-r from-[#5e1530] via-[#7a1f2b] to-[#9c3a2a] px-4 py-2 text-right text-[#f6e6c2]">
                <div className="text-[14.5px] font-extrabold tracking-wide">THAI AIRWAYS CARGO</div>
                <div className="mt-0.5 text-[10px] text-[#f0d9a0]">DELIVERY ORDER – Standard Air Cargo Format</div>
              </div>
            </div>

            <div className="relative z-10 mb-3 flex items-baseline justify-between">
              <h1 className="text-base font-extrabold tracking-wide text-[#3a2a10]">DELIVERY ORDER</h1>
              <div className="text-[13.5px] font-extrabold text-[#7a1f2b]">No. {req.doRequestNo}</div>
            </div>

            <div className="relative z-10 mb-3.5 grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-[#d8cfa8] bg-white/55 p-3">
                <h4 className="mb-2 border-b border-dashed border-[#d8cfa8] pb-1 text-[11.5px] font-bold uppercase tracking-wide text-[#7a1f2b]">
                  Shipment Information
                </h4>
                <KV label="MAWB No." value={req.mawb} />
                <KV label="HAWB No." value={req.hawb || "-"} />
                <KV label="Flight / Date" value={`${s.flight} / ${s.flightDate}`} />
                <KV label="Origin → Destination" value={`${s.origin} → ${s.destination}`} />
                <KV label="Shipment Type" value={s.type} />
                <KV label="Storage Location" value={s.storage} />
              </div>
              <div className="rounded-lg border border-[#d8cfa8] bg-white/55 p-3">
                <h4 className="mb-2 border-b border-dashed border-[#d8cfa8] pb-1 text-[11.5px] font-bold uppercase tracking-wide text-[#7a1f2b]">
                  Consignee / Notify Party
                </h4>
                <KV label="Consignee" value={s.consignee} />
                <KV label="Consignee Tax ID" value={s.consigneeTaxId} />
                <KV label="Notify Party (Forwarder)" value={req.requesterCompany} />
                <KV label="Forwarder Tax ID" value={req.requesterTaxId} />
                <KV label="Entitlement" value={req.entitlement} />
              </div>
            </div>

            <table className="relative z-10 mb-3.5 w-full border-collapse text-[12px]">
              <thead>
                <tr className="bg-[#efe6c9]">
                  <th className="border border-[#d8cfa8] px-2 py-1.5 text-left">Pieces</th>
                  <th className="border border-[#d8cfa8] px-2 py-1.5 text-left">Gross Weight</th>
                  <th className="border border-[#d8cfa8] px-2 py-1.5 text-left">Description of Goods</th>
                  <th className="border border-[#d8cfa8] px-2 py-1.5 text-left">Storage Location</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-[#d8cfa8] px-2 py-1.5">{s.pieces} PCS</td>
                  <td className="border border-[#d8cfa8] px-2 py-1.5">{s.weight}</td>
                  <td className="border border-[#d8cfa8] px-2 py-1.5">{s.goods}</td>
                  <td className="border border-[#d8cfa8] px-2 py-1.5">{s.storage}</td>
                </tr>
              </tbody>
            </table>

            <div className="relative z-10 mb-3.5 flex flex-wrap gap-2">
              <Badge variant="default">Customs: {s.customsStatus}</Badge>
              <Badge variant="default">Cargo: {s.cargoStatus}</Badge>
              <Badge variant="success">Document: {computeDocStatus(s)}</Badge>
              <Badge variant="success">DO Status: ASSIGNED</Badge>
            </div>

            <div className="relative z-10 mb-4 min-h-[40px] rounded-lg border border-dashed border-[#c8b98a] p-3 text-[11.8px] text-[#4a3f2a]">
              <b>Delivery Instructions / Remarks:</b> กรุณานำเอกสารฉบับนี้แสดงต่อเจ้าหน้าที่คลังสินค้า AOT เพื่อรับสินค้าออกจากคลังสินค้า
              เอกสารต้นฉบับต้องตรงกันกับข้อมูลในระบบจึงจะสามารถเบิกสินค้าได้
            </div>

            <div className="relative z-10 mb-3 grid grid-cols-2 gap-5 text-[11.8px]">
              <div>
                Issued &amp; Approved by:
                <div className="mt-8 border-t border-[#7a6a40] pt-1">
                  {req.decisionBy}
                  {approver ? ` (${approver.staffId})` : ""} — {fmt(req.decisionAt)}
                </div>
              </div>
              <div>
                Received by (ผู้รับสินค้า / พนักงานขนส่ง):
                <div className="mt-8 border-t border-[#7a6a40] pt-1">ชื่อ _____________________ วันที่ _____________</div>
              </div>
            </div>

            <div
              className="absolute bottom-[118px] right-11 z-20 flex h-[132px] w-[132px] flex-col items-center justify-center rounded-full border-4 border-double border-[#b3261e] text-center font-extrabold text-[#b3261e] opacity-90 mix-blend-multiply"
              style={{ transform: "rotate(-13deg)" }}
            >
              <div className="text-base">APPROVED</div>
              <div className="mt-0.5 text-[8px] tracking-wide">DO ASSIGNED</div>
              <div className="mt-1.5 text-center text-[7.5px] leading-tight">
                {req.decisionBy}
                <br />
                {fmt(req.decisionAt)}
              </div>
            </div>

            <div className="relative z-10 flex flex-wrap justify-between gap-3 border-t border-dashed border-[#c8b98a] pt-2.5 text-[9.6px] text-[#6a604a]">
              <div className="font-mono text-xl tracking-tighter text-[#2a2a2a]">|‖|‖||‖‖|‖|||‖||‖|</div>
              <div>
                Ref: {req.doRequestNo} · Generated {fmt(nowIso())}
                <br />
                <b>เอกสารนี้จัดทำขึ้นเพื่อสาธิตการออกแบบระบบ (UI/UX Prototype) เท่านั้น ไม่ใช่เอกสารทางการของสายการบินหรือหน่วยงานใด และไม่มีผลผูกพันทางกฎหมาย</b>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
