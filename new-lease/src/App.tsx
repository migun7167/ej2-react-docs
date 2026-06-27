import React, { useState } from 'react';
import './index.css';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import ContractList from './pages/ContractList';
import NewContract from './pages/NewContract';
import Templates from './pages/Templates';
import Approval from './pages/Approval';
import ESignature from './pages/ESignature';
import Renewal from './pages/Renewal';
import Reports from './pages/Reports';
import {
  Repository, Billing, Transfer, Amendment, Termination,
  Obligations, NotificationsPage, Tenants, Assets, Audit, SettingsPage
} from './pages/OtherPages';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'contracts': return <ContractList />;
      case 'new-contract': return <NewContract />;
      case 'templates': return <Templates />;
      case 'approval': return <Approval />;
      case 'esignature': return <ESignature />;
      case 'repository': return <Repository />;
      case 'renewal': return <Renewal />;
      case 'transfer': return <Transfer />;
      case 'amendment': return <Amendment />;
      case 'termination': return <Termination />;
      case 'billing': return <Billing />;
      case 'obligations': return <Obligations />;
      case 'reports': return <Reports />;
      case 'assets': return <Assets />;
      case 'tenants': return <Tenants />;
      case 'audit': return <Audit />;
      case 'settings': return <SettingsPage />;
      case 'notifications': return <NotificationsPage />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        activePage={activePage}
        onNavigate={setActivePage}
      />
      <div className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
        <Topbar
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          activePage={activePage}
        />
        {renderPage()}
      </div>
    </div>
  );
}
