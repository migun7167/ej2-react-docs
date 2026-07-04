import React, { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card.jsx";
import { Button } from "../ui/button.jsx";
import { Input } from "../ui/input.jsx";
import { Label } from "../ui/label.jsx";
import { Badge } from "../ui/badge.jsx";
import { EntitlementBadge } from "../shared.jsx";

const SAMPLES = [
  { mawb: "217-12345678", hawb: "", title: "217-12345678", note: 'Master – คาดว่าผ่าน PASS_MASTER ทันที (ลองด้วย Kerry)' },
  { mawb: "217-88990011", hawb: "THB-556677", title: "217-88990011 / THB-556677", note: "House – PASS_HOUSE (ลองด้วย DHL)" },
  { mawb: "217-45671234", hawb: "", title: "217-45671234", note: "Master – PASS_DELEGATED (ลองด้วย Kerry)" },
  { mawb: "217-99887766", hawb: "", title: "217-99887766", note: "Customs HELD – Pending Status (ลองด้วย ABC)" },
  { mawb: "217-77778888", hawb: "", title: "217-77778888", note: "ไม่ระบุ HAWB – Ambiguous / Manual Review" },
  { mawb: "217-77778888", hawb: "THB-100200", title: "217-77778888 / THB-100200", note: "House – PASS_HOUSE (ลองด้วย Kerry)" },
  { mawb: "217-00000000", hawb: "", title: "217-00000000", note: "ไม่มีในระบบ – Not Found / Reject" },
  { mawb: "217-30099001", hawb: "", title: "217-30099001", note: "TMO แนบเอกสารไว้ล่วงหน้าแล้ว – ข้าม Pending Document Scan ไปที่การอนุมัติทันที (ลองด้วย Kerry)" },
];

export default function NewRequest() {
  const { user, previewSearch, submitRequest, openRequest, showToast } = useApp();
  const [mawb, setMawb] = useState("");
  const [hawb, setHawb] = useState("");
  const [result, setResult] = useState(null);

  function doSearch() {
    if (!mawb.trim()) {
      showToast("กรุณากรอกเลข MAWB", "error");
      return;
    }
    setResult(previewSearch(mawb.trim(), hawb.trim()));
  }

  function fillSample(s) {
    setMawb(s.mawb);
    setHawb(s.hawb);
    setResult(null);
  }

  function doSubmit() {
    submitRequest(mawb.trim(), hawb.trim());
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">ขอ DO ใหม่</h1>
        <p className="text-sm text-muted-foreground">กรอกเฉพาะ MAWB (จำเป็น) และ HAWB (ถ้ามี) ระบบจะดึงข้อมูล Consignee / Flight / Status ให้อัตโนมัติ</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-4 p-5">
            <div className="space-y-1">
              <Label htmlFor="mawb">
                MAWB No. <span className="text-destructive">*</span>
              </Label>
              <Input id="mawb" placeholder="เช่น 217-12345678" value={mawb} onChange={(e) => setMawb(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="hawb">HAWB No. (ถ้ามี)</Label>
              <Input id="hawb" placeholder="เช่น THB-556677" value={hawb} onChange={(e) => setHawb(e.target.value)} />
            </div>
            <Button className="w-full" onClick={doSearch}>
              ค้นหา Shipment
            </Button>
            <p className="text-xs text-muted-foreground">
              สิ่งที่ระบบจะตรวจสอบเอง: Consignee, Freight Company/Tax ID, Delegation, Customs/Cargo Status, DO ซ้ำ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">ตัวอย่างสำหรับทดสอบ (กดเพื่อกรอกอัตโนมัติ)</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {SAMPLES.map((s) => (
              <button
                key={s.title}
                onClick={() => fillSample(s)}
                className="rounded-md border border-dashed px-3 py-2 text-left text-[11.5px] transition-colors hover:border-primary hover:bg-accent"
              >
                <div className="text-xs font-semibold">{s.title}</div>
                <div className="text-muted-foreground">{s.note}</div>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      {result && (
        <Card>
          <CardContent className="p-5">
            {result.kind === "not_found" && (
              <div className="space-y-3">
                <Badge variant="destructive">SHIPMENT_NOT_FOUND</Badge>
                <p className="text-sm">ไม่พบ Shipment ที่ตรงกับ MAWB/HAWB ที่ระบุ – คำขอจะถูกปฏิเสธโดยอัตโนมัติหากส่งคำขอ</p>
                <Button variant="destructive" onClick={doSubmit}>
                  ส่งคำขอ (จะถูกปฏิเสธอัตโนมัติ)
                </Button>
              </div>
            )}
            {result.kind === "ambiguous" && (
              <div className="space-y-3">
                <Badge variant="warning">MANUAL_REVIEW – Ambiguous</Badge>
                <p className="text-sm">พบ Shipment {result.count} รายการภายใต้ MAWB นี้ กรุณาระบุ HAWB ให้ชัดเจน หรือส่งเข้า Manual Review</p>
                <Button variant="warning" onClick={doSubmit}>
                  ส่งเข้า Manual Review
                </Button>
              </div>
            )}
            {result.kind === "duplicate" && (
              <div className="space-y-3">
                <Badge variant="warning">DUPLICATE</Badge>
                <p className="text-sm">มีคำขอ DO อยู่แล้วสำหรับ Shipment นี้ – ระบบห้ามออก DO ซ้ำ</p>
                <Button variant="outline" onClick={() => openRequest(result.existing.id)}>
                  ดูคำขอที่มีอยู่แล้ว
                </Button>
              </div>
            )}
            {result.kind === "ok" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">ผลการค้นหา Shipment</CardTitle>
                  <Badge variant="success">SHIPMENT_FOUND</Badge>
                </div>
                <div className="grid grid-cols-1 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-3">
                  <KV label="Consignee" value={result.shipment.consignee} />
                  <KV label="Flight / Date" value={`${result.shipment.flight} · ${result.shipment.flightDate}`} />
                  <KV label="Route" value={`${result.shipment.origin} → ${result.shipment.destination}`} />
                  <KV label="Type" value={result.shipment.type} />
                  <KV label="Pieces / Weight" value={`${result.shipment.pieces} PCS / ${result.shipment.weight}`} />
                  <KV label="Goods" value={result.shipment.goods} />
                  <KV label="Customs Status" value={result.shipment.customsStatus} />
                  <KV label="Cargo Status" value={result.shipment.cargoStatus} />
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">ผลการตรวจสอบสิทธิ์ (Entitlement)</CardTitle>
                  <EntitlementBadge value={result.entitlement} />
                </div>
                {result.entitlement === "FAIL" ? (
                  <div className="space-y-3">
                    <p className="text-sm text-destructive">
                      บัญชี {user.company} (Tax ID {user.taxId}) ไม่ตรงกับ Consignee ของ Shipment นี้ และไม่มี Delegation ที่ถูกต้อง –
                      คำขอจะถูกปฏิเสธโดยอัตโนมัติ
                    </p>
                    <Button variant="destructive" onClick={doSubmit}>
                      ส่งคำขอ (จะถูกปฏิเสธ)
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-success">ผ่านการตรวจสิทธิ์เบื้องต้น – ขั้นตอนถัดไปคือรอคลังสินค้า (TMO) Scan และแนบเอกสารก่อนอนุมัติ</p>
                    <Button variant="success" onClick={doSubmit}>
                      ยืนยันส่งคำขอ DO
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function KV({ label, value }) {
  return (
    <div className="flex justify-between gap-3 border-b py-1 sm:border-none sm:py-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-right">{value}</span>
    </div>
  );
}
