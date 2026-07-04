export function getShipment(db, id) {
  return db.shipments.find((s) => s.id === id) || null;
}

export function checkEntitlement(db, user, shipment) {
  if (shipment.hawb && shipment.houseConsigneeTaxId === user.taxId) return "PASS_HOUSE";
  if (shipment.consigneeTaxId === user.taxId) return "PASS_MASTER";
  const deleg = db.delegations.find(
    (d) => d.consigneeTaxId === shipment.consigneeTaxId && d.delegateTaxId === user.taxId
  );
  if (deleg) return "PASS_DELEGATED";
  return "FAIL";
}

export function evaluateSearch(db, user, mawb, hawb) {
  if (!mawb) return { kind: "invalid" };
  const matches = db.shipments.filter((s) => s.mawb === mawb && (!hawb || s.hawb === hawb));
  if (matches.length === 0) return { kind: "not_found" };
  if (matches.length > 1) return { kind: "ambiguous", count: matches.length };
  const shipment = matches[0];
  const existing = db.requests.find((r) => r.shipmentId === shipment.id && r.status !== "REJECTED");
  if (existing) return { kind: "duplicate", existing, shipment };
  const entitlement = checkEntitlement(db, user, shipment);
  return { kind: "ok", shipment, entitlement };
}

export function buildDocChecklist(shipment) {
  const list = [
    { type: "เอกสารแนบเครื่อง (Flight Document)", required: true, state: "missing", scannedBy: null, scannedAt: null },
    { type: "MAWB Copy", required: false, state: "missing", scannedBy: null, scannedAt: null },
  ];
  if (shipment.hawb) {
    list.push({ type: "HAWB Copy", required: true, state: "missing", scannedBy: null, scannedAt: null });
  }
  list.push({ type: "Cargo Manifest / Breakdown Sheet", required: false, state: "missing", scannedBy: null, scannedAt: null });
  list.push({ type: "Warehouse Receiving Record", required: false, state: "missing", scannedBy: null, scannedAt: null });
  return list;
}

export function computeDocStatus(req) {
  const required = req.docChecklist.filter((d) => d.required);
  if (required.length === 0) {
    return req.docChecklist.some((d) => d.state === "attached") ? "ATTACHED_COMPLETE" : "NOT_ATTACHED";
  }
  if (required.some((d) => d.state === "mismatch")) return "MISMATCH";
  if (required.some((d) => d.state === "unreadable")) return "UNREADABLE";
  if (required.every((d) => d.state === "attached")) return "ATTACHED_COMPLETE";
  if (required.some((d) => d.state === "attached")) return "PARTIAL_ATTACHED";
  return "NOT_ATTACHED";
}

export function decideSuggestion(db, req) {
  if (!req.shipmentId) return "REJECT";
  const shipment = getShipment(db, req.shipmentId);
  if (req.entitlement === "FAIL") return "REJECT";
  const ds = req.documentStatus;
  if (ds === "MISMATCH") return "REJECT_OR_REVIEW";
  if (ds === "UNREADABLE" || ds === "PARTIAL_ATTACHED") return "MANUAL_REVIEW";
  if (ds === "NOT_ATTACHED") return "PENDING_DOCUMENT";
  if (shipment.customsStatus !== "CLEARED" || shipment.cargoStatus !== "AVAILABLE") return "PENDING_STATUS";
  return "APPROVE_READY";
}

export function nextDoNumber(db) {
  db.doCounter += 1;
  return "AOT-DO-" + new Date().getFullYear() + "-" + String(db.doCounter).padStart(6, "0");
}

export function bucketOf(status) {
  if (status === "DO_ASSIGNED") return "ASSIGNED";
  if (status === "MANUAL_REVIEW") return "REVIEW";
  if (status === "REJECTED" || status === "SHIPMENT_NOT_FOUND" || status === "ENTITLEMENT_FAILED") return "REJECTED";
  return "ACTIVE";
}

