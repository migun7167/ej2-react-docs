import { Request, Contract, Invoice, User, Notification, MapAsset } from '../types';

export const mockUsers: User[] = [
  { id: 'u1', name: 'สมชาย ใจดี', email: 'somchai@srt.or.th', role: 'ผู้เช่า', department: 'ภายนอก', status: 'Active', lastLogin: '2026-06-28', phone: '081-111-1111' },
  { id: 'u2', name: 'มานี รักงาน', email: 'manee@srt.or.th', role: 'เจ้าหน้าที่รับคำร้อง', department: 'งานบริหารทรัพย์สิน', status: 'Active', lastLogin: '2026-06-29', phone: '081-222-2222' },
  { id: 'u3', name: 'วิชัย ตรวจพื้นที่', email: 'wichai@srt.or.th', role: 'เจ้าหน้าที่ภาคสนาม', department: 'งานบริหารทรัพย์สิน', status: 'Active', lastLogin: '2026-06-29', phone: '081-333-3333' },
  { id: 'u4', name: 'สุดา การเงิน', email: 'suda@srt.or.th', role: 'เจ้าหน้าที่การเงิน', department: 'งานการเงิน', status: 'Active', lastLogin: '2026-06-28', phone: '081-444-4444' },
  { id: 'u5', name: 'ประยูร สัญญา', email: 'prayoon@srt.or.th', role: 'เจ้าหน้าที่สัญญา', department: 'งานสัญญา', status: 'Active', lastLogin: '2026-06-29', phone: '081-555-5555' },
  { id: 'u6', name: 'ผดุง อนุมัติ', email: 'padung@srt.or.th', role: 'ผู้อนุมัติ', department: 'ฝ่ายบริหาร', status: 'Active', lastLogin: '2026-06-29', phone: '081-666-6666' },
  { id: 'u7', name: 'วรรณา บริหาร', email: 'wanna@srt.or.th', role: 'ผู้บริหาร', department: 'ฝ่ายบริหาร', status: 'Active', lastLogin: '2026-06-27', phone: '081-777-7777' },
  { id: 'u8', name: 'ไอที ดูแลระบบ', email: 'admin@srt.or.th', role: 'Admin', department: 'IT', status: 'Active', lastLogin: '2026-06-29', phone: '081-888-8888' },
  { id: 'u9', name: 'บริษัท ABC จำกัด', email: 'abc@company.com', role: 'ผู้เช่า', department: 'ภายนอก', status: 'Active', lastLogin: '2026-06-25', phone: '02-111-1111' },
  { id: 'u10', name: 'ร้านค้า XYZ', email: 'xyz@shop.com', role: 'ผู้เช่า', department: 'ภายนอก', status: 'Locked', lastLogin: '2026-06-01', phone: '02-222-2222' },
];

