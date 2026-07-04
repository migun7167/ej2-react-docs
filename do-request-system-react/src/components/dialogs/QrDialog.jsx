import React from "react";
import { useApp } from "../../context/AppContext.jsx";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog.jsx";
import { getShipment, qrCells } from "../../lib/domain.js";

export default function QrDialog() {
  const { db, showQrFor, setShowQrFor } = useApp();
  const req = showQrFor ? db.requests.find((r) => r.id === showQrFor) : null;
  const open = !!req && !!req.qrToken;
  if (!req || !open) return null;
  const shipment = getShipment(db, req.shipmentId);
  const cells = qrCells(req.qrToken);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && setShowQrFor(null)}>
      <DialogContent className="max-w-sm">
        <DialogTitle>QR Code สำหรับ Customs</DialogTitle>
        <div className="mx-auto grid grid-cols-[repeat(21,1fr)] gap-0 rounded-lg bg-white p-3.5 shadow" style={{ width: 231, height: 231 }}>
          {cells.map((on, i) => (
            <div key={i} className={on ? "bg-[#141414]" : "bg-transparent"} />
          ))}
        </div>
        <div className="text-center font-mono text-xl font-extrabold tracking-[0.2em]">{req.qrToken}</div>
        <div className="text-center">
          <div className="font-semibold">
            {req.mawb}
            {req.hawb ? ` / ${req.hawb}` : ""}
          </div>
          <div className="text-xs text-muted-foreground">
            DO No. {req.doRequestNo}
            {shipment ? ` · ${shipment.consignee}` : ""}
          </div>
        </div>
        <p className="text-center text-[11px] text-muted-foreground">
          QR Code จำลองสำหรับสาธิตระบบ — ในสภาพแวดล้อมนี้เจ้าหน้าที่ Customs ใช้กล้องมือถือส่องหน้าจอนี้ไม่ได้จริง กรุณาให้ Customs
          กรอกรหัสด้านบน หรือค้นหาด้วยเลข AWB แทน
        </p>
      </DialogContent>
    </Dialog>
  );
}
