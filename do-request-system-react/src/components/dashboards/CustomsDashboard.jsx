import React, { useState } from "react";
import { Search, ScanLine } from "lucide-react";
import { useApp } from "../../context/AppContext.jsx";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card.jsx";
import { Button } from "../ui/button.jsx";
import { Input } from "../ui/input.jsx";
import { Badge } from "../ui/badge.jsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table.jsx";
import { EmptyState } from "../shared.jsx";
import { fmt, sortLogsDesc } from "../../lib/domain.js";

export default function CustomsDashboard() {
  const { db, user, customsSearchByAwb, customsSearchByToken, customsViewDocument } = useApp();
  const [awb, setAwb] = useState("");
  const [token, setToken] = useState("");

  const myReviews = sortLogsDesc(db.auditLog.filter((l) => l.userId === user.id && l.action === "CUSTOMS_REVIEWED")).slice(0, 20);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">ตรวจสอบเอกสาร DO (Customs)</h1>
        <p className="text-sm text-muted-foreground">
          {user.name} · {user.position}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Search className="h-4 w-4" /> ค้นหาด้วยเลข AWB
            </CardTitle>
            <CardDescription>พิมพ์เลข MAWB หรือ HAWB ที่ปรากฏบนสินค้า/เอกสาร</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Input placeholder="เช่น 217-12345678" value={awb} onKeyDown={(e) => e.key === "Enter" && customsSearchByAwb(awb)} onChange={(e) => setAwb(e.target.value)} />
            <Button onClick={() => customsSearchByAwb(awb)}>ค้นหา</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <ScanLine className="h-4 w-4" /> กรอกรหัสจาก QR (จำลองการสแกน)
            </CardTitle>
            <CardDescription>ให้ผู้ขนส่ง (Shipping) แสดง QR แล้วกรอกรหัส 8 หลักด้านล่าง QR ที่นี่</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Input placeholder="เช่น AOT7F3K29" value={token} onKeyDown={(e) => e.key === "Enter" && customsSearchByToken(token)} onChange={(e) => setToken(e.target.value)} />
            <Button variant="gold" onClick={() => customsSearchByToken(token)}>
              ตรวจสอบรหัส
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ประวัติการตรวจของฉัน (ล่าสุด)</CardTitle>
        </CardHeader>
        <CardContent>
          {myReviews.length === 0 ? (
            <EmptyState>ยังไม่มีประวัติการตรวจสอบเอกสาร</EmptyState>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>เวลา</TableHead>
                  <TableHead>MAWB</TableHead>
                  <TableHead>DO No.</TableHead>
                  <TableHead>วิธีตรวจสอบ</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {myReviews.map((l) => {
                  const req = db.requests.find((r) => r.id === l.meta.requestId);
                  return (
                    <TableRow key={l.id}>
                      <TableCell>{fmt(l.at)}</TableCell>
                      <TableCell>{req ? req.mawb : "-"}</TableCell>
                      <TableCell>{req ? req.doRequestNo || "-" : "-"}</TableCell>
                      <TableCell>
                        <Badge variant="muted">{l.meta.method}</Badge>
                      </TableCell>
                      <TableCell>
                        {req && (
                          <Button size="sm" variant="outline" onClick={() => customsViewDocument(req.id, "REOPEN")}>
                            เปิดอีกครั้ง
                          </Button>
                        )}
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