export const mockRequests: Request[] = [
  {
    id: 'r1', requestNo: 'REQ-2026-001', type: 'ขอเช่าใหม่', status: 'Submitted',
    tenantName: 'บริษัท ABC จำกัด', tenantId: 'u9', location: 'พื้นที่ร้านค้า สถานีกลางกรุงเทพอภิวัฒน์',
    area: 50, monthlyRent: 25000, submittedAt: '2026-06-20', updatedAt: '2026-06-25',
    urgency: 'ปกติ', assignedTo: 'มานี รักงาน',
    documents: [
      { id: 'd1', name: 'สำเนาบัตรประชาชน/หนังสือรับรองบริษัท', status: 'Accepted', uploadedAt: '2026-06-20', fileName: 'company_cert.pdf' },
      { id: 'd2', name: 'คำร้องขอเช่า', status: 'Accepted', uploadedAt: '2026-06-20', fileName: 'request_form.pdf' },
      { id: 'd3', name: 'แผนที่หรือรายละเอียดพื้นที่', status: 'Pending Review', uploadedAt: '2026-06-21', fileName: 'area_map.pdf' },
      { id: 'd4', name: 'หนังสือมอบอำนาจ', status: 'Missing', note: 'กรุณาแนบหนังสือมอบอำนาจ' },
    ],
    timeline: [
      { id: 't1', date: '2026-06-20 09:00', status: 'Submitted', actor: 'บริษัท ABC จำกัด', note: 'ส่งคำร้องขอเช่าพื้นที่' },
      { id: 't2', date: '2026-06-20 10:30', status: 'Under Review', actor: 'มานี รักงาน', note: 'รับคำร้องและเริ่มตรวจสอบ' },
    ],
    auditLogs: [
      { id: 'a1', date: '2026-06-20 09:00', action: 'สร้างคำร้อง', actor: 'บริษัท ABC จำกัด', detail: 'สร้างคำร้องขอเช่าใหม่' },
      { id: 'a2', date: '2026-06-20 10:30', action: 'รับงาน', actor: 'มานี รักงาน', detail: 'รับงานตรวจเอกสาร' },
    ],
    notes: 'ขอเช่าพื้นที่ขายอาหารและเครื่องดื่ม',
  },
  {
    id: 'r2', requestNo: 'REQ-2026-002', type: 'ขอเช่าใหม่', status: 'Missing Documents',
    tenantName: 'ร้านค้า XYZ', tenantId: 'u10', location: 'พื้นที่ร้านค้า สถานีเชียงใหม่',
    area: 30, monthlyRent: 15000, submittedAt: '2026-06-18', updatedAt: '2026-06-22',
    urgency: 'เร่งด่วน', assignedTo: 'มานี รักงาน',
    documents: [
      { id: 'd5', name: 'สำเนาบัตรประชาชน', status: 'Accepted', uploadedAt: '2026-06-18', fileName: 'id_card.pdf' },
      { id: 'd6', name: 'คำร้องขอเช่า', status: 'Invalid', uploadedAt: '2026-06-18', fileName: 'request.pdf', note: 'แบบฟอร์มไม่ถูกต้อง กรุณาใช้แบบฟอร์มล่าสุด' },
      { id: 'd7', name: 'แผนที่หรือรายละเอียดพื้นที่', status: 'Missing' },
    ],
    timeline: [
      { id: 't3', date: '2026-06-18 14:00', status: 'Submitted', actor: 'ร้านค้า XYZ', note: 'ส่งคำร้องขอเช่าพื้นที่' },
      { id: 't4', date: '2026-06-22 09:00', status: 'Missing Documents', actor: 'มานี รักงาน', note: 'ส่งกลับ: แบบฟอร์มไม่ถูกต้อง และขาดแผนที่' },
    ],
    auditLogs: [
      { id: 'a3', date: '2026-06-18 14:00', action: 'สร้างคำร้อง', actor: 'ร้านค้า XYZ', detail: 'สร้างคำร้องขอเช่าใหม่' },
      { id: 'a4', date: '2026-06-22 09:00', action: 'ส่งกลับแก้ไข', actor: 'มานี รักงาน', detail: 'เอกสารไม่ครบและไม่ถูกต้อง' },
    ],
    notes: '',
  },
  {
    id: 'r3', requestNo: 'REQ-2026-003', type: 'ขอเช่าใหม่', status: 'Waiting Approval',
    tenantName: 'สมชาย ใจดี', tenantId: 'u1', location: 'พื้นที่คลังสินค้า สถานีขอนแก่น',
    area: 200, monthlyRent: 45000, submittedAt: '2026-06-10', updatedAt: '2026-06-27',
    urgency: 'ใกล้ครบกำหนด', assignedTo: 'ผดุง อนุมัติ',
    documents: [
      { id: 'd8', name: 'สำเนาบัตรประชาชน', status: 'Accepted', uploadedAt: '2026-06-10', fileName: 'id_card.pdf' },
      { id: 'd9', name: 'คำร้องขอเช่า', status: 'Accepted', uploadedAt: '2026-06-10', fileName: 'request_form.pdf' },
      { id: 'd10', name: 'แผนที่หรือรายละเอียดพื้นที่', status: 'Accepted', uploadedAt: '2026-06-10', fileName: 'area_map.pdf' },
    ],
    timeline: [
      { id: 't5', date: '2026-06-10 09:00', status: 'Submitted', actor: 'สมชาย ใจดี', note: 'ส่งคำร้อง' },
      { id: 't6', date: '2026-06-11 10:00', status: 'Under Review', actor: 'มานี รักงาน', note: 'ตรวจเอกสาร' },
      { id: 't7', date: '2026-06-15 14:00', status: 'Field Inspection', actor: 'วิชัย ตรวจพื้นที่', note: 'ตรวจพื้นที่แล้ว พื้นที่พร้อม' },
      { id: 't8', date: '2026-06-20 09:00', status: 'Price Evaluation', actor: 'มานี รักงาน', note: 'ประเมินราคาค่าเช่า 45,000 บาท/เดือน' },
      { id: 't9', date: '2026-06-27 11:00', status: 'Waiting Approval', actor: 'มานี รักงาน', note: 'ส่งให้ผู้อนุมัติพิจารณา' },
    ],
    auditLogs: [
      { id: 'a5', date: '2026-06-10 09:00', action: 'สร้างคำร้อง', actor: 'สมชาย ใจดี', detail: '' },
      { id: 'a6', date: '2026-06-27 11:00', action: 'ส่งอนุมัติ', actor: 'มานี รักงาน', detail: 'ส่งให้ผดุง อนุมัติ' },
    ],
    notes: 'ใช้จัดเก็บสินค้า',
  },
  {
    id: 'r4', requestNo: 'REQ-2026-004', type: 'ต่อสัญญา', status: 'Waiting Payment',
    tenantName: 'บริษัท DEF จำกัด', tenantId: 'u9', location: 'ป้ายโฆษณา สถานีหัวหิน',
    area: 10, monthlyRent: 8000, submittedAt: '2026-06-05', updatedAt: '2026-06-28',
    urgency: 'เร่งด่วน', assignedTo: 'สุดา การเงิน',
    documents: [
      { id: 'd11', name: 'สัญญาเดิม', status: 'Accepted', uploadedAt: '2026-06-05', fileName: 'old_contract.pdf' },
      { id: 'd12', name: 'คำร้องต่อสัญญา', status: 'Accepted', uploadedAt: '2026-06-05', fileName: 'renew_request.pdf' },
      { id: 'd13', name: 'หลักฐานไม่มีหนี้ค้าง', status: 'Accepted', uploadedAt: '2026-06-06', fileName: 'no_debt.pdf' },
    ],
    timeline: [
      { id: 't10', date: '2026-06-05 09:00', status: 'Submitted', actor: 'บริษัท DEF จำกัด', note: 'ยื่นคำร้องต่อสัญญา' },
      { id: 't11', date: '2026-06-10 10:00', status: 'Under Review', actor: 'มานี รักงาน', note: 'ตรวจเอกสาร' },
      { id: 't12', date: '2026-06-20 14:00', status: 'Waiting Approval', actor: 'มานี รักงาน', note: 'ส่งอนุมัติ' },
      { id: 't13', date: '2026-06-25 09:00', status: 'Waiting Payment', actor: 'ผดุง อนุมัติ', note: 'อนุมัติแล้ว รอชำระค่าธรรมเนียม' },
    ],
    auditLogs: [],
    notes: 'ต่อสัญญาอีก 1 ปี',
  },
  {
    id: 'r5', requestNo: 'REQ-2026-005', type: 'ขอเช่าใหม่', status: 'Active',
    tenantName: 'บริษัท GHI จำกัด', tenantId: 'u9', location: 'พื้นที่ขายอาหาร สถานีอยุธยา',
    area: 40, monthlyRent: 20000, submittedAt: '2026-05-01', updatedAt: '2026-06-01',
    urgency: 'ปกติ', assignedTo: 'ประยูร สัญญา',
    documents: [
      { id: 'd14', name: 'สำเนาบัตรประชาชน', status: 'Accepted', uploadedAt: '2026-05-01', fileName: 'id.pdf' },
      { id: 'd15', name: 'คำร้องขอเช่า', status: 'Accepted', uploadedAt: '2026-05-01', fileName: 'req.pdf' },
    ],
    timeline: [
      { id: 't14', date: '2026-05-01 09:00', status: 'Submitted', actor: 'บริษัท GHI จำกัด', note: 'ส่งคำร้อง' },
      { id: 't15', date: '2026-06-01 10:00', status: 'Active', actor: 'ประยูร สัญญา', note: 'สัญญามีผล' },
    ],
    auditLogs: [],
    notes: '',
  },
  {
    id: 'r6', requestNo: 'REQ-2026-006', type: 'โอนสิทธิ์', status: 'Under Review',
    tenantName: 'นาย ก ขอโอน', tenantId: 'u1', location: 'พื้นที่ร้านค้า สถานีลพบุรี',
    area: 25, monthlyRent: 12000, submittedAt: '2026-06-22', updatedAt: '2026-06-28',
    urgency: 'ปกติ', assignedTo: 'มานี รักงาน',
    documents: [
      { id: 'd16', name: 'คำร้องโอนสิทธิ์', status: 'Accepted', uploadedAt: '2026-06-22', fileName: 'transfer.pdf' },
      { id: 'd17', name: 'เอกสารผู้โอน', status: 'Pending Review', uploadedAt: '2026-06-22', fileName: 'sender.pdf' },
      { id: 'd18', name: 'เอกสารผู้รับโอน', status: 'Missing' },
      { id: 'd19', name: 'หนังสือยินยอม', status: 'Missing' },
    ],
    timeline: [
      { id: 't16', date: '2026-06-22 09:00', status: 'Submitted', actor: 'นาย ก ขอโอน', note: 'ยื่นคำร้องโอนสิทธิ์' },
      { id: 't17', date: '2026-06-23 10:00', status: 'Under Review', actor: 'มานี รักงาน', note: 'รับงานตรวจเอกสาร' },
    ],
    auditLogs: [],
    notes: '',
  },
  {
    id: 'r7', requestNo: 'REQ-2026-007', type: 'ยกเลิก', status: 'Field Inspection',
    tenantName: 'บริษัท JKL จำกัด', tenantId: 'u9', location: 'โรงจอดรถ สถานีนครราชสีมา',
    area: 500, monthlyRent: 80000, submittedAt: '2026-06-15', updatedAt: '2026-06-28',
    urgency: 'ใกล้ครบกำหนด', assignedTo: 'วิชัย ตรวจพื้นที่',
    documents: [
      { id: 'd20', name: 'คำร้องยกเลิก', status: 'Accepted', uploadedAt: '2026-06-15', fileName: 'cancel.pdf' },
      { id: 'd21', name: 'สัญญาเดิม', status: 'Accepted', uploadedAt: '2026-06-15', fileName: 'contract.pdf' },
      { id: 'd22', name: 'รายการหนี้ค้าง', status: 'Accepted', uploadedAt: '2026-06-16', fileName: 'debt.pdf' },
    ],
    timeline: [
      { id: 't18', date: '2026-06-15 09:00', status: 'Submitted', actor: 'บริษัท JKL จำกัด', note: 'ยื่นคำร้องยกเลิกสัญญา' },
      { id: 't19', date: '2026-06-20 10:00', status: 'Under Review', actor: 'มานี รักงาน', note: 'ตรวจเอกสาร' },
      { id: 't20', date: '2026-06-28 09:00', status: 'Field Inspection', actor: 'วิชัย ตรวจพื้นที่', note: 'นัดตรวจพื้นที่ส่งคืน' },
    ],
    auditLogs: [],
    notes: 'ยกเลิกก่อนกำหนด',
  },
  {
    id: 'r8', requestNo: 'REQ-2026-008', type: 'ขอเช่าใหม่', status: 'Draft',
    tenantName: 'สมชาย ใจดี', tenantId: 'u1', location: 'พื้นที่ร้านค้า สถานีเพชรบุรี',
    area: 20, monthlyRent: 0, submittedAt: '', updatedAt: '2026-06-29',
    urgency: 'ปกติ', assignedTo: '',
    documents: [],
    timeline: [],
    auditLogs: [],
    notes: '',
  },
];

