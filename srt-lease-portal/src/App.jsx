import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

import Dashboard from './pages/Dashboard';
import TenantPortal from './pages/TenantPortal';
import NewRequest from './pages/NewRequest';
import RequestList from './pages/RequestList';
import RequestDetail from './pages/RequestDetail';
import DocCheck from './pages/DocCheck';
import AssetAvailability from './pages/AssetAvailability';
import AreaInspection from './pages/AreaInspection';
import Valuation from './pages/Valuation';
import InvitationTender from './pages/InvitationTender';
import ApprovalWorkflow from './pages/ApprovalWorkflow';
import DepositPayment from './pages/DepositPayment';
import ContractHandoff from './pages/ContractHandoff';
import Reports from './pages/Reports';
import AuditLog from './pages/AuditLog';
import Settings from './pages/Settings';

const PAGE_COMPONENTS = {
  dashboard:      Dashboard,
  tenant:         TenantPortal,
  new_request:    NewRequest,
  requests:       RequestList,
  request_detail: RequestDetail,
  doc_check:      DocCheck,
  assets:         AssetAvailability,
  inspection:     AreaInspection,
  valuation:      Valuation,
  invitation:     InvitationTender,
  approval:       ApprovalWorkflow,
  deposit:        DepositPayment,
  handoff:        ContractHandoff,
  reports:        Reports,
  audit:          AuditLog,
  settings:       Settings,
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [currentRole, setCurrentRole] = useState('Admin');
  const [selectedRequestId, setSelectedRequestId] = useState('LR-2567-0001');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigate = (page, requestId = null) => {
    setCurrentPage(page);
    if (requestId) setSelectedRequestId(requestId);
  };

  const PageComponent = PAGE_COMPONENTS[currentPage] || Dashboard;

  return (
    <div className="flex h-screen overflow-hidden bg-[#EEF2F7]">
      <Sidebar
        currentPage={currentPage}
        onNavigate={navigate}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(p => !p)}
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          currentPage={currentPage}
          onMenuToggle={() => setSidebarOpen(p => !p)}
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
          onNavigate={navigate}
        />
        <main className="flex-1 overflow-y-auto p-5">
          <PageComponent
            navigate={navigate}
            currentRole={currentRole}
            selectedRequestId={selectedRequestId}
          />
        </main>
      </div>
    </div>
  );
}
