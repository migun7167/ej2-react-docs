import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './contexts/AppContext';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import NewRequestPage from './pages/NewRequestPage';
import RequestListPage from './pages/RequestListPage';
import RequestDetailPage from './pages/RequestDetailPage';
import DocumentsPage from './pages/DocumentsPage';
import MapPage from './pages/MapPage';
import InvoicesPage from './pages/InvoicesPage';
import ContractsPage from './pages/ContractsPage';
import ReportsPage from './pages/ReportsPage';
import AdminPage from './pages/AdminPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useApp();
  return currentUser ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="requests" element={<RequestListPage />} />
        <Route path="requests/new" element={<NewRequestPage />} />
        <Route path="requests/:id" element={<RequestDetailPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="map" element={<MapPage />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="contracts" element={<ContractsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="admin" element={<AdminPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