export const mockContracts: Contract[] = [
  {
    id: 'c1', contractNo: 'CNT-2025-001', tenantName: 'บริษัท GHI จำกัด',
    location: 'พื้นที่ขายอาหาร สถานีอยุธยา', area: 40, monthlyRent: 20000,
    startDate: '2026-06-01', endDate: '2027-05-31', status: 'Active', type: 'ขอเช่าใหม่',
  },
  {
    id: 'c2', contractNo: 'CNT-2025-002', tenantName: 'บริษัท MNO จำกัด',
    location: 'ร้านค้า สถานีเชียงใหม่', area: 60, monthlyRent: 35000,
    startDate: '2025-07-01', endDate: '2026-07-30', status: 'Expiring Soon', type: 'ขอเช่าใหม่',
  },
  {
    id: 'c3', contractNo: 'CNT-2024-003', tenantName: 'ร้านค้า PQR',
    location: 'ป้ายโฆษณา สถานีหัวหิน', area: 10, monthlyRent: 8000,
    startDate: '2024-01-01', endDate: '2025-12-31', status: 'Expired', type: 'ขอเช่าใหม่',
  },
  {
    id: 'c4', contractNo: 'CNT-2025-004', tenantName: 'บริษัท STU จำกัด',
    location: 'พื้นที่คลังสินค้า สถานีขอนแก่น', area: 200, monthlyRent: 45000,
    startDate: '2025-01-01', endDate: '2027-12-31', status: 'Active', type: 'ขอเช่าใหม่',
  },
  {
    id: 'c5', contractNo: 'CNT-2025-005', tenantName: 'บริษัท VWX จำกัด',
    location: 'พื้นที่ร้านค้า สถานีลพบุรี', area: 25, monthlyRent: 12000,
    startDate: '2025-03-01', endDate: '2026-08-15', status: 'Expiring Soon', type: 'ขอเช่าใหม่',
  },
  {
    id: 'c6', contractNo: 'CNT-2025-006', tenantName: 'นาง สาว ABC',
    location: 'ร้านขายของ สถานีนครราชสีมา', area: 15, monthlyRent: 6000,
    startDate: '2025-06-01', endDate: '2026-05-31', status: 'Active', type: 'ขอเช่าใหม่',
  },
];

