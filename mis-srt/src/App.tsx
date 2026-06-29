import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useApp } from './contexts/AppContext'
import MainLayout from './layouts/MainLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import TasksPage from './pages/TasksPage'
import NewRequestPage from './pages/NewRequestPage'
import RequestListPage from './pages/RequestListPage'
import RequestDetailPage from './pages/RequestDetailPage'
import DocumentsPage from './pages/DocumentsPage'
import MapPage from './pages/MapPage'
import InvoicesPage from './pages/InvoicesPage'
import ContractsPage from './pages/ContractsPage'
import ReportsPage from './pages/ReportsPage'
import AdminPage from './pages/AdminPage'

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useApp()
  if (!currentUser) return <Navigate to="/login" replace />
  return <MainLayout>{children}</MainLayout>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
      <Route path="/requests" element={<ProtectedRoute><RequestListPage /></ProtectedRoute>} />
      <Route path="/requests/new" element={<ProtectedRoute><NewRequestPage /></ProtectedRoute>} />
      <Route path="/requests/:id" element={<ProtectedRoute><RequestDetailPage /></ProtectedRoute>} />
      <Route path="/documents" element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
      <Route path="/map" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
      <Route path="/invoices" element={<ProtectedRoute><InvoicesPage /></ProtectedRoute>} />
      <Route path="/contracts" element={<ProtectedRoute><ContractsPage /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
