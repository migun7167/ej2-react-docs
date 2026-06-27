export type ContractStatus =
  | 'draft' | 'review' | 'pending_approval' | 'approved' | 'pending_signature'
  | 'signed' | 'active' | 'expiring_soon' | 'renewal_in_progress' | 'transferred'
  | 'amended' | 'termination_in_progress' | 'terminated' | 'expired' | 'archived';

export type ContractType = 'ที่ดิน' | 'อาคาร' | 'ห้องพัก' | 'พื้นที่พาณิชย์' | 'ป้ายโฆษณา' | 'ลานจอดรถ' | 'ร้านค้า';
export type Priority = 'High' | 'Medium' | 'Low';
export type RiskLevel = 'สูง' | 'ปานกลาง' | 'ต่ำ';

export interface Contract {
  id: string;
  contractNo: string;
  type: ContractType;
  tenantName: string;
  tenantId: string;
  assetName: string;
  assetCode: string;
  station: string;
  area: number;
  monthlyRent: number;
  deposit: number;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  officer: string;
  riskLevel: RiskLevel;
  hasDebt: boolean;
  debtAmount: number;
  daysToExpiry: number;
  renewalCount: number;
  lastModified: string;
  approvalLevel: number;
  currentApprover: string;
  signerTenant: string;
  signerSRT: string;
  tenantSigned: boolean;
  srtSigned: boolean;
}

export interface Tenant {
  id: string;
  name: string;
  type: 'บุคคลธรรมดา' | 'นิติบุคคล';
  nationalId: string;
  phone: string;
  email: string;
  address: string;
  contracts: number;
  totalDebt: number;
  status: 'ปกติ' | 'มีหนี้ค้าง' | 'ถูกระงับ';
}

export interface ContractTemplate {
  id: string;
  name: string;
  type: ContractType;
  version: string;
  status: 'ใช้งาน' | 'รออนุมัติ' | 'เลิกใช้';
  approvedBy: string;
  approvedDate: string;
  clauses: number;
  usageCount: number;
}

export interface ApprovalTask {
  id: string;
  contractNo: string;
  tenantName: string;
  type: string;
  action: string;
  requestedBy: string;
  requestedDate: string;
  dueDate: string;
  priority: Priority;
  status: 'รอดำเนินการ' | 'กำลังดำเนินการ' | 'อนุมัติแล้ว' | 'ปฏิเสธ';
  value: number;
}

export interface Notification {
  id: string;
  type: 'expiry' | 'debt' | 'approval' | 'signature' | 'renewal' | 'system';
  title: string;
  message: string;
  date: string;
  read: boolean;
  contractNo?: string;
  priority: Priority;
}

