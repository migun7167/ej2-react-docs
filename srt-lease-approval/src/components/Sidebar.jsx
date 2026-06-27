import {
  LayoutDashboard, FileText, Plus, Search, ClipboardCheck,
  BarChart3, GitBranch, CreditCard, Bell, FileBarChart2,
  Settings, ChevronLeft, ChevronRight, Train
} from 'lucide-react';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'หลัก' },
  { key: 'requests', label: 'คำขอเช่าทั้งหมด', icon: FileText, group: 'คำขอเช่า' },
  { key: 'new_request', label: 'ยื่นคำขอเช่าใหม่', icon: Plus, group: 'คำขอเช่า' },
  { key: 'assets', label: 'ค้นหาทรัพย์สิน', icon: Search, group: 'ทรัพย์สิน' },
  { key: 'inspection', label: 'ตรวจพื้นที่', icon: ClipboardCheck, group: 'การดำเนินการ' },
  { key: 'valuation', label: 'ประเมินราคา', icon: BarChart3, group: 'การดำเนินการ' },
  { key: 'invitation', label: 'ประกาศเชิญชวน', icon: Bell, group: 'การดำเนินการ' },
  { key: 'approval', label: 'Workflow อนุมัติ', icon: GitBranch, group: 'อนุมัติ' },
  { key: 'deposit', label: 'ชำระค่ามัดจำ', icon: CreditCard, group: 'การเงิน' },
  { key: 'reports', label: 'รายงาน & วิเคราะห์', icon: FileBarChart2, group: 'รายงาน' },
];

const groups = [...new Set(NAV_ITEMS.map(i => i.group))];

const BADGE_COUNTS = {
  requests: 38,
  approval: 9,
  deposit: 12,
  inspection: 3,
};

export default function Sidebar({ currentPage, onNavigate, isOpen, onToggle }) {
  return (
    <aside className={`
      ${isOpen ? 'w-64' : 'w-16'}
      transition-all duration-300 flex-shrink-0
      bg-srt-navy-dark flex flex-col h-full
    `}>
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-white/10">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 bg-srt-red rounded-lg flex items-center justify-center flex-shrink-0">
            <Train size={18} className="text-white" />
          </div>
          {isOpen && (
            <div className="overflow-hidden">
              <div className="text-white font-bold text-sm leading-tight whitespace-nowrap">การรถไฟแห่งประเทศไทย</div>
              <div className="text-white/60 text-xs whitespace-nowrap">Lease Management</div>
            </div>
          )}
        </div>
        <button
          onClick={onToggle}
          className="ml-auto text-white/40 hover:text-white transition-colors flex-shrink-0"
        >
          {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto sidebar-scrollbar py-4">
        {groups.map(group => {
          const items = NAV_ITEMS.filter(i => i.group === group);
          return (
            <div key={group} className="mb-4">
              {isOpen && (
                <div className="px-4 mb-1">
                  <span className="text-white/30 text-xs font-semibold uppercase tracking-wider">{group}</span>
                </div>
              )}
              {items.map(item => {
                const Icon = item.icon;
                const isActive = currentPage === item.key;
                const badge = BADGE_COUNTS[item.key];
                return (
                  <button
                    key={item.key}
                    onClick={() => onNavigate(item.key)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all relative
                      ${isActive
                        ? 'bg-srt-navy text-white border-r-2 border-srt-gold'
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                      }
                    `}
                  >
                    <Icon size={18} className="flex-shrink-0" />
                    {isOpen && (
                      <>
                        <span className="flex-1 text-left whitespace-nowrap">{item.label}</span>
                        {badge && (
                          <span className="bg-srt-red text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                            {badge}
                          </span>
                        )}
                      </>
                    )}
                    {!isOpen && badge && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-srt-red rounded-full"></span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 p-3">
        <button
          onClick={() => onNavigate('settings')}
          className="w-full flex items-center gap-3 px-2 py-2 text-white/40 hover:text-white text-sm transition-colors rounded-lg hover:bg-white/10"
        >
          <Settings size={18} className="flex-shrink-0" />
          {isOpen && <span>ตั้งค่าระบบ</span>}
        </button>
      </div>
    </aside>
  );
}
