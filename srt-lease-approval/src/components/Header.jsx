import { Menu, Bell, ChevronDown, User } from 'lucide-react';
import { useState } from 'react';

const PAGE_TITLES = {
  dashboard: 'Dashboard ภาพรวมระบบ',
  requests: 'คำขอเช่าทรัพย์สิน',
  new_request: 'ยื่นคำขอเช่าใหม่',
  request_detail: 'รายละเอียดคำขอเช่า',
  assets: 'ค้นหาและตรวจสอบทรัพย์สิน',
  inspection: 'จัดการตรวจพื้นที่',
  valuation: 'จัดการประเมินราคา',
  invitation: 'ประกาศเชิญชวน / Tender',
  approval: 'Workflow อนุมัติ',
  deposit: 'การชำระค่ามัดจำ',
  reports: 'รายงานและการวิเคราะห์',
};

const ROLES = ['Officer', 'Approver', 'Executive', 'Admin', 'Applicant'];

export default function Header({ currentPage, onToggleSidebar, currentRole, onRoleChange }) {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [notifCount] = useState(5);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-4 flex-shrink-0">
      <button
        onClick={onToggleSidebar}
        className="text-gray-500 hover:text-srt-navy transition-colors lg:hidden"
      >
        <Menu size={22} />
      </button>

      <div className="flex-1">
        <h1 className="text-lg font-semibold text-srt-navy-dark">
          {PAGE_TITLES[currentPage] || 'ระบบบริหารคำขอเช่า'}
        </h1>
        <p className="text-xs text-gray-400">การรถไฟแห่งประเทศไทย — Lease Request & Approval System</p>
      </div>

      {/* Breadcrumb / date */}
      <div className="hidden md:flex items-center text-xs text-gray-400 gap-1">
        <span>วันที่</span>
        <span className="text-srt-navy font-medium">27 มิถุนายน 2569</span>
      </div>

      {/* Notifications */}
      <button className="relative text-gray-500 hover:text-srt-navy transition-colors">
        <Bell size={20} />
        {notifCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-srt-red text-white text-xs rounded-full flex items-center justify-center">
            {notifCount}
          </span>
        )}
      </button>

      {/* Role Switcher */}
      <div className="relative">
        <button
          onClick={() => setShowRoleMenu(!showRoleMenu)}
          className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 transition-colors"
        >
          <div className="w-7 h-7 bg-srt-navy rounded-full flex items-center justify-center">
            <User size={14} className="text-white" />
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-medium text-srt-navy-dark">สมชาย ใจดี</div>
            <div className="text-xs text-gray-400">{currentRole}</div>
          </div>
          <ChevronDown size={14} className="text-gray-400" />
        </button>

        {showRoleMenu && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
            <div className="p-2 border-b border-gray-100">
              <p className="text-xs text-gray-400 px-2">เปลี่ยน Role (Demo)</p>
            </div>
            {ROLES.map(role => (
              <button
                key={role}
                onClick={() => { onRoleChange(role); setShowRoleMenu(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  currentRole === role
                    ? 'bg-srt-navy/5 text-srt-navy font-medium'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