export const contracts: Contract[] = [
  {
    id: 'C001', contractNo: 'SRT-2567-001-001', type: 'ร้านค้า',
    tenantName: 'บริษัท ฟูจิ ฟู้ด จำกัด', tenantId: 'T001',
    assetName: 'ร้านค้าชั้น 1 อาคาร A สถานีกรุงเทพ', assetCode: 'BKK-A1-001',
    station: 'สถานีกรุงเทพ', area: 45.5, monthlyRent: 28000, deposit: 84000,
    startDate: '2565-01-01', endDate: '2568-12-31', status: 'active',
    officer: 'นางสาวมาลี รักไทย', riskLevel: 'ต่ำ', hasDebt: false, debtAmount: 0,
    daysToExpiry: 920, renewalCount: 2, lastModified: '2567-06-01',
    approvalLevel: 3, currentApprover: '', signerTenant: 'นายสมชาย ฟูจิ',
    signerSRT: 'นายวิชัย การรถไฟ', tenantSigned: true, srtSigned: true
  },
  {
    id: 'C002', contractNo: 'SRT-2567-001-002', type: 'พื้นที่พาณิชย์',
    tenantName: 'ห้างหุ้นส่วน สยาม ทราเวล', tenantId: 'T002',
    assetName: 'พื้นที่โถงผู้โดยสาร สถานีอยุธยา', assetCode: 'AYA-H-003',
    station: 'สถานีอยุธยา', area: 120.0, monthlyRent: 65000, deposit: 195000,
    startDate: '2566-07-01', endDate: '2567-06-30', status: 'expiring_soon',
    officer: 'นายประเสริฐ ดีงาม', riskLevel: 'สูง', hasDebt: true, debtAmount: 32500,
    daysToExpiry: 15, renewalCount: 1, lastModified: '2567-06-10',
    approvalLevel: 2, currentApprover: 'ผู้อำนวยการฝ่ายทรัพย์สิน',
    signerTenant: 'นายบุญมี สยาม', signerSRT: 'นายวิชัย การรถไฟ', tenantSigned: true, srtSigned: true
  },
  {
    id: 'C003', contractNo: 'SRT-2567-002-003', type: 'ป้ายโฆษณา',
    tenantName: 'บริษัท แอดเวิร์ต มีเดีย จำกัด', tenantId: 'T003',
    assetName: 'ป้ายโฆษณาชานชาลา 1-4 สถานีเชียงใหม่', assetCode: 'CNX-AD-001',
    station: 'สถานีเชียงใหม่', area: 0, monthlyRent: 42000, deposit: 126000,
    startDate: '2567-03-01', endDate: '2568-02-28', status: 'review',
    officer: 'นางสาวกานดา เหนือดาว', riskLevel: 'ปานกลาง', hasDebt: false, debtAmount: 0,
    daysToExpiry: 265, renewalCount: 0, lastModified: '2567-06-20',
    approvalLevel: 1, currentApprover: 'ฝ่ายกฎหมาย',
    signerTenant: '', signerSRT: '', tenantSigned: false, srtSigned: false
  },
  {
    id: 'C004', contractNo: 'SRT-2567-003-004', type: 'ลานจอดรถ',
    tenantName: 'นายสุรศักดิ์ วงษ์ดี', tenantId: 'T004',
    assetName: 'ลานจอดรถสถานีโคราช ส่วน B', assetCode: 'NMA-P-B01',
    station: 'สถานีนครราชสีมา', area: 800.0, monthlyRent: 35000, deposit: 105000,
    startDate: '2567-01-01', endDate: '2569-12-31', status: 'pending_signature',
    officer: 'นายอาทิตย์ สว่าง', riskLevel: 'ต่ำ', hasDebt: false, debtAmount: 0,
    daysToExpiry: 1280, renewalCount: 0, lastModified: '2567-06-22',
    approvalLevel: 2, currentApprover: '',
    signerTenant: 'นายสุรศักดิ์ วงษ์ดี', signerSRT: 'นายวิชัย การรถไฟ', tenantSigned: true, srtSigned: false
  },
  {
    id: 'C005', contractNo: 'SRT-2566-004-005', type: 'อาคาร',
    tenantName: 'บริษัท เซ็นทรัล พลาซา จำกัด', tenantId: 'T005',
    assetName: 'อาคารพาณิชย์ 3 ชั้น ข้างสถานีลาดกระบัง', assetCode: 'LKB-BLD-001',
    station: 'สถานีลาดกระบัง', area: 1200.0, monthlyRent: 280000, deposit: 840000,
    startDate: '2563-01-01', endDate: '2566-12-31', status: 'renewal_in_progress',
    officer: 'นางสาวรัตนา สุขใจ', riskLevel: 'ปานกลาง', hasDebt: false, debtAmount: 0,
    daysToExpiry: -180, renewalCount: 3, lastModified: '2567-06-15',
    approvalLevel: 3, currentApprover: 'ผู้ว่าการรถไฟ',
    signerTenant: 'นายอนันต์ เซ็นทรัล', signerSRT: 'นายวิชัย การรถไฟ', tenantSigned: true, srtSigned: true
  },
  {
    id: 'C006', contractNo: 'SRT-2567-005-006', type: 'ที่ดิน',
    tenantName: 'บริษัท ปตท. สำรวจและผลิต จำกัด', tenantId: 'T006',
    assetName: 'ที่ดิน กม.12+500 ทางรถไฟสายเหนือ', assetCode: 'NL-LND-012',
    station: 'กม.12+500', area: 5000.0, monthlyRent: 125000, deposit: 375000,
    startDate: '2567-06-01', endDate: '2577-05-31', status: 'draft',
    officer: 'นายชัชวาลย์ ไทยรัฐ', riskLevel: 'ต่ำ', hasDebt: false, debtAmount: 0,
    daysToExpiry: 3625, renewalCount: 0, lastModified: '2567-06-25',
    approvalLevel: 0, currentApprover: 'รอตรวจสอบเอกสาร',
    signerTenant: '', signerSRT: '', tenantSigned: false, srtSigned: false
  },
  {
    id: 'C007', contractNo: 'SRT-2565-006-007', type: 'ร้านค้า',
    tenantName: 'ร้านสมชาย ก๋วยเตี๋ยว', tenantId: 'T007',
    assetName: 'ร้านค้าชานชาลา 2 สถานีหัวลำโพง', assetCode: 'HLP-PC2-007',
    station: 'สถานีหัวลำโพง', area: 18.0, monthlyRent: 8500, deposit: 25500,
    startDate: '2562-07-01', endDate: '2565-06-30', status: 'terminated',
    officer: 'นายวรวุฒิ ใจดี', riskLevel: 'สูง', hasDebt: true, debtAmount: 17000,
    daysToExpiry: -730, renewalCount: 1, lastModified: '2565-07-01',
    approvalLevel: 3, currentApprover: '',
    signerTenant: 'นายสมชาย หม้อ', signerSRT: 'นายวิชัย การรถไฟ', tenantSigned: true, srtSigned: true
  },
  {
    id: 'C008', contractNo: 'SRT-2567-007-008', type: 'ห้องพัก',
    tenantName: 'นางวิไล มีสุข', tenantId: 'T008',
    assetName: 'บ้านพักพนักงาน อาคาร C ห้อง 302', assetCode: 'QRT-C-302',
    station: 'สำนักงานใหญ่', area: 56.0, monthlyRent: 3200, deposit: 6400,
    startDate: '2567-05-01', endDate: '2568-04-30', status: 'active',
    officer: 'นางสาวกมลา ประดิษฐ์', riskLevel: 'ต่ำ', hasDebt: false, debtAmount: 0,
    daysToExpiry: 305, renewalCount: 0, lastModified: '2567-05-01',
    approvalLevel: 1, currentApprover: '',
    signerTenant: 'นางวิไล มีสุข', signerSRT: 'นางสาวรัตนา สุขใจ', tenantSigned: true, srtSigned: true
  },
  {
    id: 'C009', contractNo: 'SRT-2567-008-009', type: 'พื้นที่พาณิชย์',
    tenantName: 'บริษัท โคเวิร์คกิ้ง สเปซ จำกัด', tenantId: 'T009',
    assetName: 'พื้นที่ Co-Working Space ชั้น 2 สถานีพระนครศรีอยุธยา', assetCode: 'AYA-CW-201',
    station: 'สถานีพระนครศรีอยุธยา', area: 340.0, monthlyRent: 89000, deposit: 267000,
    startDate: '2567-07-01', endDate: '2570-06-30', status: 'pending_approval',
    officer: 'นายธนาวุฒิ สุขเกษม', riskLevel: 'ปานกลาง', hasDebt: false, debtAmount: 0,
    daysToExpiry: 1095, renewalCount: 0, lastModified: '2567-06-24',
    approvalLevel: 2, currentApprover: 'ผู้อำนวยการฝ่ายทรัพย์สิน',
    signerTenant: '', signerSRT: '', tenantSigned: false, srtSigned: false
  },
  {
    id: 'C010', contractNo: 'SRT-2566-009-010', type: 'ที่ดิน',
    tenantName: 'บริษัท ซีพี ออลล์ จำกัด (มหาชน)', tenantId: 'T010',
    assetName: 'ที่ดินสร้าง 7-Eleven สถานีบ้านภาชี', assetCode: 'PHC-LND-001',
    station: 'สถานีบ้านภาชี', area: 200.0, monthlyRent: 55000, deposit: 165000,
    startDate: '2566-01-01', endDate: '2571-12-31', status: 'active',
    officer: 'นางสาวมาลี รักไทย', riskLevel: 'ต่ำ', hasDebt: false, debtAmount: 0,
    daysToExpiry: 1640, renewalCount: 1, lastModified: '2567-01-01',
    approvalLevel: 3, currentApprover: '',
    signerTenant: 'นายก่อเกียรติ ซีพี', signerSRT: 'นายวิชัย การรถไฟ', tenantSigned: true, srtSigned: true
  }
];

