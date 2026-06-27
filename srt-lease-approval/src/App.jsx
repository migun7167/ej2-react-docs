import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import RequestList from './pages/RequestList';
import NewRequest from './pages/NewRequest';
import RequestDetail from './pages/RequestDetail';
import AssetSearch from './pages/AssetSearch';
import InspectionManagement from './pages/InspectionManagement';
import ValuationManagement from './pages/ValuationManagement';
import InvitationManagement from './pages/InvitationManagement';
import ApprovalWorkflow from './pages/ApprovalWorkflow';
import DepositManagement from './pages/DepositManagement';
import ReportsPage from './pages/ReportsPage';

const PAGES = {
  dashboard: Dashboard,
  requests: RequestList,
  new_request: NewRequest,
  request_detail: RequestDetail,
  assets: AssetSearch,
  inspection: InspectionManagement,
  valuation: ValuationManagement,
  invitation: InvitationManagement,
  approval: ApprovalWorkflow,
  deposit: DepositManagement,
  reports: ReportsPage,
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [currentRole, setCurrentRole] = useState('Officer');

  const navigate = (page, params = {}) => {
    setCurrentPage(page);
    if (params.requestId) setSelectedRequestId(params.requestId);
  };

  const PageComponent = PAGES[currentPage] || Dashboard;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar
        currentPage={currentPage}
        onNavigate={navigate}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          currentPage={currentPage}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <PageComponent
            navigate={navigate}
            selectedRequestId={selectedRequestId}
            currentRole={currentRole}
          />
        </main>
      </div>
    </div>
  );
}
