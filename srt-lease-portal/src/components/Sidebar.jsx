import { useState } from 'react';
import {
  LayoutDashboard, Users, FilePlus, FileText, CheckSquare, Building2,
  Search, ClipboardCheck, DollarSign, Calculator, Megaphone, GitBranch,
  CreditCard, ArrowRightLeft, BarChart3, ScrollText, Settings,
  ChevronLeft, ChevronRight, Train, ChevronDown, ChevronUp,
} from 'lucide-react';

const NAV_GROUPS = [
  {
    label: 'หน้าหลัก',
    items: [
      { key: 'dashboard', label: 'แดชบอร์ด', icon: LayoutDashboard },
    ],
  },
  {
    label: 'ผู้ขอเช่า',
    items: [
      { key: 'tenant',      label: 'พอร์ทัลผู้ขอเช่า', icon: Users },
      { key: 'new_request', label: 'ยื่นคำขอใหม่',     icon: FilePlus },
    ],
  },
  {
    label: 'คำขอเช่า',
    items: [
      { key: 'requests',  label: 'รายการคำขอทั้งหมด', icon: FileText, badge: 38 },
      { key: 'doc_check', label: 'ตรวจสอบเอกสาร',     icon: CheckSquare },
    ],
  },
  {
    label: 'ทรัพย์สิน',
    items: [
      { key: 'assets', label: 'ค้นหาทรัพย์สิน', icon: Building2 },
    ],
  },
  {
    label: 'การดำเนินการ',
    items: [
      { key: 'inspection', label: 'ตรวจพื้นที่',      icon: ClipboardCheck, badge: 5 },
      { key: 'valuation',  label: 'ประเมินราคา',       icon: Calculator },
      { key: 'invitation', label: 'ประกาศเชิญชวน',    icon: Megaphone },
    ],
  },
  {
    label: 'อนุมัติ',
    items: [
      { key: 'approval', label: 'Workflow อนุมัติ', icon: GitBranch, badge: 9 },
    ],
  },
  {
    label: 'การเงิน',
    items: [
      { key: 'deposit', label: 'ชำระค่ามัดจำ', icon: CreditCard, badge: 12 },
    ],
  },
  {
    label: 'ส่งต่อเข้าสัญญา',
    items: [
      { key: 'handoff', label: 'ส่งต่อทำสัญญาเช่า', icon: ArrowRightLeft },
    ],
  },
  {
    label: 'รายงาน',
    items: [
      { key: 'reports', label: 'รายงาน & วิเคราะห์', icon: BarChart3 },
    ],
  },
  {
    label: 'ระบบ',
    items: [
      { key: 'audit',    label: 'Audit Log',  icon: ScrollText },
      { key: 'settings', label: 'ตั้งค่าระบบ', icon: Settings },
    ],
  },
];

export default function Sidebar({ currentPage, onNavigate, isOpen, onToggle }) {
  const [collapsedGroups, setCollapsedGroups] = useState({});

  const toggleGroup = (label) => {
    setCollapsedGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside
      className={`flex flex-col h-screen bg-srt-navy text-white transition-all duration-300 flex-shrink-0 ${isOpen ? 'w-64' : 'w-16'}`}
      style={{ boxShadow: '4px 0 20px rgba(0,0,0,0.15)' }}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-4 border-b border-white/10 min-h-[72px] ${!isOpen && 'justify-center'}`}>
        <div className="flex-shrink-0 w-9 h-9 bg-srt-red rounded-xl flex items-center justify-center shadow-lg">
          <Train size={20} className="text-white" />
        </div>
        {isOpen && (
          <div className="overflow-hidden">
            <div className="text-xs font-bold leading-tight text-white">การรถไฟแห่งประเทศไทย</div>
            <div className="text-[10px] text-white/60 leading-tight mt-0.5">ระบบบริหารคำขอเช่าทรัพย์สิน</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 sb-scroll">
        {NAV_GROUPS.map((group) => {
          const isCollapsed = collapsedGroups[group.label];
          return (
            <div key={group.label} className="mb-1">
              {isOpen && (
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="w-full flex items-center justify-between px-4 py-1.5 text-[10px] font-bold text-white/40 uppercase tracking-widest hover:text-white/60 transition-colors"
                >
                  <span>{group.label}</span>
                  {isCollapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
                </button>
              )}
              {!isCollapsed && (
                <div>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.key;
                    return (
                      <button
                        key={item.key}
                        onClick={() => onNavigate(item.key)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all relative group
                          ${isOpen ? '' : 'justify-center'}
                          ${isActive
                            ? 'bg-white/10 text-white font-semibold'
                            : 'text-white/70 hover:bg-white/5 hover:text-white'
                          }`}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-1 bottom-1 w-1 bg-srt-gold rounded-r-full" />
                        )}
                        <Icon size={18} className="flex-shrink-0" />
                        {isOpen && (
                          <>
                            <span className="flex-1 text-left text-[13px]">{item.label}</span>
                            {item.badge && (
                              <span className="bg-srt-red text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                        {!isOpen && item.badge && (
                          <span className="absolute top-1 right-1 bg-srt-red text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                            {item.badge > 9 ? '9+' : item.badge}
                          </span>
                        )}
                        {!isOpen && (
                          <div className="absolute left-14 bg-srt-navy-d text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg border border-white/10">
                            {item.label}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Toggle button */}
      <div className="border-t border-white/10 p-3 flex justify-center">
        <button
          onClick={onToggle}
          className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>
    </aside>
  );
}