export const tenants: Tenant[] = [
  { id: 'T001', name: 'บริษัท ฟูจิ ฟู้ด จำกัด', type: 'นิติบุคคล', nationalId: '0105560123456', phone: '02-234-5678', email: 'fujifood@email.com', address: '123 ถ.สุขุมวิท กรุงเทพฯ', contracts: 2, totalDebt: 0, status: 'ปกติ' },
  { id: 'T002', name: 'ห้างหุ้นส่วน สยาม ทราเวล', type: 'นิติบุคคล', nationalId: '0105530098765', phone: '035-789-012', email: 'siamtravel@email.com', address: '45 ถ.หน้าพระธาตุ อยุธยา', contracts: 1, totalDebt: 32500, status: 'มีหนี้ค้าง' },
  { id: 'T003', name: 'บริษัท แอดเวิร์ต มีเดีย จำกัด', type: 'นิติบุคคล', nationalId: '0105570234567', phone: '053-456-789', email: 'advertmedia@email.com', address: '78 ถ.นิมมานเหมินท์ เชียงใหม่', contracts: 3, totalDebt: 0, status: 'ปกติ' },
  { id: 'T004', name: 'นายสุรศักดิ์ วงษ์ดี', type: 'บุคคลธรรมดา', nationalId: '3101234567890', phone: '044-345-678', email: 'surasak@email.com', address: '12 ถ.มิตรภาพ โคราช', contracts: 1, totalDebt: 0, status: 'ปกติ' },
  { id: 'T005', name: 'บริษัท เซ็นทรัล พลาซา จำกัด', type: 'นิติบุคคล', nationalId: '0105500345678', phone: '02-678-9012', email: 'central@email.com', address: '1 ถ.รัชดาภิเษก กรุงเทพฯ', contracts: 5, totalDebt: 0, status: 'ปกติ' },
];