export const mockInvoices: Invoice[] = [
  {
    id: 'i1', invoiceNo: 'INV-2026-001', contractNo: 'CNT-2025-001',
    tenantName: 'บริษัท GHI จำกัด', amount: 20000, dueDate: '2026-07-05',
    issuedDate: '2026-06-25', status: 'Waiting Payment', paidAmount: 0,
    description: 'ค่าเช่าพื้นที่ประจำเดือน กรกฎาคม 2566',
  },
  {
    id: 'i2', invoiceNo: 'INV-2026-002', contractNo: 'CNT-2025-002',
    tenantName: 'บริษัท MNO จำกัด', amount: 35000, dueDate: '2026-07-05',
    issuedDate: '2026-06-25', status: 'Waiting Payment', paidAmount: 0,
    description: 'ค่าเช่าพื้นที่ประจำเดือน กรกฎาคม 2566',
  },
  {
    id: 'i3', invoiceNo: 'INV-2026-003', contractNo: 'CNT-2025-004',
    tenantName: 'บริษัท STU จำกัด', amount: 45000, dueDate: '2026-06-30',
    issuedDate: '2026-06-15', status: 'Paid', paidAmount: 45000, paidDate: '2026-06-28',
    description: 'ค่าเช่าพื้นที่ประจำเดือน มิถุนายน 2566',
  },
  {
    id: 'i4', invoiceNo: 'INV-2026-004', contractNo: 'CNT-2024-003',
    tenantName: 'ร้านค้า PQR', amount: 8000, dueDate: '2026-05-31',
    issuedDate: '2026-05-15', status: 'Overdue', paidAmount: 0,
    description: 'ค่าเช่าพื้นที่ประจำเดือน พฤษภาคม 2566',
  },
  {
    id: 'i5', invoiceNo: 'INV-2026-005', contractNo: 'CNT-2025-005',
    tenantName: 'บริษัท VWX จำกัด', amount: 12000, dueDate: '2026-07-05',
    issuedDate: '2026-06-25', status: 'Issued', paidAmount: 0,
    description: 'ค่าเช่าพื้นที่ประจำเดือน กรกฎาคม 2566',
  },
  {
    id: 'i6', invoiceNo: 'INV-2026-006', contractNo: 'CNT-2025-001',
    tenantName: 'บริษัท GHI จำกัด', amount: 2500, dueDate: '2026-07-05',
    issuedDate: '2026-06-25', status: 'Waiting Payment', paidAmount: 0,
    description: 'ค่าสาธารณูปโภค เดือน มิถุนายน 2566',
  },
  {
    id: 'i7', invoiceNo: 'INV-2026-007', contractNo: 'CNT-2025-006',
    tenantName: 'นาง สาว ABC', amount: 6000, dueDate: '2026-07-05',
    issuedDate: '2026-06-25', status: 'Waiting Payment', paidAmount: 0,
    description: 'ค่าเช่าพื้นที่ประจำเดือน กรกฎาคม 2566',
  },
  {
    id: 'i8', invoiceNo: 'INV-2026-008', contractNo: 'CNT-2025-002',
    tenantName: 'บริษัท MNO จำกัด', amount: 35000, dueDate: '2026-06-05',
    issuedDate: '2026-05-25', status: 'Paid', paidAmount: 35000, paidDate: '2026-06-03',
    description: 'ค่าเช่าพื้นที่ประจำเดือน มิถุนายน 2566',
  },
];

