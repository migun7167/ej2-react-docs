import React, { useState } from 'react';
import { BookOpen, Plus, Edit, CheckCircle, Clock, FileText, Shield } from 'lucide-react';
import { templates, formatDate } from '../data/mockData';

const clauses = [
  { id: 'CL001', name: 'ค่าเช่าและการชำระเงิน', category: 'การเงิน', version: '2.1', approved: true, usageCount: 124 },
  { id: 'CL002', name: 'เงินประกัน', category: 'การเงิน', version: '1.5', approved: true, usageCount: 98 },
  { id: 'CL003', name: 'ค่าปรับผิดนัดชำระ', category: 'การเงิน', version: '1.3', approved: true, usageCount: 87 },
  { id: 'CL004', name: 'การใช้ทรัพย์สินตามวัตถุประสงค์', category: 'ทั่วไป', version: '2.0', approved: true, usageCount: 142 },
  { id: 'CL005', name: 'การซ่อมแซมและบำรุงรักษา', category: 'ทรัพย์สิน', version: '1.8', approved: true, usageCount: 76 },
  { id: 'CL006', name: 'การต่ออายุสัญญา', category: 'ทั่วไป', version: '2.2', approved: true, usageCount: 115 },
  { id: 'CL007', name: 'การบอกเลิกสัญญาโดย SRT', category: 'ยกเลิก', version: '1.9', approved: true, usageCount: 103 },
  { id: 'CL008', name: 'การบอกเลิกสัญญาโดยผู้เช่า', category: 'ยกเลิก', version: '1.7', approved: true, usageCount: 89 },
  { id: 'CL009', name: 'การโอนสิทธิ์การเช่า', category: 'โอนสิทธิ์', version: '1.4', approved: true, usageCount: 34 },
  { id: 'CL010', name: 'การติดป้ายโฆษณา', category: 'โฆษณา', version: '1.1', approved: false, usageCount: 0 },
];

export default function Templates() {
  const [tab, setTab] = useState('templates');

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-title"><BookOpen size={22} /> Template & Clause Library</div>
        <div className="page-header-sub">จัดการแบบฟอร์มสัญญาและข้อความมาตรฐาน พร้อม Version Control</div>
      </div>

      <div className="tab-nav">
        <button className={`tab-btn ${tab === 'templates' ? 'active' : ''}`} onClick={() => setTab('templates')}>Contract Templates ({templates.length})</button>
        <button className={`tab-btn ${tab === 'clauses' ? 'active' : ''}`} onClick={() => setTab('clauses')}>Clause Library ({clauses.length})</button>
        <button className={`tab-btn ${tab === 'approval' ? 'active' : ''}`} onClick={() => setTab('approval')}>อนุมัติ Template</button>
      </div>

      {tab === 'templates' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button className="btn btn-primary"><Plus size={14} /> สร้าง Template ใหม่</button>
          </div>
          <div className="grid grid-2" style={{ gap: 16 }}>
            {templates.map(t => (
              <div key={t.id} className="card">
                <div className="card-body">
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 44, height: 44, background: t.status === 'ใช้งาน' ? 'var(--srt-navy)' : t.status === 'รออนุมัติ' ? '#fef9c3' : '#f1f5f9', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FileText size={20} color={t.status === 'ใช้งาน' ? '#fff' : t.status === 'รออนุมัติ' ? '#a16207' : '#94a3b8'} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{t.name}</div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                        <span className={`badge ${t.status === 'ใช้งาน' ? 'badge-active' : t.status === 'รออนุมัติ' ? 'badge-pending' : 'badge-draft'}`}>{t.status}</span>
                        <span className="badge badge-draft">v{t.version}</span>
                        <span style={{ fontSize: 11, color: 'var(--srt-gray-400)' }}>{t.type}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--srt-gray-500)' }}>
                        {t.clauses} ข้อ · ใช้งานแล้ว {t.usageCount} ครั้ง
                        {t.approvedBy && <span> · อนุมัติโดย: {t.approvedBy}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="divider" />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-ghost btn-sm"><FileText size={12} /> ดู Template</button>
                    <button className="btn btn-ghost btn-sm"><Edit size={12} /> แก้ไข</button>
                    {t.status === 'รออนุมัติ' && <button className="btn btn-gold btn-sm"><Shield size={12} /> ส่งอนุมัติ</button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'clauses' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16, gap: 8 }}>
            <select className="form-control" style={{ width: 160 }}>
              <option>ทุกหมวด</option>
              <option>การเงิน</option>
              <option>ทั่วไป</option>
              <option>ยกเลิก</option>
            </select>
            <button className="btn btn-primary"><Plus size={14} /> เพิ่ม Clause ใหม่</button>
          </div>
          <div className="card">
            <div className="table-container">
              <table className="data-table">
                <thead><tr><th>รหัส</th><th>ชื่อ Clause</th><th>หมวดหมู่</th><th>เวอร์ชัน</th><th>สถานะ</th><th>ใช้งาน</th><th>การดำเนินการ</th></tr></thead>
                <tbody>
                  {clauses.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600, color: 'var(--srt-navy)', fontSize: 12 }}>{c.id}</td>
                      <td style={{ fontWeight: 500 }}>{c.name}</td>
                      <td><span style={{ background: 'var(--srt-gray-100)', padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>{c.category}</span></td>
                      <td><span className="badge badge-draft">v{c.version}</span></td>
                      <td>
                        {c.approved
                          ? <span className="badge badge-active"><CheckCircle size={10} /> อนุมัติแล้ว</span>
                          : <span className="badge badge-pending"><Clock size={10} /> รออนุมัติ</span>
                        }
                      </td>
                      <td style={{ fontSize: 12 }}>{c.usageCount} ครั้ง</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-ghost btn-sm"><FileText size={12} /></button>
                          <button className="btn btn-ghost btn-sm"><Edit size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'approval' && (
        <div className="card">
          <div className="card-header"><span className="card-title">Template รออนุมัติ</span></div>
          <div className="card-body">
            {templates.filter(t => t.status === 'รออนุมัติ').map(t => (
              <div key={t.id} className="card mb-4">
                <div className="card-body">
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>{t.name} (v{t.version})</div>
                  <div style={{ fontSize: 12, color: 'var(--srt-gray-500)', marginBottom: 12 }}>ประเภท: {t.type} · {t.clauses} ข้อ</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-ghost"><FileText size={13} /> ตรวจสอบ</button>
                    <button className="btn btn-success" style={{ marginLeft: 'auto' }}><CheckCircle size={13} /> อนุมัติ</button>
                    <button className="btn btn-danger">ปฏิเสธ</button>
                  </div>
                </div>
              </div>
            ))}
            {templates.filter(t => t.status === 'รออนุมัติ').length === 0 && (
              <div className="empty-state"><CheckCircle size={48} /><h3>ไม่มี Template รออนุมัติ</h3></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
