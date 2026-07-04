import React from "react";
import { useApp } from "./context/AppContext.jsx";
import Login from "./components/Login.jsx";
import Topbar from "./components/layout/Topbar.jsx";
import Sidebar from "./components/layout/Sidebar.jsx";
import ForwarderDashboard from "./components/dashboards/ForwarderDashboard.jsx";
import NewRequest from "./components/dashboards/NewRequest.jsx";
import TmoDashboard from "./components/dashboards/TmoDashboard.jsx";
import ShippingDashboard from "./components/dashboards/ShippingDashboard.jsx";
import CustomsDashboard from "./components/dashboards/CustomsDashboard.jsx";
import AotDashboard from "./components/dashboards/AotDashboard.jsx";
import RequestDetail from "./components/RequestDetail.jsx";
import AuditLog from "./components/AuditLog.jsx";
import DoDocumentDialog from "./components/dialogs/DoDocumentDialog.jsx";
import QrDialog from "./components/dialogs/QrDialog.jsx";
import ToastViewport from "./components/ToastViewport.jsx";

const VIEWS = {
  "fwd-dashboard": ForwarderDashboard,
  "new-request": NewRequest,
  "tmo-dashboard": TmoDashboard,
  "shipping-dashboard": ShippingDashboard,
  "customs-dashboard": CustomsDashboard,
  "aot-dashboard": AotDashboard,
  "request-detail": RequestDetail,
  "audit-log": AuditLog,
};

export default function App() {
  const { user, view } = useApp();

  if (!user) {
    return (
      <>
        <Login />
        <ToastViewport />
      </>
    );
  }

  const ViewComponent = VIEWS[view] || ForwarderDashboard;

  return (
    <div className="min-h-screen bg-background">
      <Topbar />
      <div className="flex">
        <Sidebar />
        <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-6 md:px-8">
          <ViewComponent />
        </main>
      </div>
      <DoDocumentDialog />
      <QrDialog />
      <ToastViewport />
    </div>
  );
}