export const mockNotifications: Notification[] = [
  { id: 'n1', title: 'เอกสารขาด', message: 'คำร้อง REQ-2026-002 ยังขาดเอกสาร 2 รายการ', type: 'warning', read: false, createdAt: '2026-06-29 09:00', link: '/requests/r2' },
  { id: 'n2', title: 'งานรออนุมัติ', message: 'คำร้อง REQ-2026-003 รอการอนุมัติ', type: 'info', read: false, createdAt: '2026-06-29 08:30', link: '/requests/r3' },
  { id: 'n3', title: 'ใบแจ้งหนี้เกินกำหนด', message: 'INV-2026-004 เกินกำหนดชำระ 29 วัน', type: 'error', read: false, createdAt: '2026-06-28 10:00', link: '/invoices' },
  { id: 'n4', title: 'สัญญาใกล้หมดอายุ', message: 'CNT-2025-002 จะหมดอายุใน 31 วัน', type: 'warning', read: true, createdAt: '2026-06-27 09:00', link: '/contracts' },
  { id: 'n5', title: 'ชำระเงินสำเร็จ', message: 'INV-2026-003 ชำระเงินสำเร็จ 45,000 บาท', type: 'success', read: true, createdAt: '2026-06-28 14:00', link: '/invoices' },
  { id: 'n6', title: 'คำร้องใหม่', message: 'REQ-2026-001 ส่งคำร้องขอเช่าพื้นที่', type: 'info', read: true, createdAt: '2026-06-20 09:00', link: '/requests/r1' },
];

