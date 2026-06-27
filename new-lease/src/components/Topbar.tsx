import React from 'react';
import { Bell, Menu, Search, ChevronDown } from 'lucide-react';
import { notifications } from '../data/mockData';

interface TopbarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  activePage: string;
}

const pageLabels: Record<string, string> = {
  dashboard: 'Dashboard ภาพรวมระบบ',
  contracts: 'รายการสัญญาทั้งหมด',
  'new-contract': 'สร้างสัญญาใหม่',
  templates: 'Template & Clause Library',
  approval: 'Workflow อนุมัติสัญญา',
  esignature: 'e-Signature ออนไลน์',
  repository: 'คลังเอกสารสัญญา',
  renewal: 'ต่ออายุสัญญา',
  transfer: 'โอนสิทธิ์การเช่า',
  amendment: 'แก้ไข / บันทึกแนบท้าย',
  termination: 'ยกเลิกสัญญา',
  billing: 'การเงิน & Billing',
  obligations: 'ติดตามภาระผูกพัน',
  reports: 'รายงานและวิเคราะห์',
  assets: 'ทรัพย์สิน & GIS',
  tenants: 'ข้อมูลผู้เช่า',
  audit: 'Audit Trail & Governance',
  settings: 'ตั้งค่าระบบ',
  notifications: 'การแจ้งเตือน',
};

export default function Topbar({ sidebarOpen, onToggleSidebar, activePage }: TopbarProps) {
  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="topbar">
      <div className="topbar-left">
        <button
          onClick={onToggleSidebar}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--srt-gray-600)', display: 'flex', alignItems: 'center' }}
        >
          <Menu size={20} />
        </button>
        <div style={{ fontSize: 13, color: 'var(--srt-gray-500)' }}>
          New Lease &rsaquo; <span style={{ color: 'var(--srt-gray-800)', fontWeight: 600 }}>{pageLabels[activePage] || activePage}</span>
        </div>
      </div>

      <div className="topbar-right">
        <div className="search-box">
          <Search size={14} className="search-icon" />
          <input placeholder="ค้นหาสัญญา ผู้เช่า ทรัพย์สิน..." />
        </div>

        <button className="notification-btn">
          <Bell size={16} />
          {unread > 0 && <span className="notification-dot" />}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '4px 8px', borderRadius: 8, border: '1px solid var(--srt-gray-200)' }}>
          <div className="user-avatar">วช</div>
          <div style={{ fontSize: 12 }}>
            <div style={{ fontWeight: 600, color: 'var(--srt-gray-800)' }}>นายวิชัย การรถไฟ</div>
            <div style={{ color: 'var(--srt-gray-500)' }}>ผู้มีอำนาจลงนาม SRT</div>
          </div>
          <ChevronDown size={14} color="var(--srt-gray-400)" />
        </div>
      </div>
    </div>
  );
}
