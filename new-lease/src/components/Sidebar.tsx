import React from 'react';
import {
  LayoutDashboard, FileText, FileSearch, CheckSquare, PenTool, Archive,
  DollarSign, RefreshCw, ArrowRightLeft, Edit3, XCircle, AlertTriangle,
  Bell, BarChart2, Shield, Settings, ChevronLeft, ChevronRight,
  BookOpen, Users, Map
} from 'lucide-react';

interface NavItem {
  icon: React.ReactNode;
  text: string;
  id: string;
  badge?: number;
  section?: string;
}

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
  activePage: string;
  onNavigate: (page: string) => void;
}

const navItems: (NavItem | { section: string })[] = [
  { section: 'หลัก' },
  { icon: <LayoutDashboard size={18} />, text: 'Dashboard', id: 'dashboard' },
  { icon: <FileText size={18} />, text: 'รายการสัญญา', id: 'contracts', badge: 0 },
  { icon: <Bell size={18} />, text: 'การแจ้งเตือน', id: 'notifications', badge: 5 },

  { section: 'บริหารสัญญา' },
  { icon: <FileSearch size={18} />, text: 'สร้างสัญญาใหม่', id: 'new-contract' },
  { icon: <BookOpen size={18} />, text: 'Template & Clause', id: 'templates' },
  { icon: <CheckSquare size={18} />, text: 'อนุมัติสัญญา', id: 'approval', badge: 4 },
  { icon: <PenTool size={18} />, text: 'e-Signature', id: 'esignature', badge: 2 },
  { icon: <Archive size={18} />, text: 'คลังเอกสาร', id: 'repository' },

  { section: 'วงจรสัญญา' },
  { icon: <RefreshCw size={18} />, text: 'ต่ออายุสัญญา', id: 'renewal', badge: 3 },
  { icon: <ArrowRightLeft size={18} />, text: 'โอนสิทธิ์การเช่า', id: 'transfer' },
  { icon: <Edit3 size={18} />, text: 'แก้ไข/บันทึกแนบท้าย', id: 'amendment' },
  { icon: <XCircle size={18} />, text: 'ยกเลิกสัญญา', id: 'termination' },

  { section: 'การเงิน & การชำระเงิน' },
  { icon: <DollarSign size={18} />, text: 'การเงินและ Billing', id: 'billing' },
  { icon: <AlertTriangle size={18} />, text: 'ติดตามหนี้/ภาระผูกพัน', id: 'obligations' },

  { section: 'ระบบ & รายงาน' },
  { icon: <BarChart2 size={18} />, text: 'รายงานและวิเคราะห์', id: 'reports' },
  { icon: <Map size={18} />, text: 'ทรัพย์สิน & GIS', id: 'assets' },
  { icon: <Users size={18} />, text: 'ผู้เช่า', id: 'tenants' },
  { icon: <Shield size={18} />, text: 'Audit Trail', id: 'audit' },
  { icon: <Settings size={18} />, text: 'ตั้งค่าระบบ', id: 'settings' },
];

export default function Sidebar({ open, onToggle, activePage, onNavigate }: SidebarProps) {
  return (
    <div className={`sidebar ${open ? 'open' : 'collapsed'}`}>
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">CM</div>
        {open && (
          <div className="sidebar-logo-text">
            <div className="sidebar-logo-title">Contract Management</div>
            <div className="sidebar-logo-sub">ระบบบริหารจัดการสัญญา</div>
          </div>
        )}
        <button
          onClick={onToggle}
          style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', flexShrink: 0 }}
        >
          {open ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item, i) => {
          if ('section' in item && !('id' in item)) {
            return open ? (
              <div key={i} className="sidebar-section-label">{item.section}</div>
            ) : <div key={i} style={{ height: 8 }} />;
          }
          const navItem = item as NavItem;
          return (
            <div
              key={navItem.id}
              className={`nav-item ${activePage === navItem.id ? 'active' : ''}`}
              onClick={() => onNavigate(navItem.id)}
              title={!open ? navItem.text : undefined}
            >
              <span className="nav-item-icon">{navItem.icon}</span>
              {open && <span className="nav-item-text">{navItem.text}</span>}
              {open && navItem.badge ? (
                <span className="nav-item-badge">{navItem.badge}</span>
              ) : null}
            </div>
          );
        })}
      </nav>

      {open && (
        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: 11, opacity: 0.4 }}>
          SRT CMS v1.0.0 • 2567
        </div>
      )}
    </div>
  );
}