export const templates: ContractTemplate[] = [
  { id: 'TPL001', name: 'สัญญาเช่าพื้นที่ร้านค้าในสถานี', type: 'ร้านค้า', version: '3.2', status: 'ใช้งาน', approvedBy: 'นายวิสุทธิ์ กฎหมาย', approvedDate: '2566-10-01', clauses: 24, usageCount: 48 },
  { id: 'TPL002', name: 'สัญญาเช่าพื้นที่โฆษณาป้าย', type: 'ป้ายโฆษณา', version: '2.1', status: 'ใช้งาน', approvedBy: 'นายวิสุทธิ์ กฎหมาย', approvedDate: '2566-08-15', clauses: 18, usageCount: 23 },
  { id: 'TPL003', name: 'สัญญาเช่าที่ดินระยะยาว', type: 'ที่ดิน', version: '4.0', status: 'ใช้งาน', approvedBy: 'นายวิสุทธิ์ กฎหมาย', approvedDate: '2567-01-10', clauses: 32, usageCount: 12 },
  { id: 'TPL004', name: 'สัญญาเช่าอาคาร', type: 'อาคาร', version: '2.5', status: 'รออนุมัติ', approvedBy: '', approvedDate: '', clauses: 28, usageCount: 0 },
  { id: 'TPL005', name: 'สัญญาเช่าลานจอดรถ', type: 'ลานจอดรถ', version: '1.0', status: 'ใช้งาน', approvedBy: 'นายวิสุทธิ์ กฎหมาย', approvedDate: '2567-03-01', clauses: 15, usageCount: 8 },
  { id: 'TPL006', name: 'สัญญาเช่าพื้นที่พาณิชยกรรม', type: 'พื้นที่พาณิชย์', version: '3.1', status: 'ใช้งาน', approvedBy: 'นายวิสุทธิ์ กฎหมาย', approvedDate: '2566-12-01', clauses: 26, usageCount: 31 },
];

