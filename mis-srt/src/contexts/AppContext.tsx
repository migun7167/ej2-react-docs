import React, { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';
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
  setCurrentUser: Dispatch<SetStateAction<CurrentUser | null>>;
  requests: Request[];
  setRequests: Dispatch<SetStateAction<Request[]>>;
  addRequest: (request: Request) => void;
  updateRequest: (id: string, updates: Partial<Request>) => void;
  contracts: Contract[];
  setContracts: Dispatch<SetStateAction<Contract[]>>;
  invoices: Invoice[];
  setInvoices: Dispatch<SetStateAction<Invoice[]>>;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  notifications: Notification[];
  setNotifications: Dispatch<SetStateAction<Notification[]>>;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  users: User[];
  setUsers: Dispatch<SetStateAction<User[]>>;
  unreadCount: number;
  login: (role: UserRole, name: string) => void;
  logout: () => void;
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

  const login = (role: UserRole, name: string) => {
    setCurrentUser({ id: 'demo', name, role, email: `${name}@srt.or.th` });
  };

  const logout = () => setCurrentUser(null);

  return (
    <AppContext.Provider value={{
      currentUser, setCurrentUser,
      requests, setRequests, addRequest, updateRequest,
      contracts, setContracts,
      invoices, setInvoices, updateInvoice,
      notifications, setNotifications, markNotificationRead, markAllNotificationsRead,
      users, setUsers,
      unreadCount, login, logout,
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