export const mockAssets: MapAsset[] = [
  { id: 'a1', name: 'พื้นที่เช่า A1', station: 'สถานีกลางกรุงเทพอภิวัฒน์', status: 'Available', area: 50, lat: 13.7563, lng: 100.5018 },
  { id: 'a2', name: 'พื้นที่ร้านค้า B2', station: 'สถานีเชียงใหม่', status: 'Active', area: 60, tenant: 'บริษัท MNO จำกัด', lat: 18.7861, lng: 98.9856 },
  { id: 'a3', name: 'พื้นที่คลังสินค้า C3', station: 'สถานีขอนแก่น', status: 'Expiring Soon', area: 200, tenant: 'บริษัท STU จำกัด', lat: 16.4419, lng: 102.8360 },
  { id: 'a4', name: 'ป้ายโฆษณา D4', station: 'สถานีหัวหิน', status: 'Overdue', area: 10, tenant: 'ร้านค้า PQR', lat: 12.5664, lng: 99.9583 },
  { id: 'a5', name: 'พื้นที่ขายอาหาร E5', station: 'สถานีอยุธยา', status: 'Active', area: 40, tenant: 'บริษัท GHI จำกัด', lat: 14.3532, lng: 100.5700 },
  { id: 'a6', name: 'โรงจอดรถ F6', station: 'สถานีนครราชสีมา', status: 'Available', area: 500, lat: 14.9799, lng: 102.0977 },
];

export const kpiData = {
  monthlyRevenue: [
    { month: 'ม.ค.', amount: 850000 },
    { month: 'ก.พ.', amount: 920000 },
    { month: 'มี.ค.', amount: 780000 },
    { month: 'เม.ย.', amount: 1050000 },
    { month: 'พ.ค.', amount: 960000 },
    { month: 'มิ.ย.', amount: 1120000 },
  ],
  requestTrend: [
    { month: 'ม.ค.', new: 15, completed: 12, cancelled: 2 },
    { month: 'ก.พ.', new: 18, completed: 15, cancelled: 1 },
    { month: 'มี.ค.', new: 12, completed: 10, cancelled: 3 },
    { month: 'เม.ย.', new: 20, completed: 18, cancelled: 1 },
    { month: 'พ.ค.', new: 22, completed: 19, cancelled: 2 },
    { month: 'มิ.ย.', new: 24, completed: 16, cancelled: 0 },
  ],
  statusBreakdown: [
    { name: 'Draft', value: 3, color: '#8c8c8c' },
    { name: 'Under Review', value: 5, color: '#1890ff' },
    { name: 'Waiting Approval', value: 8, color: '#faad14' },
    { name: 'Waiting Payment', value: 4, color: '#722ed1' },
    { name: 'Active', value: 45, color: '#52c41a' },
    { name: 'Overdue', value: 6, color: '#f5222d' },
  ],
};

export const mockMapAssets = mockAssets;
