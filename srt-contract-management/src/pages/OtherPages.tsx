import React, { useState } from 'react';
import {
  Archive, DollarSign, AlertTriangle, Shield, Bell, Settings, Users,
  ArrowRightLeft, Edit3, XCircle, Map, CheckCircle, Clock, FileText,
  Search, Download, Filter, Plus
} from 'lucide-react';
import { contracts, tenants, notifications, formatDate, formatCurrency, getStatusLabel, getStatusClass } from '../data/mockData';

// ===================== Repository =====================
export function Repository() {
  const [search, setSearch] = useState('');
  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-title"><Archive size={22} /> คลังเอกสารสัญญา</div>
        <div className="page-header-sub">จัดเก็บ ค้นหา และควบคุมเวอร์ชันเอกสารทั้งหมด</div>
      </div>
      <div className="card mb-4">
        <div className="card-body" style={{ padding: '12px 20px' }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="search-box" style={{ flex: 1 }}>
              <Search size={14} className="search-icon" />
              <input placeholder="ค้นหาเอกสาร เลขสัญญา ผู้เช่า หรือค้นหาด้วย OCR..." style={{ width: '100%' }} />
            </div>
            <select className="form-control" style={{ width: 150 }}>
              <option>ทุกประเภท</option><option>สัญญา</option><option>บันทึกแนบท้าย</option><option>หนังสือบอกเลิก</option>
            </select>
            <button className="btn btn-primary"><Plus size={14} /> อัปโหลดเอกสาร</button>
            <button className="btn btn-ghost"><Download size={14} /> Export</button>
          </div>
        </div>
      </div>
      <div className="grid grid-4 mb-4">
        {[
          { label: 'เอกสารทั้งหมด', value: '8,432', color: '#0a1f44' },
          { label: 'สัญญาที่ active', value: '892', color: '#16a34a' },
          { label: 'พื้นที่จัดเก็บ', value: '45.2 GB', color: '#7c3aed' },
          { label: 'ดาวน์โหลดวันนี้', value: '34', color: '#f39c12' },
        ].map(k => (
          <div key={k.label} className="stat-card">
            <div className="stat-icon" style={{ background: k.color + '18' }}><Archive size={20} color={k.color} /></div>
            <div className="stat-info"><h3 style={{ color: k.color }}>{k.value}</h3><p>{k.label}</p></div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead><tr><th>เอกสาร</th><th>เลขสัญญา</th><th>ผู้เช่า</th><th>ประเภท</th><th>วันที่</th><th>ขนาด</th><th>เวอร์ชัน</th><th>การดำเนินการ</th></tr></thead>
            <tbody>
              {contracts.slice(0, 6).map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, background: '#fee2e2', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'var(--srt-red)' }}>PDF</div>
                      <span style={{ fontSize: 12 }}>สัญญาฉบับลงนาม</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--srt-navy)', fontSize: 12 }}>{c.contractNo}</td>
                  <td style={{ fontSize: 12 }}>{c.tenantName}</td>
                  <td><span style={{ background: 'var(--srt-gray-100)', padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>{c.type}</span></td>
                  <td style={{ fontSize: 12 }}>{formatDate(c.lastModified)}</td>
                  <td style={{ fontSize: 12 }}>2.4 MB</td>
                  <td><span className="badge badge-draft">v{c.renewalCount + 1}.0</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-ghost btn-sm"><FileText size={12} /></button>
                      <button className="btn btn-ghost btn-sm"><Download size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ===================== Billing =====================
export function Billing() {
  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-title"><DollarSign size={22} /> การเงิน & Billing Integration</div>
        <div className="page-header-sub">เชื่อมโยงค่าเช่า เงินประกัน ตารางแจ้งหนี้ และการชำระเงิน</div>
      </div>
      <div className="grid grid-4 mb-4">
        {[
          { label: 'ยอดรวมค่าเช่า/เดือน', value: '฿18.75M', color: '#0a1f44' },
          { label: 'ชำระแล้ว', value: '฿15.2M', color: '#16a34a' },
          { label: 'ค้างชำระ', value: '฿3.55M', color: '#c0392b' },
          { label: 'เงินประกันรวม', value: '฿42.1M', color: '#7c3aed' },
        ].map(k => (
          <div key={k.label} className="stat-card">
            <div className="stat-icon" style={{ background: k.color + '18' }}><DollarSign size={20} color={k.color} /></div>
            <div className="stat-info"><h3 style={{ color: k.color }}>{k.value}</h3><p>{k.label}</p></div>
          </div>
        ))}
      </div>
      <div className="grid grid-2 mb-4">
        <div className="card">
          <div className="card-header"><span className="card-title">ตารางแจ้งหนี้เดือนนี้</span></div>
          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>เลขสัญญา</th><th>ผู้เช่า</th><th>จำนวน</th><th>กำหนดชำระ</th><th>สถานะ</th></tr></thead>
              <tbody>
                {contracts.slice(0, 5).map(c => (
                  <tr key={c.id}>
                    <td style={{ fontSize: 11, color: 'var(--srt-navy)', fontWeight: 600 }}>{c.contractNo}</td>
                    <td style={{ fontSize: 11 }}>{c.tenantName.slice(0, 20)}...</td>
                    <td style={{ fontWeight: 600 }}>฿{c.monthlyRent.toLocaleString()}</td>
                    <td style={{ fontSize: 11 }}>5 ก.ค. 2567</td>
                    <td>
                      <span className={`badge ${c.hasDebt ? 'badge-high' : 'badge-pending'}`}>
                        {c.hasDebt ? 'ค้างชำระ' : 'รอชำระ'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">สัญญาที่มีหนี้ค้าง</span></div>
          <div className="card-body">
            {contracts.filter(c => c.hasDebt).map(c => (
              <div key={c.id} className="alert alert-danger mb-2" style={{ margin: 0, marginBottom: 8 }}>
                <AlertTriangle size={14} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{c.tenantName}</div>
                  <div style={{ fontSize: 12 }}>หนี้ค้าง: ฿{c.debtAmount.toLocaleString()}</div>
                </div>
                <button className="btn btn-danger btn-sm">แจ้งหนี้</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===================== Transfer =====================
export function Transfer() {
  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-title"><ArrowRightLeft size={22} /> โอนสิทธิ์การเช่า</div>
        <div className="page-header-sub">จัดการการโอนสิทธิ์การเช่าระหว่างผู้เช่า</div>
      </div>
      <div className="grid grid-4 mb-4">
        {[
          { label: 'คำขอโอนสิทธิ์', value: 8, color: '#0a1f44' },
          { label: 'รออนุมัติ', value: 3, color: '#f39c12' },
          { label: 'โอนสำเร็จ (ปีนี้)', value: 24, color: '#16a34a' },
          { label: 'ค่าธรรมเนียม/ปี', value: '฿480K', color: '#7c3aed' },
        ].map(k => (
          <div key={k.label} className="stat-card">
            <div className="stat-icon" style={{ background: k.color + '18' }}><ArrowRightLeft size={20} color={k.color} /></div>
            <div className="stat-info"><h3 style={{ color: k.color }}>{k.value}</h3><p>{k.label}</p></div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-header"><span className="card-title">รายการโอนสิทธิ์</span><button className="btn btn-primary btn-sm"><Plus size={14} /> สร้างคำขอโอน</button></div>
        <div className="table-container">
          <table className="data-table">
            <thead><tr><th>เลขสัญญา</th><th>ผู้เช่าเดิม</th><th>ผู้รับโอน</th><th>ทรัพย์สิน</th><th>ค่าธรรมเนียม</th><th>สถานะ</th><th>การดำเนินการ</th></tr></thead>
            <tbody>
              {contracts.slice(0, 4).map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600, color: 'var(--srt-navy)', fontSize: 12 }}>{c.contractNo}</td>
                  <td style={{ fontSize: 12 }}>{c.tenantName}</td>
                  <td style={{ fontSize: 12, color: 'var(--srt-gray-400)' }}>-</td>
                  <td style={{ fontSize: 12 }}>{c.station}</td>
                  <td style={{ fontWeight: 600 }}>฿{(c.monthlyRent * 3).toLocaleString()}</td>
                  <td><span className="badge badge-pending">รอข้อมูล</span></td>
                  <td><button className="btn btn-outline btn-sm">ดำเนินการ</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ===================== Amendment =====================
export function Amendment() {
  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-title"><Edit3 size={22} /> แก้ไข / บันทึกแนบท้ายสัญญา</div>
        <div className="page-header-sub">จัดการการแก้ไขสัญญาและสร้างบันทึกแนบท้าย</div>
      </div>
      <div className="grid grid-4 mb-4">
        {[
          { label: 'คำขอแก้ไข', value: 12, color: '#0a1f44' },
          { label: 'รออนุมัติ', value: 5, color: '#f39c12' },
          { label: 'บันทึกแนบท้าย (ปีนี้)', value: 38, color: '#16a34a' },
          { label: 'เฉลี่ยวันดำเนินการ', value: '4.2 วัน', color: '#7c3aed' },
        ].map(k => (
          <div key={k.label} className="stat-card">
            <div className="stat-icon" style={{ background: k.color + '18' }}><Edit3 size={20} color={k.color} /></div>
            <div className="stat-info"><h3 style={{ color: k.color }}>{k.value}</h3><p>{k.label}</p></div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-header">
          <span className="card-title">รายการขอแก้ไขสัญญา</span>
          <button className="btn btn-primary btn-sm"><Plus size={14} /> สร้างคำขอแก้ไข</button>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead><tr><th>เลขสัญญา</th><th>ผู้เช่า</th><th>ประเภทการแก้ไข</th><th>ก่อนแก้ไข</th><th>หลังแก้ไข</th><th>สถานะ</th><th>การดำเนินการ</th></tr></thead>
            <tbody>
              {contracts.slice(0, 4).map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600, color: 'var(--srt-navy)', fontSize: 12 }}>{c.contractNo}</td>
                  <td style={{ fontSize: 12 }}>{c.tenantName}</td>
                  <td><span style={{ background: '#dbeafe', padding: '2px 8px', borderRadius: 4, fontSize: 11, color: '#1d4ed8' }}>ค่าเช่า</span></td>
                  <td style={{ fontSize: 12 }}>฿{c.monthlyRent.toLocaleString()}</td>
                  <td style={{ fontSize: 12, color: 'var(--srt-green)', fontWeight: 600 }}>฿{(c.monthlyRent * 1.05).toFixed(0)}</td>
                  <td><span className="badge badge-pending">รออนุมัติ</span></td>
                  <td><button className="btn btn-outline btn-sm">ดูรายละเอียด</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ===================== Termination =====================
export function Termination() {
  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-title"><XCircle size={22} /> ยกเลิกสัญญา</div>
        <div className="page-header-sub">จัดการการบอกเลิก ตรวจสอบพื้นที่ และคืนเงินประกัน</div>
      </div>
      <div className="grid grid-4 mb-4">
        {[
          { label: 'รอดำเนินการ', value: 6, color: '#c0392b' },
          { label: 'ตรวจพื้นที่แล้ว', value: 3, color: '#f39c12' },
          { label: 'ยกเลิกสำเร็จ (ปีนี้)', value: 28, color: '#16a34a' },
          { label: 'หนี้ค้างก่อนยกเลิก', value: '฿245K', color: '#7c3aed' },
        ].map(k => (
          <div key={k.label} className="stat-card">
            <div className="stat-icon" style={{ background: k.color + '18' }}><XCircle size={20} color={k.color} /></div>
            <div className="stat-info"><h3 style={{ color: k.color }}>{k.value}</h3><p>{k.label}</p></div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-header">
          <span className="card-title">รายการยกเลิกสัญญา</span>
          <button className="btn btn-danger btn-sm"><XCircle size={14} /> บอกเลิกสัญญา</button>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead><tr><th>เลขสัญญา</th><th>ผู้เช่า</th><th>เหตุผล</th><th>หนี้ค้าง</th><th>ตรวจพื้นที่</th><th>คืนประกัน</th><th>สถานะ</th></tr></thead>
            <tbody>
              {contracts.filter(c => c.status === 'terminated' || c.hasDebt).map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600, color: 'var(--srt-navy)', fontSize: 12 }}>{c.contractNo}</td>
                  <td style={{ fontSize: 12 }}>{c.tenantName}</td>
                  <td style={{ fontSize: 12 }}>ผิดเงื่อนไขสัญญา</td>
                  <td style={{ color: c.hasDebt ? 'var(--srt-red)' : 'var(--srt-green)', fontWeight: 600, fontSize: 12 }}>
                    {c.hasDebt ? `฿${c.debtAmount.toLocaleString()}` : 'ไม่มี'}
                  </td>
                  <td><span className="badge badge-pending">รอตรวจ</span></td>
                  <td style={{ fontSize: 12 }}>฿{c.deposit.toLocaleString()}</td>
                  <td><span className={`badge ${getStatusClass(c.status)}`}>{getStatusLabel(c.status)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ===================== Obligations =====================
export function Obligations() {
  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-title"><AlertTriangle size={22} /> ติดตามภาระผูกพันและ Compliance</div>
        <div className="page-header-sub">ตรวจสอบภาระผูกพันตามสัญญา ความเสี่ยง และ Compliance Rules</div>
      </div>
      <div className="grid grid-4 mb-4">
        {[
          { label: 'ผิดเงื่อนไข', value: 12, color: '#c0392b' },
          { label: 'ความเสี่ยงสูง', value: 24, color: '#ea580c' },
          { label: 'ประกันใกล้หมด', value: 8, color: '#f39c12' },
          { label: 'ปฏิบัติตามเงื่อนไข', value: 856, color: '#16a34a' },
        ].map(k => (
          <div key={k.label} className="stat-card">
            <div className="stat-icon" style={{ background: k.color + '18' }}><AlertTriangle size={20} color={k.color} /></div>
            <div className="stat-info"><h3 style={{ color: k.color }}>{k.value}</h3><p>{k.label}</p></div>
          </div>
        ))}
      </div>
      <div className="grid grid-2 mb-4">
        <div className="card">
          <div className="card-header"><span className="card-title">Compliance Dashboard</span></div>
          <div className="card-body">
            {[
              { label: 'ค่าเช่าต่ำกว่าเกณฑ์', count: 8, color: '#ea580c' },
              { label: 'เอกสารขาด', count: 15, color: '#c0392b' },
              { label: 'หนี้ค้างชำระ', count: 23, color: '#b91c1c' },
              { label: 'ใกล้หมดอายุไม่ได้ต่อ', count: 12, color: '#a16207' },
              { label: 'ประกันหมดอายุ', count: 8, color: '#7c3aed' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                <div style={{ flex: 1, fontSize: 13 }}>{item.label}</div>
                <span className="badge" style={{ background: item.color + '20', color: item.color }}>{item.count} สัญญา</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Contract Risk Profile</span></div>
          <div className="card-body">
            {contracts.slice(0, 5).map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.tenantName}</div>
                  <div style={{ fontSize: 11, color: 'var(--srt-gray-400)' }}>{c.contractNo}</div>
                </div>
                <span className={`badge badge-${c.riskLevel === 'สูง' ? 'high' : c.riskLevel === 'ปานกลาง' ? 'medium' : 'low'}`}>{c.riskLevel}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===================== Notifications =====================
export function NotificationsPage() {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? notifications : filter === 'unread' ? notifications.filter(n => !n.read) : notifications.filter(n => n.type === filter);
  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-title"><Bell size={22} /> ศูนย์การแจ้งเตือน</div>
        <div className="page-header-sub">แจ้งเตือนงานอนุมัติ สัญญาหมดอายุ หนี้ค้าง และ SLA</div>
      </div>
      <div className="chip-group mb-4">
        {[['all','ทั้งหมด'],['unread','ยังไม่ได้อ่าน'],['expiry','หมดอายุ'],['debt','หนี้ค้าง'],['approval','อนุมัติ'],['signature','ลงนาม']].map(([v,l]) => (
          <button key={v} className={`chip ${filter === v ? 'active' : ''}`} onClick={() => setFilter(v)}>{l}</button>
        ))}
      </div>
      <div className="card">
        {filtered.map(n => (
          <div key={n.id} style={{ display: 'flex', gap: 14, padding: '14px 20px', borderBottom: '1px solid var(--srt-gray-100)', background: n.read ? '#fff' : '#f8faff' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: n.type === 'expiry' ? '#fed7aa' : n.type === 'debt' ? '#fee2e2' : n.type === 'approval' ? '#dbeafe' : '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {n.type === 'expiry' ? <AlertTriangle size={18} color="#c2410c" /> : n.type === 'debt' ? <DollarSign size={18} color="#b91c1c" /> : n.type === 'approval' ? <CheckCircle size={18} color="#1d4ed8" /> : <Bell size={18} color="#16a34a" />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{n.title}</span>
                <span className={`badge badge-${n.priority === 'High' ? 'high' : n.priority === 'Medium' ? 'medium' : 'low'}`}>{n.priority}</span>
                {!n.read && <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--srt-red)' }} />}
              </div>
              <div style={{ fontSize: 13, color: 'var(--srt-gray-600)', marginTop: 2 }}>{n.message}</div>
              <div style={{ fontSize: 11, color: 'var(--srt-gray-400)', marginTop: 4 }}>{n.date}</div>
            </div>
            <div style={{ flexShrink: 0 }}>
              <button className="btn btn-outline btn-sm">ดำเนินการ</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===================== Tenants =====================
export function Tenants() {
  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-title"><Users size={22} /> ข้อมูลผู้เช่า</div>
        <div className="page-header-sub">จัดการข้อมูลผู้เช่าทั้งบุคคลธรรมดาและนิติบุคคล</div>
      </div>
      <div className="card">
        <div className="card-header">
          <span className="card-title">รายชื่อผู้เช่า</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="search-box">
              <Search size={14} className="search-icon" />
              <input placeholder="ค้นหาผู้เช่า..." />
            </div>
            <button className="btn btn-primary btn-sm"><Plus size={14} /> เพิ่มผู้เช่า</button>
          </div>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead><tr><th>รหัส</th><th>ชื่อ</th><th>ประเภท</th><th>เบอร์โทร</th><th>จำนวนสัญญา</th><th>หนี้รวม</th><th>สถานะ</th><th>การดำเนินการ</th></tr></thead>
            <tbody>
              {tenants.map(t => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 600, color: 'var(--srt-navy)', fontSize: 12 }}>{t.id}</td>
                  <td style={{ fontWeight: 500 }}>{t.name}</td>
                  <td><span style={{ background: t.type === 'นิติบุคคล' ? '#dbeafe' : '#f0fdf4', padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>{t.type}</span></td>
                  <td style={{ fontSize: 12 }}>{t.phone}</td>
                  <td style={{ textAlign: 'center' }}>{t.contracts} ฉบับ</td>
                  <td style={{ color: t.totalDebt > 0 ? 'var(--srt-red)' : 'var(--srt-green)', fontWeight: 600 }}>
                    {t.totalDebt > 0 ? `฿${t.totalDebt.toLocaleString()}` : 'ไม่มี'}
                  </td>
                  <td><span className={`badge ${t.status === 'ปกติ' ? 'badge-active' : t.status === 'มีหนี้ค้าง' ? 'badge-high' : 'badge-terminated'}`}>{t.status}</span></td>
                  <td><button className="btn btn-ghost btn-sm">ดูรายละเอียด</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ===================== Assets / GIS =====================
export function Assets() {
  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-title"><Map size={22} /> ทรัพย์สิน & GIS</div>
        <div className="page-header-sub">ดูตำแหน่งทรัพย์สิน สถานะการเช่า และข้อมูลแผนที่</div>
      </div>
      <div className="grid grid-4 mb-4">
        {[
          { label: 'ทรัพย์สินทั้งหมด', value: '2,847', color: '#0a1f44' },
          { label: 'กำลังเช่า', value: '1,248', color: '#16a34a' },
          { label: 'ว่าง', value: '842', color: '#f39c12' },
          { label: 'อยู่ระหว่างปรับปรุง', value: '157', color: '#7c3aed' },
        ].map(k => (
          <div key={k.label} className="stat-card">
            <div className="stat-icon" style={{ background: k.color + '18' }}><Map size={20} color={k.color} /></div>
            <div className="stat-info"><h3 style={{ color: k.color }}>{k.value}</h3><p>{k.label}</p></div>
          </div>
        ))}
      </div>
      <div className="grid grid-2 mb-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header"><span className="card-title">แผนที่ทรัพย์สิน (GIS)</span></div>
          <div className="card-body">
            <div style={{ background: '#e8f4f8', borderRadius: 8, height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, border: '2px dashed var(--srt-gray-300)' }}>
              <Map size={48} color="var(--srt-gray-300)" />
              <div style={{ fontSize: 14, color: 'var(--srt-gray-400)' }}>แผนที่เส้นทางรถไฟแห่งประเทศไทย</div>
              <div style={{ fontSize: 12, color: 'var(--srt-gray-300)' }}>ระบบ GIS แสดงตำแหน่งทรัพย์สินตามเส้นทางรถไฟ</div>
              <div style={{ display: 'flex', gap: 12 }}>
                {[['สีเขียว','กำลังเช่า'],['สีเหลือง','ว่าง'],['สีแดง','ปรับปรุง']].map(([color, label]) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--srt-gray-500)' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: color === 'สีเขียว' ? '#16a34a' : color === 'สีเหลือง' ? '#f39c12' : '#c0392b' }} />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===================== Audit =====================
export function Audit() {
  const auditLogs = contracts.map(c => ({
    id: c.id, action: 'แก้ไขข้อมูลสัญญา', user: c.officer,
    time: c.lastModified, ip: '192.168.1.' + (Math.floor(Math.random() * 255)),
    contract: c.contractNo, data: 'ค่าเช่า', before: c.monthlyRent - 1000, after: c.monthlyRent
  }));
  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-title"><Shield size={22} /> Audit Trail & Governance</div>
        <div className="page-header-sub">ประวัติการทำรายการ การเข้าถึง และหลักฐานการอนุมัติทุกขั้นตอน</div>
      </div>
      <div className="grid grid-4 mb-4">
        {[
          { label: 'รายการทั้งหมด (วันนี้)', value: '234', color: '#0a1f44' },
          { label: 'ผู้ใช้งาน (วันนี้)', value: '48', color: '#16a34a' },
          { label: 'การดาวน์โหลด', value: '56', color: '#7c3aed' },
          { label: 'ความผิดปกติ', value: '2', color: '#c0392b' },
        ].map(k => (
          <div key={k.label} className="stat-card">
            <div className="stat-icon" style={{ background: k.color + '18' }}><Shield size={20} color={k.color} /></div>
            <div className="stat-info"><h3 style={{ color: k.color }}>{k.value}</h3><p>{k.label}</p></div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-header">
          <span className="card-title">Full Audit Trail Log</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <select className="form-control" style={{ width: 150 }}><option>ทุกประเภท</option><option>แก้ไข</option><option>อนุมัติ</option><option>ลงนาม</option></select>
            <button className="btn btn-ghost btn-sm"><Download size={13} /> Export</button>
          </div>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead><tr><th>วันเวลา</th><th>ผู้ทำรายการ</th><th>การกระทำ</th><th>สัญญา</th><th>ข้อมูลที่เปลี่ยน</th><th>IP Address</th></tr></thead>
            <tbody>
              {auditLogs.slice(0, 8).map(log => (
                <tr key={log.id}>
                  <td style={{ fontSize: 11, color: 'var(--srt-gray-500)', whiteSpace: 'nowrap' }}>{log.time} 14:32:15</td>
                  <td style={{ fontSize: 12, fontWeight: 500 }}>{log.user}</td>
                  <td><span style={{ background: '#dbeafe', padding: '2px 8px', borderRadius: 4, fontSize: 11, color: '#1d4ed8' }}>{log.action}</span></td>
                  <td style={{ fontWeight: 600, color: 'var(--srt-navy)', fontSize: 12 }}>{log.contract}</td>
                  <td style={{ fontSize: 12 }}>
                    <span style={{ color: 'var(--srt-red)' }}>฿{log.before.toLocaleString()}</span>
                    <span style={{ color: 'var(--srt-gray-400)', margin: '0 4px' }}>→</span>
                    <span style={{ color: 'var(--srt-green)' }}>฿{log.after.toLocaleString()}</span>
                  </td>
                  <td style={{ fontSize: 12, fontFamily: 'monospace' }}>{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ===================== Settings =====================
export function SettingsPage() {
  const [activeSection, setActiveSection] = useState('general');
  const sections = [
    ['general','ทั่วไป'], ['workflow','Workflow'], ['sla','SLA'], ['notifications','การแจ้งเตือน'],
    ['roles','สิทธิ์ผู้ใช้'], ['integration','Integration'], ['retention','นโยบายเอกสาร']
  ];
  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-title"><Settings size={22} /> ตั้งค่าระบบ</div>
        <div className="page-header-sub">กำหนดค่า Workflow, SLA, Template, Role และ Notification</div>
      </div>
      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ width: 200, flexShrink: 0 }}>
          <div className="card" style={{ overflow: 'hidden' }}>
            {sections.map(([id, label]) => (
              <div key={id} onClick={() => setActiveSection(id)} style={{ padding: '10px 16px', cursor: 'pointer', fontWeight: activeSection === id ? 600 : 400, background: activeSection === id ? 'var(--srt-gray-50)' : '#fff', borderLeft: `3px solid ${activeSection === id ? 'var(--srt-navy)' : 'transparent'}`, fontSize: 13, color: activeSection === id ? 'var(--srt-navy)' : 'var(--srt-gray-600)' }}>
                {label}
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div className="card">
            <div className="card-header"><span className="card-title">{sections.find(s => s[0] === activeSection)?.[1]}</span></div>
            <div className="card-body">
              {activeSection === 'general' && (
                <div>
                  <div className="grid grid-2" style={{ gap: 12 }}>
                    <div className="form-group"><label className="form-label">รูปแบบเลขที่สัญญา</label><input className="form-control" defaultValue="SRT-{YYYY}-{MM}-{SEQ}" /></div>
                    <div className="form-group"><label className="form-label">ปีงบประมาณ</label><select className="form-control"><option>2567</option></select></div>
                    <div className="form-group"><label className="form-label">ภาษาหลัก</label><select className="form-control"><option>ภาษาไทย</option><option>English</option></select></div>
                    <div className="form-group"><label className="form-label">หน่วยงานดูแลระบบ</label><input className="form-control" defaultValue="ฝ่ายบริหารทรัพย์สิน" /></div>
                  </div>
                  <button className="btn btn-primary mt-4">บันทึก</button>
                </div>
              )}
              {activeSection === 'sla' && (
                <div>
                  {[['ตรวจสอบเอกสาร','1 วันทำการ'], ['ตรวจสอบกฎหมาย','3 วันทำการ'], ['ตรวจสอบการเงิน','2 วันทำการ'], ['อนุมัติระดับ 2','3 วันทำการ'], ['อนุมัติระดับ 3','5 วันทำการ'], ['เตรียมลงนาม','1 วันทำการ']].map(([s, v]) => (
                    <div key={s} className="form-group">
                      <label className="form-label">{s}</label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input className="form-control" defaultValue={v} />
                        <select className="form-control" style={{ width: 150 }}>
                          <option>วันทำการ</option><option>วันปฏิทิน</option>
                        </select>
                      </div>
                    </div>
                  ))}
                  <button className="btn btn-primary mt-4">บันทึก SLA</button>
                </div>
              )}
              {activeSection === 'notifications' && (
                <div>
                  {[
                    ['แจ้งเตือนสัญญาใกล้หมดอายุ (Email)', true],
                    ['แจ้งเตือนสัญญาใกล้หมดอายุ (SMS)', false],
                    ['แจ้งเตือนสัญญาใกล้หมดอายุ (LINE OA)', true],
                    ['แจ้งเตือนงานรออนุมัติ', true],
                    ['แจ้งเตือนหนี้ค้างชำระ', true],
                    ['แจ้งเตือน SLA เกินกำหนด', true],
                  ].map(([label, enabled]) => (
                    <div key={label as string} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--srt-gray-100)' }}>
                      <span style={{ fontSize: 13 }}>{label as string}</span>
                      <div style={{ width: 44, height: 24, borderRadius: 12, background: enabled ? 'var(--srt-green)' : 'var(--srt-gray-300)', cursor: 'pointer', position: 'relative', transition: '0.2s' }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: enabled ? 22 : 2, transition: '0.2s' }} />
                      </div>
                    </div>
                  ))}
                  <div className="form-group mt-4"><label className="form-label">ล่วงหน้ากี่วัน (สัญญาใกล้หมดอายุ)</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[30, 60, 90, 120].map(d => <button key={d} className={`btn ${d === 30 ? 'btn-primary' : 'btn-ghost'}`}>{d} วัน</button>)}
                    </div>
                  </div>
                  <button className="btn btn-primary">บันทึก</button>
                </div>
              )}
              {activeSection !== 'general' && activeSection !== 'sla' && activeSection !== 'notifications' && (
                <div className="empty-state">
                  <Settings size={48} />
                  <h3>ตั้งค่า {sections.find(s => s[0] === activeSection)?.[1]}</h3>
                  <p>ส่วนนี้อยู่ระหว่างการพัฒนา</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
