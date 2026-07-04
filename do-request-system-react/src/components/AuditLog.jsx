import React from "react";
import { useApp } from "../context/AppContext.jsx";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card.jsx";
import { Badge } from "./ui/badge.jsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table.jsx";
import { EmptyState } from "./shared.jsx";
import { ACTION_LABELS, fmt, sortLogsDesc } from "../lib/domain.js";

export default function AuditLog() {
  const { db, user } = useApp();
  const privileged = user.role === "TMO" || user.role === "AOT";
  const myRequests = db.requests.filter((r) => r.requesterId === user.id || r.shippingId === user.id);
  const myReqIds = myRequests.map((r) => r.id);
  // Include shipment-level events (e.g. TMO pre-attaching documents before
  // any request existed) once the user has a request tied to that shipment.
  const myShipmentIds = myRequests.filter((r) => r.shipmentId).map((r) => r.shipmentId);

  const logs = db.auditLog.filter((l) => {
    if (privileged) return true;
    if (l.userId === user.id) return true;
    if (l.meta?.requestId && myReqIds.includes(l.meta.requestId)) return true;
    if (l.meta?.shipmentId && myShipmentIds.includes(l.meta.shipmentId)) return true;
    return false;
  });
  const rows = sortLogsDesc(logs).slice(0, 200);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">Audit Log</h1>
        <p className="text-sm text-muted-foreground">{privileged ? "ประวัติการดำเนินการทั้งหมดในระบบ" : "ประวัติการดำเนินการที่เกี่ยวข้องกับคุณ"}</p>
      </div>
      <Card>
        <CardContent className="p-5">
          {rows.length === 0 ? (
            <EmptyState>ยังไม่มีข้อมูล</EmptyState>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Detail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="whitespace-nowrap text-xs">{fmt(l.at)}</TableCell>
                    <TableCell>
                      {l.userName} <Badge variant="muted">{l.role}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold">{ACTION_LABELS[l.action] || l.action}</TableCell>
                    <TableCell className="text-[11px] text-muted-foreground">{JSON.stringify(l.meta)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
