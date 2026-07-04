import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { loadDB, saveDB, seedDB, uid, nowIso } from "../lib/db.js";
import { evaluateSearch, buildDocChecklist, computeDocStatus, decideSuggestion, nextDoNumber, genQrToken } from "../lib/domain.js";

const AppContext = createContext(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

function defaultViewForRole(role) {
  const map = {
    TMO: "tmo-dashboard",
    FORWARDER: "fwd-dashboard",
    SHIPPING: "shipping-dashboard",
    CUSTOMS: "customs-dashboard",
    AOT: "aot-dashboard",
  };
  return map[role] || "fwd-dashboard";
}

export function AppProvider({ children }) {
  const [db, setDb] = useState(() => loadDB());
  const [user, setUser] = useState(null);
  const [view, setView] = useState("login");
  const [activeRequestId, setActiveRequestId] = useState(null);
  const [showDoFor, setShowDoFor] = useState(null);
  const [showQrFor, setShowQrFor] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const toastIdRef = useRef(0);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  const showToast = useCallback((message, kind = "info") => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, kind }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  // mutate a structured-clone of db, persist, and commit as new state
  const mutate = useCallback((mutator) => {
    setDb((prev) => {
      const next = structuredClone(prev);
      mutator(next);
      saveDB(next);
      return next;
    });
  }, []);

  const logAudit = useCallback((draft, actor, action, meta) => {
    draft.auditLog.unshift({
      id: uid("log"),
      at: nowIso(),
      userId: actor.id,
      userName: actor.name,
      role: actor.role,
      action,
      meta: meta || {},
    });
  }, []);

  const login = useCallback(
    (username, password) => {
      const match = db.users.find((u) => u.username === username && u.password === password);
      if (!match) return { ok: false, error: "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง" };
      setUser(match);
      setView(defaultViewForRole(match.role));
      mutate((draft) => logAudit(draft, match, "LOGIN", {}));
      return { ok: true };
    },
    [db.users, mutate, logAudit]
  );

  const logout = useCallback(() => {
    if (user) mutate((draft) => logAudit(draft, user, "LOGOUT", {}));
    setUser(null);
    setView("login");
    setActiveRequestId(null);
  }, [user, mutate, logAudit]);

  const goto = useCallback((v, reqId = null) => {
    setView(v);
    setActiveRequestId(reqId);
  }, []);

  const openRequest = useCallback((reqId) => {
    setActiveRequestId(reqId);
    setView("request-detail");
  }, []);

  const previewSearch = useCallback(
    (mawb, hawb) => evaluateSearch(db, user, mawb, hawb),
    [db, user]
  );

  const submitRequest = useCallback(
    (mawb, hawb) => {
      const res = evaluateSearch(db, user, mawb, hawb);
      if (res.kind === "duplicate") {
        showToast("มีคำขอ DO อยู่แล้วสำหรับ Shipment นี้", "error");
        openRequest(res.existing.id);
        return;
      }
      const now = nowIso();
      const base = {
        id: uid("req"),
        requesterId: user.id,
        requesterName: user.name,
        requesterCompany: user.company || null,
        requesterTaxId: user.taxId || null,
        mawb,
        hawb: hawb || null,
        createdAt: now,
        updatedAt: now,
        doRequestNo: null,
        assignedTo: null,
        decisionBy: null,
        decisionAt: null,
        shippingId: null,
        shippingName: null,
        shippingAssignedBy: null,
        shippingAssignedAt: null,
        qrToken: null,
      };
      let req;
      if (res.kind === "not_found") {
        req = { ...base, shipmentId: null, entitlement: null, status: "SHIPMENT_NOT_FOUND", documentStatus: null, docChecklist: [], finalDecision: "REJECTED", decisionReason: "ไม่พบ Shipment ที่ตรงกับ MAWB/HAWB ที่ระบุในระบบ", decisionBy: "SYSTEM", decisionAt: now };
      } else if (res.kind === "ambiguous") {
        req = { ...base, shipmentId: null, entitlement: null, status: "MANUAL_REVIEW", documentStatus: null, docChecklist: [], finalDecision: null, decisionReason: "พบ Shipment มากกว่า 1 รายการภายใต้ MAWB นี้ กรุณาระบุ HAWB ให้ชัดเจน หรือรอเจ้าหน้าที่ตรวจสอบ" };
      } else if (res.kind === "ok" && res.entitlement === "FAIL") {
        req = { ...base, shipmentId: res.shipment.id, entitlement: "FAIL", status: "ENTITLEMENT_FAILED", documentStatus: null, docChecklist: [], finalDecision: "REJECTED", decisionReason: "บัญชีผู้ใช้งานไม่ใช่ Consignee ตาม MAWB/HAWB และไม่มี Delegation ที่ถูกต้อง", decisionBy: "SYSTEM", decisionAt: now };
      } else {
        req = { ...base, shipmentId: res.shipment.id, entitlement: res.entitlement, status: "PENDING_DOCUMENT_SCAN", documentStatus: "NOT_ATTACHED", docChecklist: buildDocChecklist(res.shipment), finalDecision: null, decisionReason: null };
      }
      mutate((draft) => {
        draft.requests.unshift(req);
        logAudit(draft, user, "DO_REQUEST_SUBMITTED", { mawb, hawb, requestId: req.id });
        if (req.shipmentId) logAudit(draft, user, "SHIPMENT_MATCHED", { requestId: req.id, shipmentId: req.shipmentId });
        if (req.entitlement) logAudit(draft, user, "ENTITLEMENT_CHECKED", { requestId: req.id, result: req.entitlement });
      });
      showToast("ส่งคำขอ DO เรียบร้อยแล้ว", "ok");
      openRequest(req.id);
    },
    [db, user, mutate, logAudit, showToast, openRequest]
  );

  const attachDoc = useCallback(
    (reqId, idx, newState) => {
      if (!user || user.role !== "TMO") return;
      mutate((draft) => {
        const req = draft.requests.find((r) => r.id === reqId);
        if (!req) return;
        const doc = req.docChecklist[idx];
        doc.state = newState;
        if (newState === "missing") {
          doc.scannedBy = null;
          doc.scannedAt = null;
        } else {
          doc.scannedBy = user.name;
          doc.scannedAt = nowIso();
        }
        req.documentStatus = computeDocStatus(req);
        req.updatedAt = nowIso();
        if (!["MANUAL_REVIEW", "REJECTED", "DO_ASSIGNED"].includes(req.status)) {
          if (req.documentStatus === "ATTACHED_COMPLETE") req.status = "READY_FOR_APPROVAL";
          else if (["UNREADABLE", "MISMATCH"].includes(req.documentStatus)) req.status = "MANUAL_REVIEW";
          else req.status = "PENDING_DOCUMENT_SCAN";
        }
        logAudit(draft, user, "DOCUMENT_SCANNED", { requestId: req.id, doc: doc.type, state: newState });
      });
    },
    [user, mutate, logAudit]
  );

  const makeDecision = useCallback(
    (reqId, decision, reason) => {
      if (!user || user.role !== "TMO") return { ok: false };
      let result = { ok: true };
      mutate((draft) => {
        const req = draft.requests.find((r) => r.id === reqId);
        if (!req) return;
        const now = nowIso();
        if (decision === "APPROVE") {
          if (decideSuggestion(draft, req) !== "APPROVE_READY") {
            result = { ok: false, error: "คำขอนี้ยังไม่ผ่านเงื่อนไขครบถ้วนสำหรับการอนุมัติ" };
            return;
          }
          req.finalDecision = "APPROVED";
          req.decisionReason = reason || "ผ่านเงื่อนไขครบถ้วน (Shipment / Identity / Entitlement / Document / Status)";
          req.decisionBy = user.name;
          req.decisionAt = now;
          req.doRequestNo = nextDoNumber(draft);
          req.status = "DO_ASSIGNED";
          req.assignedTo = req.requesterCompany;
          req.assignedAt = now;
          const shipment = draft.shipments.find((s) => s.id === req.shipmentId);
          if (shipment) shipment.doStatus = "ASSIGNED";
          logAudit(draft, user, "DECISION_MADE", { requestId: req.id, decision: "APPROVE" });
          logAudit(draft, user, "DO_ASSIGNED", { requestId: req.id, doNo: req.doRequestNo });
        } else if (decision === "MANUAL_REVIEW") {
          if (!reason) {
            result = { ok: false, error: "กรุณาระบุเหตุผลก่อนส่งตรวจสอบเพิ่มเติม" };
            return;
          }
          req.status = "MANUAL_REVIEW";
          req.finalDecision = null;
          req.decisionReason = reason;
          req.decisionBy = user.name;
          req.decisionAt = now;
          logAudit(draft, user, "DECISION_MADE", { requestId: req.id, decision: "MANUAL_REVIEW", reason });
        } else if (decision === "REJECT") {
          if (!reason) {
            result = { ok: false, error: "กรุณาระบุเหตุผลก่อนปฏิเสธคำขอ" };
            return;
          }
          req.status = "REJECTED";
          req.finalDecision = "REJECTED";
          req.decisionReason = reason;
          req.decisionBy = user.name;
          req.decisionAt = now;
          logAudit(draft, user, "DECISION_MADE", { requestId: req.id, decision: "REJECT", reason });
        }
        req.updatedAt = now;
      });
      return result;
    },
    [user, mutate, logAudit]
  );

  const assignShipping = useCallback(
    (reqId, shippingId) => {
      if (!user || user.role !== "FORWARDER") return;
      mutate((draft) => {
        const req = draft.requests.find((r) => r.id === reqId);
        const shipUser = draft.users.find((u) => u.id === shippingId);
        if (!req || !shipUser || req.requesterId !== user.id) return;
        req.shippingId = shipUser.id;
        req.shippingName = shipUser.name;
        req.shippingAssignedBy = user.name;
        req.shippingAssignedAt = nowIso();
        req.qrToken = genQrToken();
        req.updatedAt = nowIso();
        logAudit(draft, user, "SHIPPING_ASSIGNED", { requestId: req.id, shippingId: shipUser.id });
      });
      showToast("มอบหมายงานขนส่งเรียบร้อยแล้ว", "ok");
    },
    [user, mutate, logAudit, showToast]
  );

  const shippingViewDocument = useCallback(
    (reqId) => {
      mutate((draft) => logAudit(draft, user, "SHIPPING_VIEWED_DOCUMENT", { requestId: reqId }));
      setShowDoFor(reqId);
    },
    [user, mutate, logAudit]
  );

  const customsViewDocument = useCallback(
    (reqId, method) => {
      mutate((draft) => logAudit(draft, user, "CUSTOMS_REVIEWED", { requestId: reqId, method }));
      setShowDoFor(reqId);
    },
    [user, mutate, logAudit]
  );

  const customsSearchByAwb = useCallback(
    (val) => {
      const req = db.requests.find((r) => r.status === "DO_ASSIGNED" && (r.mawb === val || r.hawb === val));
      if (!req) {
        showToast("ไม่พบ DO ที่ Assign แล้วสำหรับเลขนี้", "error");
        return;
      }
      customsViewDocument(req.id, "AWB_SEARCH");
    },
    [db, showToast, customsViewDocument]
  );

  const customsSearchByToken = useCallback(
    (val) => {
      const token = val.trim().toUpperCase();
      const req = db.requests.find((r) => r.status === "DO_ASSIGNED" && r.qrToken === token);
      if (!req) {
        showToast("รหัส QR ไม่ถูกต้อง หรือ DO นี้ยังไม่ถูก Assign", "error");
        return;
      }
      customsViewDocument(req.id, "QR_TOKEN");
    },
    [db, showToast, customsViewDocument]
  );

  const resetDemo = useCallback(() => {
    const fresh = seedDB();
    saveDB(fresh);
    setDb(fresh);
    setUser(null);
    setView("login");
    setActiveRequestId(null);
    setShowDoFor(null);
    setShowQrFor(null);
  }, []);

  const value = useMemo(
    () => ({
      db,
      user,
      view,
      activeRequestId,
      showDoFor,
      showQrFor,
      theme,
      toasts,
      toggleTheme,
      showToast,
      login,
      logout,
      goto,
      openRequest,
      previewSearch,
      submitRequest,
      attachDoc,
      makeDecision,
      assignShipping,
      shippingViewDocument,
      customsViewDocument,
      customsSearchByAwb,
      customsSearchByToken,
      setShowDoFor,
      setShowQrFor,
      resetDemo,
    }),
    [
      db,
      user,
      view,
      activeRequestId,
      showDoFor,
      showQrFor,
      theme,
      toasts,
      toggleTheme,
      showToast,
      login,
      logout,
      goto,
      openRequest,
      previewSearch,
      submitRequest,
      attachDoc,
      makeDecision,
      assignShipping,
      shippingViewDocument,
      customsViewDocument,
      customsSearchByAwb,
      customsSearchByToken,
      resetDemo,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
