export type UserRole =
  | 'ผู้เช่า'
  | 'เจ้าหน้าที่รับคำร้อง'
  | 'เจ้าหน้าที่ภาคสนาม'
  | 'เจ้าหน้าที่การเงิน'
  | 'เจ้าหน้าที่สัญญา'
  | 'ผู้อนุมัติ'
  | 'ผู้บริหาร'
  | 'Admin';

export type RequestStatus =
  | 'Draft'
  | 'Submitted'
  | 'Missing Documents'
  | 'Under Review'
  | 'Field Inspection'
  | 'Price Evaluation'
  | 'Waiting Approval'
  | 'Waiting Payment'
  | 'Paid'
  | 'Contracting'
  | 'Active'
  | 'Overdue'
  | 'Completed'
  | 'Cancelled';

export type RequestType = 'ขอเช่าใหม่' | 'ต่อสัญญา' | 'โอนสิทธิ์' | 'ยกเลิก' | 'เปลี่ยนข้อมูล';

export type DocumentStatus = 'Missing' | 'Invalid' | 'Expired' | 'Unreadable' | 'Mismatch' | 'Pending Review' | 'Accepted';

export type InvoiceStatus = 'Draft' | 'Issued' | 'Waiting Payment' | 'Partially Paid' | 'Paid' | 'Overdue' | 'Cancelled';

export type ContractStatus = 'Active' | 'Expiring Soon' | 'Expired' | 'Cancelled';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: 'Active' | 'Locked';
  lastLogin: string;
  phone: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  status: DocumentStatus;
  uploadedAt?: string;
  fileName?: string;
  note?: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  status: RequestStatus;
  actor: string;
  note: string;
}

export interface AuditLog {
  id: string;
  date: string;
  action: string;
  actor: string;
  detail: string;
}

export interface Request {
  id: string;
  requestNo: string;
  type: RequestType;
  status: RequestStatus;
  tenantName: string;
  tenantId: string;
  location: string;
  area: number;
  monthlyRent: number;
  submittedAt: string;
  updatedAt: string;
  urgency: 'เร่งด่วน' | 'ใกล้ครบกำหนด' | 'ปกติ';
  assignedTo?: string;
  documents: DocumentItem[];
  timeline: TimelineEvent[];
  auditLogs: AuditLog[];
  notes: string;
}

export interface Contract {
  id: string;
  contractNo: string;
  tenantName: string;
  location: string;
  area: number;
  monthlyRent: number;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  type: RequestType;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  contractNo: string;
  tenantName: string;
  amount: number;
  dueDate: string;
  issuedDate: string;
  status: InvoiceStatus;
  paidAmount: number;
  paidDate?: string;
  description: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface MapAsset {
  id: string;
  name: string;
  station: string;
  status: 'Available' | 'Active' | 'Expiring Soon' | 'Overdue';
  area: number;
  tenant?: string;
  lat: number;
  lng: number;
}