export const approvalTasks: ApprovalTask[] = [
  { id: 'APV001', contractNo: 'SRT-2567-008-009', tenantName: 'บริษัท โคเวิร์คกิ้ง สเปซ จำกัด', type: 'พื้นที่พาณิชย์', action: 'อนุมัติสัญญาใหม่', requestedBy: 'นายธนาวุฒิ สุขเกษม', requestedDate: '2567-06-20', dueDate: '2567-06-27', priority: 'High', status: 'รอดำเนินการ', value: 89000 },
  { id: 'APV002', contractNo: 'SRT-2567-001-002', tenantName: 'ห้างหุ้นส่วน สยาม ทราเวล', type: 'พื้นที่พาณิชย์', action: 'ต่ออายุสัญญา', requestedBy: 'นายประเสริฐ ดีงาม', requestedDate: '2567-06-18', dueDate: '2567-06-25', priority: 'High', status: 'รอดำเนินการ', value: 65000 },
  { id: 'APV003', contractNo: 'SRT-2567-002-003', tenantName: 'บริษัท แอดเวิร์ต มีเดีย จำกัด', type: 'ป้ายโฆษณา', action: 'ตรวจสอบกฎหมาย', requestedBy: 'นางสาวกานดา เหนือดาว', requestedDate: '2567-06-22', dueDate: '2567-06-29', priority: 'Medium', status: 'กำลังดำเนินการ', value: 42000 },
  { id: 'APV004', contractNo: 'SRT-2565-006-007', tenantName: 'ร้านสมชาย ก๋วยเตี๋ยว', type: 'ร้านค้า', action: 'อนุมัติยกเลิกสัญญา', requestedBy: 'นายวรวุฒิ ใจดี', requestedDate: '2567-06-15', dueDate: '2567-06-22', priority: 'Medium', status: 'อนุมัติแล้ว', value: 8500 },
];

export const notifications: Notification[] = [
  { id: 'N001', type: 'expiry', title: 'สัญญาใกล้หมดอายุ', message: 'สัญญา SRT-2567-001-002 ของ สยาม ทราเวล จะหมดอายุในอีก 15 วัน', date: '2567-06-26', read: false, contractNo: 'SRT-2567-001-002', priority: 'High' },
  { id: 'N002', type: 'approval', title: 'รออนุมัติสัญญาใหม่', message: 'สัญญา SRT-2567-008-009 รอการอนุมัติจากผู้อำนวยการ', date: '2567-06-25', read: false, contractNo: 'SRT-2567-008-009', priority: 'High' },
  { id: 'N003', type: 'debt', title: 'มีหนี้ค้างชำระ', message: 'สัญญา SRT-2567-001-002 มียอดค้างชำระ 32,500 บาท', date: '2567-06-24', read: false, contractNo: 'SRT-2567-001-002', priority: 'High' },
  { id: 'N004', type: 'signature', title: 'รอการลงนาม', message: 'สัญญา SRT-2567-003-004 รอการลงนามของผู้มีอำนาจ SRT', date: '2567-06-23', read: true, contractNo: 'SRT-2567-003-004', priority: 'Medium' },
  { id: 'N005', type: 'renewal', title: 'ต่ออายุสัญญาสำเร็จ', message: 'สัญญา SRT-2566-004-005 ต่ออายุเรียบร้อยแล้ว', date: '2567-06-20', read: true, contractNo: 'SRT-2566-004-005', priority: 'Low' },
];

export const kpiData = {
  totalContracts: 1248,
  activeContracts: 892,
  expiringIn30Days: 67,
  pendingApproval: 34,
  pendingSignature: 21,
  totalDebt: 4520000,
  monthlyRevenue: 18750000,
  renewalRate: 87.3,
  avgProcessingDays: 8.5,
  contractsThisMonth: 42,
};

