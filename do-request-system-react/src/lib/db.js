export const LS_KEY = "aot_do_demo_react_v1";

export function uid(prefix) {
  return prefix + "_" + Math.random().toString(36).slice(2, 9);
}
export function nowIso() {
  return new Date().toISOString();
}
export function hoursAgo(h) {
  return new Date(Date.now() - h * 3600000).toISOString();
}

export function seedDB() {
  return {
    doCounter: 1003,
    users: [
      { id: "tmo1", username: "tmo.somchai", password: "aot2026", role: "TMO", name: "สมชาย ใจดี", position: "เจ้าหน้าที่คลังสินค้า / ผู้อนุมัติ DO", staffId: "TMO-00231" },
      { id: "tmo2", username: "tmo.suda", password: "aot2026", role: "TMO", name: "สุดา วงศ์ทอง", position: "เจ้าหน้าที่คลังสินค้า / ผู้อนุมัติ DO", staffId: "TMO-00415" },
      { id: "fwd1", username: "kerry.agent", password: "kerry2026", role: "FORWARDER", name: "วราภรณ์ พงษ์เจริญ", company: "Kerry Logistics (Thailand) Co., Ltd.", taxId: "0105536090809" },
      { id: "fwd2", username: "dhl.agent", password: "dhl2026", role: "FORWARDER", name: "Somsak Deelert", company: "DHL Global Forwarding (Thailand) Ltd.", taxId: "0105537083550" },
      { id: "fwd3", username: "abc.agent", password: "abc2026", role: "FORWARDER", name: "Nattapong Srisuk", company: "ABC Cargo Services Co., Ltd.", taxId: "0105558123456" },
      { id: "ship1", username: "shipping.somsri", password: "ship2026", role: "SHIPPING", name: "สมศรี ขนส่งดี", company: "ทีมขนส่ง A (Own Fleet)" },
      { id: "ship2", username: "shipping.anan", password: "ship2026", role: "SHIPPING", name: "อนันต์ รุ่งเรือง", company: "ทีมขนส่ง B (Contract Truck)" },
      { id: "cus1", username: "customs.pichai", password: "cus2026", role: "CUSTOMS", name: "พิชัย ตรวจเข้ม", position: "เจ้าหน้าที่ศุลกากร ด่านสนามบิน" },
      { id: "aot1", username: "aot.admin", password: "aot2026", role: "AOT", name: "ผู้บริหาร AOT", position: "AOT Cargo Community – Oversight" },
    ],
    delegations: [
      { consigneeTaxId: "0105512340000", consignee: "Siam Union Trading Co., Ltd.", delegateTaxId: "0105536090809", delegate: "Kerry Logistics (Thailand) Co., Ltd." },
      { consigneeTaxId: "0105599998888", consignee: "XYZ Trading Co., Ltd.", delegateTaxId: "0105558123456", delegate: "ABC Cargo Services Co., Ltd." },
    ],
    shipments: [
      { id: "s1", mawb: "217-12345678", hawb: null, type: "Master (Direct)", consignee: "Kerry Logistics (Thailand) Co., Ltd.", consigneeTaxId: "0105536090809", flight: "TG920", flightDate: "2026-07-03", origin: "NRT", destination: "BKK", pieces: 12, weight: "480 KG", goods: "Electronic Parts (Consumer Electronics)", customsStatus: "CLEARED", cargoStatus: "AVAILABLE", storage: "AOT Cargo Terminal - Zone A/07", doStatus: null },
      { id: "s2", mawb: "217-88990011", hawb: "THB-556677", type: "House (Consolidation)", consignee: "Global Consol Logistics Co., Ltd.", consigneeTaxId: "0105599991111", houseConsignee: "DHL Global Forwarding (Thailand) Ltd.", houseConsigneeTaxId: "0105537083550", flight: "TG634", flightDate: "2026-07-04", origin: "HKG", destination: "BKK", pieces: 34, weight: "1,120 KG", goods: "Garment & Textile (Consol Cargo)", customsStatus: "CLEARED", cargoStatus: "AVAILABLE", storage: "AOT Cargo Terminal - Zone B/12", doStatus: null },
      { id: "s3", mawb: "217-45671234", hawb: null, type: "Master (Direct)", consignee: "Siam Union Trading Co., Ltd.", consigneeTaxId: "0105512340000", flight: "TG402", flightDate: "2026-07-04", origin: "FRA", destination: "BKK", pieces: 8, weight: "210 KG", goods: "Machine Spare Parts", customsStatus: "CLEARED", cargoStatus: "AVAILABLE", storage: "AOT Cargo Terminal - Zone C/03", doStatus: null },
      { id: "s4", mawb: "217-99887766", hawb: null, type: "Master (Direct)", consignee: "XYZ Trading Co., Ltd.", consigneeTaxId: "0105599998888", flight: "TG108", flightDate: "2026-07-02", origin: "ICN", destination: "BKK", pieces: 5, weight: "96 KG", goods: "Cosmetics & Personal Care", customsStatus: "HELD", cargoStatus: "NOT_READY", storage: "AOT Cargo Terminal - Zone A/02", doStatus: null },
      { id: "s5a", mawb: "217-77778888", hawb: "THB-100100", type: "House (Consolidation)", consignee: "Global Consol Logistics Co., Ltd.", consigneeTaxId: "0105599991111", houseConsignee: "Global Freight Partners Co., Ltd.", houseConsigneeTaxId: "0105566667777", flight: "TG970", flightDate: "2026-07-05", origin: "SIN", destination: "BKK", pieces: 20, weight: "640 KG", goods: "Machinery Parts (Consol)", customsStatus: "CLEARED", cargoStatus: "AVAILABLE", storage: "AOT Cargo Terminal - Zone B/05", doStatus: null },
      { id: "s5b", mawb: "217-77778888", hawb: "THB-100200", type: "House (Consolidation)", consignee: "Global Consol Logistics Co., Ltd.", consigneeTaxId: "0105599991111", houseConsignee: "Kerry Logistics (Thailand) Co., Ltd.", houseConsigneeTaxId: "0105536090809", flight: "TG970", flightDate: "2026-07-05", origin: "SIN", destination: "BKK", pieces: 14, weight: "410 KG", goods: "Auto Parts (Consol)", customsStatus: "CLEARED", cargoStatus: "AVAILABLE", storage: "AOT Cargo Terminal - Zone B/05", doStatus: null },
      { id: "s6", mawb: "217-30011220", hawb: null, type: "Master (Direct)", consignee: "Kerry Logistics (Thailand) Co., Ltd.", consigneeTaxId: "0105536090809", flight: "TG888", flightDate: "2026-07-01", origin: "KIX", destination: "BKK", pieces: 6, weight: "150 KG", goods: "Auto Spare Parts", customsStatus: "CLEARED", cargoStatus: "AVAILABLE", storage: "AOT Cargo Terminal - Zone A/09", doStatus: "ASSIGNED" },
      { id: "s7", mawb: "217-30022330", hawb: null, type: "Master (Direct)", consignee: "Kerry Logistics (Thailand) Co., Ltd.", consigneeTaxId: "0105536090809", flight: "TG512", flightDate: "2026-07-04", origin: "CDG", destination: "BKK", pieces: 9, weight: "260 KG", goods: "Cosmetic Packaging", customsStatus: "CLEARED", cargoStatus: "AVAILABLE", storage: "AOT Cargo Terminal - Zone A/10", doStatus: null },
      { id: "s8", mawb: "217-30033440", hawb: "THB-771122", type: "House (Consolidation)", consignee: "Global Consol Logistics Co., Ltd.", consigneeTaxId: "0105599991111", houseConsignee: "DHL Global Forwarding (Thailand) Ltd.", houseConsigneeTaxId: "0105537083550", flight: "TG205", flightDate: "2026-07-03", origin: "HKG", destination: "BKK", pieces: 22, weight: "600 KG", goods: "Consumer Goods (Consol)", customsStatus: "CLEARED", cargoStatus: "AVAILABLE", storage: "AOT Cargo Terminal - Zone B/14", doStatus: null },
      { id: "s9", mawb: "217-30044550", hawb: "THB-771133", type: "House (Consolidation)", consignee: "Global Consol Logistics Co., Ltd.", consigneeTaxId: "0105599991111", houseConsignee: "DHL Global Forwarding (Thailand) Ltd.", houseConsigneeTaxId: "0105537083550", flight: "TG205", flightDate: "2026-06-28", origin: "HKG", destination: "BKK", pieces: 40, weight: "1,300 KG", goods: "Electronics (Consol)", customsStatus: "CLEARED", cargoStatus: "AVAILABLE", storage: "AOT Cargo Terminal - Zone B/15", doStatus: "ASSIGNED" },
      { id: "s10", mawb: "217-30055660", hawb: null, type: "Master (Direct)", consignee: "Kerry Logistics (Thailand) Co., Ltd.", consigneeTaxId: "0105536090809", flight: "TG150", flightDate: "2026-07-03", origin: "SIN", destination: "BKK", pieces: 3, weight: "75 KG", goods: "Documents / Samples", customsStatus: "CLEARED", cargoStatus: "AVAILABLE", storage: "AOT Cargo Terminal - Zone A/11", doStatus: null },
      { id: "s11", mawb: "217-30066770", hawb: null, type: "Master (Direct)", consignee: "XYZ Trading Co., Ltd.", consigneeTaxId: "0105599998888", flight: "TG777", flightDate: "2026-07-03", origin: "ICN", destination: "BKK", pieces: 7, weight: "190 KG", goods: "Textiles", customsStatus: "CLEARED", cargoStatus: "AVAILABLE", storage: "AOT Cargo Terminal - Zone A/12", doStatus: null },
      { id: "s12", mawb: "217-30077880", hawb: null, type: "Master (Direct)", consignee: "Kerry Logistics (Thailand) Co., Ltd.", consigneeTaxId: "0105536090809", flight: "TG920", flightDate: "2026-07-04", origin: "NRT", destination: "BKK", pieces: 15, weight: "410 KG", goods: "Machinery Accessories", customsStatus: "CLEARED", cargoStatus: "AVAILABLE", storage: "AOT Cargo Terminal - Zone A/13", doStatus: "ASSIGNED" },
    ],
    requests: [
      { id: "req_seed_s9", requesterId: "fwd2", requesterName: "Somsak Deelert", requesterCompany: "DHL Global Forwarding (Thailand) Ltd.", requesterTaxId: "0105537083550", mawb: "217-30044550", hawb: "THB-771133", shipmentId: "s9", entitlement: "PASS_HOUSE", status: "DO_ASSIGNED", documentStatus: "ATTACHED_COMPLETE",
        docChecklist: [
          { type: "เอกสารแนบเครื่อง (Flight Document)", required: true, state: "attached", scannedBy: "สุดา วงศ์ทอง", scannedAt: hoursAgo(148) },
          { type: "MAWB Copy", required: false, state: "attached", scannedBy: "สุดา วงศ์ทอง", scannedAt: hoursAgo(148) },
          { type: "HAWB Copy", required: true, state: "attached", scannedBy: "สุดา วงศ์ทอง", scannedAt: hoursAgo(147) },
          { type: "Cargo Manifest / Breakdown Sheet", required: false, state: "attached", scannedBy: "สุดา วงศ์ทอง", scannedAt: hoursAgo(147) },
          { type: "Warehouse Receiving Record", required: false, state: "missing", scannedBy: null, scannedAt: null },
        ],
        finalDecision: "APPROVED", decisionReason: "ผ่านเงื่อนไขครบถ้วน (Shipment / Identity / Entitlement / Document / Status)", decisionBy: "สุดา วงศ์ทอง", decisionAt: hoursAgo(146), doRequestNo: "AOT-DO-2026-001001", assignedTo: "DHL Global Forwarding (Thailand) Ltd.", assignedAt: hoursAgo(146),
        shippingId: "ship2", shippingName: "อนันต์ รุ่งเรือง", shippingAssignedBy: "Somsak Deelert", shippingAssignedAt: hoursAgo(140), qrToken: "AOT9M2XQ1",
        createdAt: hoursAgo(150), updatedAt: hoursAgo(139) },
      { id: "req_seed_s6", requesterId: "fwd1", requesterName: "วราภรณ์ พงษ์เจริญ", requesterCompany: "Kerry Logistics (Thailand) Co., Ltd.", requesterTaxId: "0105536090809", mawb: "217-30011220", hawb: null, shipmentId: "s6", entitlement: "PASS_MASTER", status: "DO_ASSIGNED", documentStatus: "ATTACHED_COMPLETE",
        docChecklist: [
          { type: "เอกสารแนบเครื่อง (Flight Document)", required: true, state: "attached", scannedBy: "สมชาย ใจดี", scannedAt: hoursAgo(70) },
          { type: "MAWB Copy", required: false, state: "attached", scannedBy: "สมชาย ใจดี", scannedAt: hoursAgo(70) },
          { type: "Cargo Manifest / Breakdown Sheet", required: false, state: "missing", scannedBy: null, scannedAt: null },
          { type: "Warehouse Receiving Record", required: false, state: "missing", scannedBy: null, scannedAt: null },
        ],
        finalDecision: "APPROVED", decisionReason: "ผ่านเงื่อนไขครบถ้วน (Shipment / Identity / Entitlement / Document / Status)", decisionBy: "สมชาย ใจดี", decisionAt: hoursAgo(68), doRequestNo: "AOT-DO-2026-001002", assignedTo: "Kerry Logistics (Thailand) Co., Ltd.", assignedAt: hoursAgo(68),
        shippingId: "ship1", shippingName: "สมศรี ขนส่งดี", shippingAssignedBy: "วราภรณ์ พงษ์เจริญ", shippingAssignedAt: hoursAgo(60), qrToken: "AOT7F3K29",
        createdAt: hoursAgo(72), updatedAt: hoursAgo(50) },
      { id: "req_seed_s10", requesterId: "fwd3", requesterName: "Nattapong Srisuk", requesterCompany: "ABC Cargo Services Co., Ltd.", requesterTaxId: "0105558123456", mawb: "217-30055660", hawb: null, shipmentId: "s10", entitlement: "FAIL", status: "ENTITLEMENT_FAILED", documentStatus: null, docChecklist: [],
        finalDecision: "REJECTED", decisionReason: "บัญชีผู้ใช้งานไม่ใช่ Consignee ตาม MAWB/HAWB และไม่มี Delegation ที่ถูกต้อง", decisionBy: "SYSTEM", decisionAt: hoursAgo(26), assignedTo: null, createdAt: hoursAgo(26), updatedAt: hoursAgo(26) },
      { id: "req_seed_s8", requesterId: "fwd2", requesterName: "Somsak Deelert", requesterCompany: "DHL Global Forwarding (Thailand) Ltd.", requesterTaxId: "0105537083550", mawb: "217-30033440", hawb: "THB-771122", shipmentId: "s8", entitlement: "PASS_HOUSE", status: "MANUAL_REVIEW", documentStatus: "UNREADABLE",
        docChecklist: [
          { type: "เอกสารแนบเครื่อง (Flight Document)", required: true, state: "unreadable", scannedBy: "สมชาย ใจดี", scannedAt: hoursAgo(4) },
          { type: "MAWB Copy", required: false, state: "missing", scannedBy: null, scannedAt: null },
          { type: "HAWB Copy", required: true, state: "missing", scannedBy: null, scannedAt: null },
          { type: "Cargo Manifest / Breakdown Sheet", required: false, state: "missing", scannedBy: null, scannedAt: null },
          { type: "Warehouse Receiving Record", required: false, state: "missing", scannedBy: null, scannedAt: null },
        ],
        finalDecision: null, decisionReason: null, decisionBy: null, decisionAt: null, assignedTo: null, createdAt: hoursAgo(30), updatedAt: hoursAgo(4) },
      { id: "req_seed_s11", requesterId: "fwd3", requesterName: "Nattapong Srisuk", requesterCompany: "ABC Cargo Services Co., Ltd.", requesterTaxId: "0105558123456", mawb: "217-30066770", hawb: null, shipmentId: "s11", entitlement: "PASS_DELEGATED", status: "READY_FOR_APPROVAL", documentStatus: "ATTACHED_COMPLETE",
        docChecklist: [
          { type: "เอกสารแนบเครื่อง (Flight Document)", required: true, state: "attached", scannedBy: "สุดา วงศ์ทอง", scannedAt: hoursAgo(15) },
          { type: "MAWB Copy", required: false, state: "attached", scannedBy: "สุดา วงศ์ทอง", scannedAt: hoursAgo(15) },
          { type: "Cargo Manifest / Breakdown Sheet", required: false, state: "missing", scannedBy: null, scannedAt: null },
          { type: "Warehouse Receiving Record", required: false, state: "missing", scannedBy: null, scannedAt: null },
        ],
        finalDecision: null, decisionReason: null, decisionBy: null, decisionAt: null, assignedTo: null, createdAt: hoursAgo(20), updatedAt: hoursAgo(15) },
      { id: "req_seed_s12", requesterId: "fwd1", requesterName: "วราภรณ์ พงษ์เจริญ", requesterCompany: "Kerry Logistics (Thailand) Co., Ltd.", requesterTaxId: "0105536090809", mawb: "217-30077880", hawb: null, shipmentId: "s12", entitlement: "PASS_MASTER", status: "DO_ASSIGNED", documentStatus: "ATTACHED_COMPLETE",
        docChecklist: [
          { type: "เอกสารแนบเครื่อง (Flight Document)", required: true, state: "attached", scannedBy: "สมชาย ใจดี", scannedAt: hoursAgo(9.5) },
          { type: "MAWB Copy", required: false, state: "attached", scannedBy: "สมชาย ใจดี", scannedAt: hoursAgo(9.5) },
          { type: "Cargo Manifest / Breakdown Sheet", required: false, state: "missing", scannedBy: null, scannedAt: null },
          { type: "Warehouse Receiving Record", required: false, state: "missing", scannedBy: null, scannedAt: null },
        ],
        finalDecision: "APPROVED", decisionReason: "ผ่านเงื่อนไขครบถ้วน (Shipment / Identity / Entitlement / Document / Status)", decisionBy: "สมชาย ใจดี", decisionAt: hoursAgo(9), doRequestNo: "AOT-DO-2026-001003", assignedTo: "Kerry Logistics (Thailand) Co., Ltd.", assignedAt: hoursAgo(9), createdAt: hoursAgo(10), updatedAt: hoursAgo(9) },
      { id: "req_seed_s7", requesterId: "fwd1", requesterName: "วราภรณ์ พงษ์เจริญ", requesterCompany: "Kerry Logistics (Thailand) Co., Ltd.", requesterTaxId: "0105536090809", mawb: "217-30022330", hawb: null, shipmentId: "s7", entitlement: "PASS_MASTER", status: "PENDING_DOCUMENT_SCAN", documentStatus: "NOT_ATTACHED",
        docChecklist: [
          { type: "เอกสารแนบเครื่อง (Flight Document)", required: true, state: "missing", scannedBy: null, scannedAt: null },
          { type: "MAWB Copy", required: false, state: "missing", scannedBy: null, scannedAt: null },
          { type: "Cargo Manifest / Breakdown Sheet", required: false, state: "missing", scannedBy: null, scannedAt: null },
          { type: "Warehouse Receiving Record", required: false, state: "missing", scannedBy: null, scannedAt: null },
        ],
        finalDecision: null, decisionReason: null, decisionBy: null, decisionAt: null, assignedTo: null, createdAt: hoursAgo(5), updatedAt: hoursAgo(5) },
    ],
    auditLog: [
      { id: "log_seed_1", at: hoursAgo(150), userId: "fwd2", userName: "Somsak Deelert", role: "FORWARDER", action: "DO_REQUEST_SUBMITTED", meta: { mawb: "217-30044550", hawb: "THB-771133", requestId: "req_seed_s9" } },
      { id: "log_seed_2", at: hoursAgo(150), userId: "fwd2", userName: "Somsak Deelert", role: "FORWARDER", action: "SHIPMENT_MATCHED", meta: { requestId: "req_seed_s9", shipmentId: "s9" } },
      { id: "log_seed_3", at: hoursAgo(150), userId: "fwd2", userName: "Somsak Deelert", role: "FORWARDER", action: "ENTITLEMENT_CHECKED", meta: { requestId: "req_seed_s9", result: "PASS_HOUSE" } },
      { id: "log_seed_4", at: hoursAgo(147), userId: "tmo2", userName: "สุดา วงศ์ทอง", role: "TMO", action: "DOCUMENT_SCANNED", meta: { requestId: "req_seed_s9", doc: "HAWB Copy", state: "attached" } },
      { id: "log_seed_5", at: hoursAgo(146), userId: "tmo2", userName: "สุดา วงศ์ทอง", role: "TMO", action: "DECISION_MADE", meta: { requestId: "req_seed_s9", decision: "APPROVE" } },
      { id: "log_seed_6", at: hoursAgo(146), userId: "tmo2", userName: "สุดา วงศ์ทอง", role: "TMO", action: "DO_ASSIGNED", meta: { requestId: "req_seed_s9", doNo: "AOT-DO-2026-001001" } },
      { id: "log_seed_7", at: hoursAgo(72), userId: "fwd1", userName: "วราภรณ์ พงษ์เจริญ", role: "FORWARDER", action: "DO_REQUEST_SUBMITTED", meta: { mawb: "217-30011220", hawb: "", requestId: "req_seed_s6" } },
      { id: "log_seed_8", at: hoursAgo(72), userId: "fwd1", userName: "วราภรณ์ พงษ์เจริญ", role: "FORWARDER", action: "ENTITLEMENT_CHECKED", meta: { requestId: "req_seed_s6", result: "PASS_MASTER" } },
      { id: "log_seed_9", at: hoursAgo(70), userId: "tmo1", userName: "สมชาย ใจดี", role: "TMO", action: "DOCUMENT_SCANNED", meta: { requestId: "req_seed_s6", doc: "เอกสารแนบเครื่อง (Flight Document)", state: "attached" } },
      { id: "log_seed_10", at: hoursAgo(68), userId: "tmo1", userName: "สมชาย ใจดี", role: "TMO", action: "DO_ASSIGNED", meta: { requestId: "req_seed_s6", doNo: "AOT-DO-2026-001002" } },
      { id: "log_seed_11", at: hoursAgo(30), userId: "fwd2", userName: "Somsak Deelert", role: "FORWARDER", action: "DO_REQUEST_SUBMITTED", meta: { mawb: "217-30033440", hawb: "THB-771122", requestId: "req_seed_s8" } },
      { id: "log_seed_12", at: hoursAgo(4), userId: "tmo1", userName: "สมชาย ใจดี", role: "TMO", action: "DOCUMENT_SCANNED", meta: { requestId: "req_seed_s8", doc: "เอกสารแนบเครื่อง (Flight Document)", state: "unreadable" } },
      { id: "log_seed_13", at: hoursAgo(26), userId: "fwd3", userName: "Nattapong Srisuk", role: "FORWARDER", action: "DO_REQUEST_SUBMITTED", meta: { mawb: "217-30055660", hawb: "", requestId: "req_seed_s10" } },
      { id: "log_seed_14", at: hoursAgo(26), userId: "fwd3", userName: "Nattapong Srisuk", role: "FORWARDER", action: "ENTITLEMENT_CHECKED", meta: { requestId: "req_seed_s10", result: "FAIL" } },
      { id: "log_seed_15", at: hoursAgo(20), userId: "fwd3", userName: "Nattapong Srisuk", role: "FORWARDER", action: "DO_REQUEST_SUBMITTED", meta: { mawb: "217-30066770", hawb: "", requestId: "req_seed_s11" } },
      { id: "log_seed_16", at: hoursAgo(15), userId: "tmo2", userName: "สุดา วงศ์ทอง", role: "TMO", action: "DOCUMENT_SCANNED", meta: { requestId: "req_seed_s11", doc: "เอกสารแนบเครื่อง (Flight Document)", state: "attached" } },
      { id: "log_seed_17", at: hoursAgo(10), userId: "fwd1", userName: "วราภรณ์ พงษ์เจริญ", role: "FORWARDER", action: "DO_REQUEST_SUBMITTED", meta: { mawb: "217-30077880", hawb: "", requestId: "req_seed_s12" } },
      { id: "log_seed_18", at: hoursAgo(9), userId: "tmo1", userName: "สมชาย ใจดี", role: "TMO", action: "DO_ASSIGNED", meta: { requestId: "req_seed_s12", doNo: "AOT-DO-2026-001003" } },
      { id: "log_seed_19", at: hoursAgo(5), userId: "fwd1", userName: "วราภรณ์ พงษ์เจริญ", role: "FORWARDER", action: "DO_REQUEST_SUBMITTED", meta: { mawb: "217-30022330", hawb: "", requestId: "req_seed_s7" } },
      { id: "log_seed_20", at: hoursAgo(140), userId: "fwd2", userName: "Somsak Deelert", role: "FORWARDER", action: "SHIPPING_ASSIGNED", meta: { requestId: "req_seed_s9", shippingId: "ship2" } },
      { id: "log_seed_21", at: hoursAgo(139), userId: "cus1", userName: "พิชัย ตรวจเข้ม", role: "CUSTOMS", action: "CUSTOMS_REVIEWED", meta: { requestId: "req_seed_s9", method: "QR_TOKEN" } },
      { id: "log_seed_22", at: hoursAgo(60), userId: "fwd1", userName: "วราภรณ์ พงษ์เจริญ", role: "FORWARDER", action: "SHIPPING_ASSIGNED", meta: { requestId: "req_seed_s6", shippingId: "ship1" } },
      { id: "log_seed_23", at: hoursAgo(50), userId: "cus1", userName: "พิชัย ตรวจเข้ม", role: "CUSTOMS", action: "CUSTOMS_REVIEWED", meta: { requestId: "req_seed_s6", method: "AWB_SEARCH" } },
    ],
  };
}

export function loadDB() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    /* ignore corrupt storage */
  }
  const fresh = seedDB();
  saveDB(fresh);
  return fresh;
}

export function saveDB(db) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(db));
  } catch (e) {
    /* storage full or unavailable */
  }
}
