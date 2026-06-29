import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { User, Request, Contract, Invoice, Notification, UserRole } from '../types';
import { mockUsers, mockRequests, mockContracts, mockInvoices, mockNotifications } from '../data/mockData';

interface CurrentUser {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

interface AppContextType {
  currentUser: CurrentUser | null;
  setCurrentUser: (user: CurrentUser | null) => void;
  requests: Request[];
  setRequests: (requests: Request[]) => void;
  addRequest: (request: Request) => void;
  updateRequest: (id: string, updates: Partial<Request>) => void;
  contracts: Contract[];
  setContracts: (contracts: Contract[]) => void;
  invoices: Invoice[];
  setInvoices: (invoices: Invoice[]) => void;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  users: User[];
  setUsers: (users: User[]) => void;
  unreadCount: number;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [requests, setRequests] = useState<Request[]>(mockRequests);
  const [contracts, setContracts] = useState<Contract[]>(mockContracts);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [users, setUsers] = useState<User[]>(mockUsers);

  const addRequest = (request: Request) => {
    setRequests(prev => [request, ...prev]);
  };

  const updateRequest = (id: string, updates: Partial<Request>) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AppContext.Provider value={{
      currentUser, setCurrentUser,
      requests, setRequests, addRequest, updateRequest,
      contracts, setContracts,
      invoices, setInvoices, updateInvoice,
      notifications, setNotifications, markNotificationRead, markAllNotificationsRead,
      users, setUsers,
      unreadCount,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
