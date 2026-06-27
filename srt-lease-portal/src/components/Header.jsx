import { useState } from 'react';
import { Menu, Bell, AlertTriangle, ChevronDown, User } from 'lucide-react';
import { mockNotifications } from '../data/mockData';

const PAGE_TITLES = {
  dashboard:      { title: 'แดชบอร์ด',                section: 'หน้าหลัก' },
  tenant:         { title: 'พอร์ทัลผู้ขอเช่า',         section: 'ผู้ขอเช่า' },
  new_request:    { title: 'ยื่นคำขอใหม่',             section: 'ผู้ขอเช่า' },
  requests:       { title: 'รายการคำขอทั้งหมด',        section: 'คำขอเช่า' },
  request_detail: { title: 'รายละเอียดคำขอ',           section: 'คำขอเช่า' },
  doc_check:      { title: 'ตรวจสอบเอกสาร',            section: 'คำขอเช่า' },
  assets:         { title: 'ค้นหาทรัพย์สิน',           section: 'ทรัพย์สิน' },
  inspection:     { title: 'ตรวจพื้นที่',               section: 'การดำเนินการ' },
  valuation:      { title: 'ประเมินราคา',               section: 'การดำเนินการ' },
  invitation:     { title: 'ประกาศเชิญชวน',            section: 'การดำเนินการ' },
  approval:       { title: 'Workflow อนุมัติ',          section: 'อนุมัติ' },
  deposit:        { title: 'ชำระค่ามัดจำ',             section: 'การเงิน' },
  handoff:        { title: 'ส่งต่อทำสัญญาเช่า',        section: 'ส่งต่อเข้าสัญญา' },
  reports:        { title: 'รายงาน & วิเคราะห์',        section: 'รายงาน' },
  audit:          { title: 'Audit Log',                 section: 'ระบบ' },
  settings:       { title: 'ตั้งค่าระบบ',              section: 'ระบบ' },
};

const ROLES = [
  'ผู้ขอเช่า', 'เจ้าหน้าที่สถานี', 'เจ้าหน้าที่เขต', 'เจ้าหน้าที่ทรัพย์สิน',
  'เจ้าหน้าที่ประเมินราคา', 'เจ้าหน้าที่กฎหมาย', 'เจ้าหน้าที่การเงิน',
  'ผู้อนุมัติ', 'ผู้บริหาร', 'Admin',
];

function ThaiDate() {
  const now = new Date();
  const thaiYear = now.getFullYear() + 543;
  const thaiMonths = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
                      'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
  const thaiDays = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];
  return `${thaiDays[now.getDay()]}ที่ ${now.getDate()} ${thaiMonths[now.getMonth()]} พ.ศ. ${thaiYear}`;
}

export default function Header({ currentPage, onMenuToggle, currentRole, onRoleChange, onNavigate }) {
  const [showNotif, setShowNotif] = useState(false);
  const [showRole, setShowRole] = useState(false);
  const pageInfo = PAGE_TITLES[currentPage] || PAGE_TITLES.dashboard;
  const unread = mockNotifications.filter(n => !n.read).length;
  const overSLA = 7;

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center px-4 gap-4 flex-shrink-0 z-20" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
      {/* Hamburger */}
      <button onClick={onMenuToggle} className="btn-ghost p-2">
        <Menu size={20} />
      </button>

      {/* Title + Breadcrumb */}
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-bold text-srt-navy truncate">{pageInfo.title}</h1>
        <nav className="text-xs text-gray-400 flex items-center gap-1">
          <span>การรถไฟแห่งประเทศไทย</span>
          <span>/</span>
          <span>{pageInfo.section}</span>
          <span>/</span>
          <span className="text-srt-navy font-medium">{pageInfo.title}</span>
        </nav>
      </div>

      {/* Date */}
      <div className="hidden lg:block text-xs text-gray-400 whitespace-nowrap">{ThaiDate()}</div>

      {/* SLA Alert */}
      <button
        onClick={() => onNavigate && onNavigate('requests')}
        className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors"
      >
        <AlertTriangle size={14} />
        <span>เกิน SLA</span>
        <span className="bg-srt-red text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold">{overSLA}</span>
      </button>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => { setShowNotif(!showNotif); setShowRole(false); }}
          className="btn-ghost p-2 relative"
        >
          <Bell size={20} />
          {unread > 0 && (
            <span className="absolute top-1 right-1 bg-srt-red text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {unread}
            </span>
          )}
        </button>
        {showNotif && (
          <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="font-bold text-sm text-srt-navy">การแจ้งเตือน</span>
              <span className="badge bg-red-100 text-red-600">{unread} ใหม่</span>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {mockNotifications.map(n => (
                <div key={n.id} className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${!n.read ? 'bg-blue-50/30' : ''}`}>
                  <div className="flex items-start gap-2">
                    <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${!n.read ? 'bg-srt-red' : 'bg-gray-300'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-800">{n.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</div>
                      <div className="text-[10px] text-gray-400 mt-1">{n.time}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-2 text-center">
              <button className="text-xs text-srt-navy font-medium hover:underline">ดูทั้งหมด</button>
            </div>
          </div>
        )}
      </div>

      {/* Role switcher */}
      <div className="relative">
        <button
          onClick={() => { setShowRole(!showRole); setShowNotif(false); }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-srt-navy flex items-center justify-center">
            <User size={14} className="text-white" />
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-bold text-srt-navy leading-tight">นายสมชาย รักไทย</div>
            <div className="text-[10px] text-gray-400 leading-tight">{currentRole}</div>
          </div>
          <ChevronDown size={14} className="text-gray-400" />
        </button>
        {showRole && (
          <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden py-2">
            <div className="px-4 py-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100 mb-1">เปลี่ยนบทบาท</div>
            {ROLES.map(role => (
              <button
                key={role}
                onClick={() => { onRoleChange(role); setShowRole(false); }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${currentRole === role ? 'text-srt-navy font-bold bg-blue-50' : 'text-gray-700'}`}
              >
                {currentRole === role && <span className="mr-1 text-srt-gold">▸</span>}{role}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Backdrop */}
      {(showNotif || showRole) && (
        <div className="fixed inset-0 z-40" onClick={() => { setShowNotif(false); setShowRole(false); }} />
      )}
    </header>
  );
}