export const monthlyRevenue = [
  { month: 'ม.ค.', revenue: 16200000, target: 17000000 },
  { month: 'ก.พ.', revenue: 16800000, target: 17000000 },
  { month: 'มี.ค.', revenue: 17400000, target: 17000000 },
  { month: 'เม.ย.', revenue: 16900000, target: 17500000 },
  { month: 'พ.ค.', revenue: 18100000, target: 17500000 },
  { month: 'มิ.ย.', revenue: 18750000, target: 18000000 },
];

export const contractsByType = [
  { name: 'ร้านค้า', value: 342, color: '#0a1f44' },
  { name: 'พื้นที่พาณิชย์', value: 218, color: '#c0392b' },
  { name: 'ที่ดิน', value: 156, color: '#f39c12' },
  { name: 'อาคาร', value: 89, color: '#16a34a' },
  { name: 'ป้ายโฆษณา', value: 234, color: '#7c3aed' },
  { name: 'ลานจอดรถ', value: 78, color: '#0d9488' },
  { name: 'ห้องพัก', value: 131, color: '#ea580c' },
];

export const statusDistribution = [
  { status: 'Active', count: 892, color: '#16a34a' },
  { status: 'Expiring Soon', count: 67, color: '#ea580c' },
  { status: 'Pending Approval', count: 34, color: '#a16207' },
  { status: 'Pending Signature', count: 21, color: '#7c3aed' },
  { status: 'Under Review', count: 18, color: '#1d4ed8' },
  { status: 'Renewal', count: 45, color: '#7e22ce' },
  { status: 'Terminated', count: 89, color: '#b91c1c' },
  { status: 'Expired', count: 82, color: '#64748b' },
];

export const stationData = [
  { station: 'สถานีกรุงเทพ', contracts: 187, revenue: 4250000 },
  { station: 'สถานีหัวลำโพง', contracts: 142, revenue: 2890000 },
  { station: 'สถานีเชียงใหม่', contracts: 98, revenue: 1750000 },
  { station: 'สถานีโคราช', contracts: 87, revenue: 1420000 },
  { station: 'สถานีอยุธยา', contracts: 76, revenue: 1280000 },
  { station: 'สถานีลาดกระบัง', contracts: 65, revenue: 2100000 },
  { station: 'สถานีบ้านภาชี', contracts: 54, revenue: 890000 },
  { station: 'อื่นๆ', contracts: 539, revenue: 4170000 },
];

export function getStatusLabel(status: ContractStatus): string {
  const map: Record<ContractStatus, string> = {
    draft: 'ร่างสัญญา',
    review: 'กำลังตรวจสอบ',
    pending_approval: 'รออนุมัติ',
    approved: 'อนุมัติแล้ว',
    pending_signature: 'รอลงนาม',
    signed: 'ลงนามแล้ว',
    active: 'มีผลบังคับ',
    expiring_soon: 'ใกล้หมดอายุ',
    renewal_in_progress: 'กำลังต่ออายุ',
    transferred: 'โอนสิทธิ์แล้ว',
    amended: 'มีการแก้ไข',
    termination_in_progress: 'กำลังยกเลิก',
    terminated: 'ยกเลิกแล้ว',
    expired: 'หมดอายุ',
    archived: 'เก็บถาวร',
  };
  return map[status] || status;
}

export function getStatusClass(status: ContractStatus): string {
  const map: Record<ContractStatus, string> = {
    draft: 'badge-draft', review: 'badge-review', pending_approval: 'badge-pending',
    approved: 'badge-approved', pending_signature: 'badge-pending', signed: 'badge-signed',
    active: 'badge-active', expiring_soon: 'badge-expiring', renewal_in_progress: 'badge-renewal',
    transferred: 'badge-transferred', amended: 'badge-review', termination_in_progress: 'badge-expiring',
    terminated: 'badge-terminated', expired: 'badge-terminated', archived: 'badge-draft',
  };
  return map[status] || 'badge-draft';
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 0 }).format(amount) + ' บาท';
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
}
