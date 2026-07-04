import React, { useMemo } from "react";
import { Truck, QrCode, Eye } from "lucide-react";
import { useApp } from "../../context/AppContext.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card.jsx";
import { Button } from "../ui/button.jsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table.jsx";
import { KpiCard, EmptyState } from "../shared.jsx";
import { getShipment, fmt } from "../../lib/domain.js";

export default function ShippingDashboard() {
  const { db, user, shippingViewDocument, setShowQrFor } = useApp();
  const mine = useMemo(() => db.requests.filter((r) => r.shippingId === user.id), [db.requests, user.id]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">งานขนส่งของฉัน</h1>
        <p className="text-sm text-muted-foreground">
          {user.name} · {user.company}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard value={mine.length} label="งานที่ได้รับมอบหมายทั้งหมด" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายการ DO ที่ต้องไปรับสินค้า</CardTitle>
        </CardHeader>
        <CardContent>
          {mine.length === 0 ? (
            <EmptyState icon={Truck}>ยังไม่มีงานขนส่งที่ได้รับมอบหมาย — รอ Freight Forwarder มอบหมายงานจากหน้ารายละเอียดคำขอ DO</EmptyState>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>MAWB/HAWB</TableHead>
                  <TableHead>DO No.</TableHead>
                  <TableHead>Consignee</TableHead>
                  <TableHead>Forwarder</TableHead>
                  <TableHead>มอบหมายเมื่อ</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {mine.map((r) => {
                  const shipment = r.shipmentId ? getShipment(db, r.shipmentId) : null;
                  return (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div className="font-semibold">{r.mawb}</div>
                        {r.hawb && <div className="text-xs text-muted-foreground">HAWB {r.hawb}</div>}
                      </TableCell>
                      <TableCell>{r.doRequestNo || "-"}</TableCell>
                      <TableCell>{shipment ? shipment.consignee : "-"}</TableCell>
                      <TableCell>{r.requesterCompany || "-"}</TableCell>
                      <TableCell>{fmt(r.shippingAssignedAt)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => shippingViewDocument(r.id)}>
                            <Eye className="h-3.5 w-3.5" /> ดูเอกสาร (View Only)
                          </Button>
                          <Button size="sm" variant="gold" onClick={() => setShowQrFor(r.id)}>
                            <QrCode className="h-3.5 w-3.5" /> แสดง QR Code
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 text-sm text-muted-foreground">
          สิทธิ์ของ Shipping: ดูเอกสาร DO ได้แบบอ่านอย่างเดียว (View Document Only) และแสดง QR Code ให้เจ้าหน้าที่ศุลกากร (Customs)
          สแกน/กรอกรหัสเพื่อตรวจสอบเอกสารชุดเดียวกัน
        </CardContent>
      </Card>
    </div>
  );
}