export function bucketCounts(list) {
  const b = { ACTIVE: 0, REVIEW: 0, ASSIGNED: 0, REJECTED: 0 };
  list.forEach((r) => (b[bucketOf(r.status)] += 1));
  return [
    { key: "ACTIVE", label: "กำลังดำเนินการ", count: b.ACTIVE, colorVar: "--primary" },
    { key: "REVIEW", label: "รอตรวจสอบเพิ่มเติม", count: b.REVIEW, colorVar: "--warning" },
    { key: "ASSIGNED", label: "Assign DO แล้ว", count: b.ASSIGNED, colorVar: "--success" },
    { key: "REJECTED", label: "ถูกปฏิเสธ", count: b.REJECTED, colorVar: "--destructive" },
  ];
}

export function isToday(iso) {
  if (!iso) return false;
  const d = new Date(iso);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}

export function ageHours(iso) {
  return (Date.now() - new Date(iso).getTime()) / 3600000;
}
export function hoursBetween(fromIso, toIso) {
  return (new Date(toIso).getTime() - new Date(fromIso).getTime()) / 3600000;
}
export function fmtHours(h) {
  if (h === null || h === undefined || Number.isNaN(h)) return "-";
  if (h < 1) return Math.round(h * 60) + " นาที";
  if (h < 48) return h.toFixed(1) + " ชม.";
  return (h / 24).toFixed(1) + " วัน";
}
export function avgTurnaroundHours(list) {
  const done = list.filter((r) => r.status === "DO_ASSIGNED" && r.assignedAt);
  if (!done.length) return null;
  const total = done.reduce((s, r) => s + hoursBetween(r.createdAt, r.assignedAt), 0);
  return total / done.length;
}

const ACTIVE_STATUSES = ["PENDING_DOCUMENT_SCAN", "READY_FOR_APPROVAL", "MANUAL_REVIEW"];
export function agingInfo(req) {
  if (!ACTIVE_STATUSES.includes(req.status)) return null;
  const h = ageHours(req.createdAt);
  if (h >= 24) return { level: "danger", text: "ล่าช้า " + fmtHours(h) };
  if (h >= 4) return { level: "warning", text: "รอมา " + fmtHours(h) };
  return { level: "muted", text: "เพิ่งส่ง " + fmtHours(h) };
}

export function fmt(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleString("th-TH", { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export const ACTION_LABELS = {
  LOGIN: "เข้าสู่ระบบ",
  LOGOUT: "ออกจากระบบ",
  DO_REQUEST_SUBMITTED: "ส่งคำขอ DO ใหม่",
  SHIPMENT_MATCHED: "ระบบพบ Shipment ที่ตรงกัน",
  ENTITLEMENT_CHECKED: "ตรวจสอบสิทธิ์ (Entitlement)",
  DOCUMENT_SCANNED: "สแกน/แนบเอกสาร",
  DECISION_MADE: "ตัดสินใจคำขอ DO",
  DO_ASSIGNED: "Assign DO สำเร็จ",
  SHIPPING_ASSIGNED: "มอบหมายผู้ขนส่ง (Shipping)",
  SHIPPING_VIEWED_DOCUMENT: "ผู้ขนส่งเปิดดูเอกสาร",
  CUSTOMS_REVIEWED: "ศุลกากรตรวจสอบเอกสาร",
};

export function sortLogsDesc(logs) {
  return [...logs].sort((a, b) => new Date(b.at) - new Date(a.at));
}
export function sortLogsAsc(logs) {
  return [...logs].sort((a, b) => new Date(a.at) - new Date(b.at));
}

/* ---------------- QR handoff ---------------- */
export function genQrToken() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}
function strHash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h >>> 0;
}
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function qrFinderOn(x, y, size) {
  const lx = x < 7 ? x : x - (size - 7);
  const ly = y < 7 ? y : y - (size - 7);
  const border = lx === 0 || lx === 6 || ly === 0 || ly === 6;
  const inner = lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4;
  return border || inner;
}
export function qrCells(token) {
  const size = 21;
  const rand = mulberry32(strHash(token || "AOT"));
  const cells = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const inFinder = (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7);
      cells.push(inFinder ? qrFinderOn(x, y, size) : rand() > 0.55);
    }
  }
  return cells;
}
