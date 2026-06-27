import React, { useState } from 'react';
import { RefreshCw, AlertTriangle, CheckCircle, Clock, DollarSign, FileText } from 'lucide-react';
import { contracts, formatDate, formatCurrency } from '../data/mockData';

const expiringContracts = contracts.filter(c => c.daysToExpiry > 0 && c.daysToExpiry <= 120);
const renewalInProgress = contracts.filter(c => c.status === 'renewal_in_progress');

export default function Renewal() {
  const [tab, setTab] = useState('alert');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedContract = contracts.find(c => c.id === selectedId);

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-title"><RefreshCw size={22} /> ต่ออายุสัญญา</div>
        <div className="page-header-sub">จัดการการต่ออายุสัญญา แจ้งเตือนล่วงหน้า และอนุมัติต่ออายุ</div>
      </div>

      <div className="grid grid-4 mb-4">
        {[
          { label: 'ใกล้หมดอายุ ≤30 วัน', value: contracts.filter(c => c.daysToExpiry > 0 && c.daysToExpiry <= 30).length, color: '#c0392b' },
          { label: 'ใกล้หมดอายุ ≤90 วัน', value: expiringContracts.length, color: '#ea580c' },
          { label: 'อยู่ระหว่างต่ออายุ', value: renewalInProgress.length, color: '#7c3aed' },
          { label: 'ต่ออายุสำเร็จ (ปีนี้)', value: 87, color: '#16a34a' },
        ].map(k => (
          <div key={k.label} className="stat-card">
            <div className="stat-icon" style={{ background: k.color + '18' }}><RefreshCw size={20} color={k.color} /></div>
            <div className="stat-info"><h3 style={{ color: k.color }}>{k.value}</h3><p>{k.label}</p></div>
          </div>
        ))}
      </div>

      <div className="tab-nav">
        {['alert', 'inprogress', 'history', 'valuation'].map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'alert' ? `แจ้งเตือน (${expiringContracts.length})` : t === 'inprogress' ? 'กำลังดำเนินการ' : t === 'history' ? 'ประวัติ' : 'ประเมินค่าเช่า'}
          </button>
        ))}
      </div>

      {tab === 'alert' && (
        <div>
          <div className="alert alert-warning mb-4"><AlertTriangle size={14} /> แสดงสัญญาที่จะหมดอายุภายใน 120 วัน กรุณาดำเนินการต่ออายุล่วงหน้า</div>
          <div className="card">
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr><th>เลขสัญญา</th><th>ผู้เช่า</th><th>ทรัพย์สิน</th><th>วันหมดอายุ</th><th>เหลือ (วัน)</th><th>ค่าเช่า/เดือน</th><th>หนี้ค้าง</th><th>สิทธิ์ต่ออายุ</th><th>การดำเนินการ</th></tr>
                </thead>
                <tbody>
                  {expiringContracts.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600, color: 'var(--srt-navy)', fontSize: 12 }}>{c.contractNo}</td>
                      <td style={{ fontSize: 12 }}>{c.tenantName}</td>
                      <td style={{ fontSize: 12 }}>{c.station}</td>
                      <td style={{ fontSize: 12 }}>{formatDate(c.endDate)}</td>
                      <td>
                        <span className={`badge ${c.daysToExpiry <= 30 ? 'badge-high' : c.daysToExpiry <= 60 ? 'badge-expiring' : 'badge-pending'}`}>
                          {c.daysToExpiry} วัน
                        </span>
                      </td>
                      <td style={{ fontSize: 12 }}>{formatCurrency(c.monthlyRent)}</td>
                      <td>{c.hasDebt ? <span style={{ color: 'var(--srt-red)', fontWeight: 700, fontSize: 12 }}>฿{c.debtAmount.toLocaleString()}</span> : <span style={{ color: 'var(--srt-green)', fontSize: 12 }}>ไม่มี</span>}</td>
                      <td>{c.hasDebt ? <span className="badge badge-high">ไม่ผ่าน</span> : <span className="badge badge-active">ผ่าน</span>}</td>
                      <td>
                        <button className="btn btn-primary btn-sm" onClick={() => { setSelectedId(c.id); setTab('inprogress'); }}>
                          <RefreshCw size={12} /> ต่ออายุ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'inprogress' && (
        <div>
          {renewalInProgress.concat(selectedContract ? [selectedContract] : []).filter((c, i, arr) => arr.findIndex(x => x.id === c.id) === i).map(c => (
            <div key={c.id} className="card mb-4">
              <div className="card-header">
                <span className="card-title">ต่ออายุ - {c.contractNo}</span>
                <span className="badge badge-renewal">กำลังดำเนินการ</span>
              </div>
              <div className="card-body">
                <div className="grid grid-2 mb-4" style={{ gap: 12 }}>
                  <div>
                    <label className="form-label">สัญญาเดิม</label>
                    <div style={{ background: 'var(--srt-gray-50)', padding: 12, borderRadius: 8 }}>
                      <div style={{ fontSize: 13 }}>ระยะเวลา: {formatDate(c.startDate)} - {formatDate(c.endDate)}</div>
                      <div style={{ fontSize: 13 }}>ค่าเช่า: {formatCurrency(c.monthlyRent)}/เดือน</div>
                    </div>
                  </div>
                  <div>
                    <label className="form-label">สัญญาใหม่ (ที่จะต่ออายุ)</label>
                    <div style={{ background: '#f0fdf4', padding: 12, borderRadius: 8, border: '1px solid #bbf7d0' }}>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                          <input type="date" className="form-control" defaultValue="2568-01-01" />
                        </div>
                        <span style={{ alignSelf: 'center', color: 'var(--srt-gray-400)' }}>ถึง</span>
                        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                          <input type="date" className="form-control" defaultValue="2570-12-31" />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: 12 }}>ค่าเช่าใหม่:</span>
                        <input type="number" className="form-control" defaultValue={Math.round(c.monthlyRent * 1.05)} style={{ flex: 1 }} />
                        <span style={{ fontSize: 11, color: 'var(--srt-green)' }}>+5%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Renewal checklist */}
                <div style={{ fontWeight: 600, marginBottom: 10 }}>ตรวจสอบก่อนต่ออายุ</div>
                {[
                  { label: 'ไม่มีหนี้ค้างชำระ', pass: !c.hasDebt },
                  { label: 'ทรัพย์สินพร้อมให้เช่าต่อ', pass: true },
                  { label: 'ไม่มีการร้องเรียนค้างอยู่', pass: true },
                  { label: 'เอกสารผู้เช่าครบถ้วน', pass: true },
                  { label: 'ประเมินค่าเช่าตลาดแล้ว', pass: true },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    {item.pass ? <CheckCircle size={16} color="var(--srt-green)" /> : <AlertTriangle size={16} color="var(--srt-red)" />}
                    <span style={{ fontSize: 13, color: item.pass ? 'var(--srt-gray-700)' : 'var(--srt-red)' }}>{item.label}</span>
                    <span className={`badge ${item.pass ? 'badge-active' : 'badge-high'}`}>{item.pass ? 'ผ่าน' : 'ไม่ผ่าน'}</span>
                  </div>
                ))}

                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <button className="btn btn-ghost">ยกเลิก</button>
                  <button className="btn btn-primary" style={{ marginLeft: 'auto' }}>
                    <RefreshCw size={14} /> ส่งอนุมัติต่ออายุ
                  </button>
                </div>
              </div>
            </div>
          ))}
          {renewalInProgress.length === 0 && !selectedContract && (
            <div className="empty-state">
              <RefreshCw size={48} />
              <h3>ไม่มีสัญญาอยู่ระหว่างต่ออายุ</h3>
              <p>กลับไปที่แท็บแจ้งเตือนเพื่อเริ่มต่ออายุ</p>
            </div>
          )}
        </div>
      )}

      {tab === 'history' && (
        <div className="card">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr><th>เลขสัญญา</th><th>ผู้เช่า</th><th>ต่ออายุครั้งที่</th><th>วันที่ต่ออายุ</th><th>ระยะเวลาใหม่</th><th>ค่าเช่าใหม่</th><th>สถานะ</th></tr>
              </thead>
              <tbody>
                {contracts.filter(c => c.renewalCount > 0).map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600, color: 'var(--srt-navy)', fontSize: 12 }}>{c.contractNo}</td>
                    <td style={{ fontSize: 12 }}>{c.tenantName}</td>
                    <td style={{ textAlign: 'center' }}><span className="badge badge-renewal">ครั้งที่ {c.renewalCount}</span></td>
                    <td style={{ fontSize: 12 }}>{formatDate(c.lastModified)}</td>
                    <td style={{ fontSize: 12 }}>{formatDate(c.startDate)} - {formatDate(c.endDate)}</td>
                    <td style={{ fontSize: 12, fontWeight: 600 }}>{formatCurrency(c.monthlyRent)}</td>
                    <td><span className="badge badge-active">สำเร็จ</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'valuation' && (
        <div>
          <div className="card mb-4">
            <div className="card-header"><span className="card-title">ประเมินค่าเช่าตลาด (Renewal Valuation)</span></div>
            <div className="card-body">
              <div className="alert alert-info"><DollarSign size={14} /> ระบบเปรียบเทียบค่าเช่าตลาดจากฐานข้อมูลทรัพย์สินการรถไฟ</div>
              <div className="grid grid-3 mb-4" style={{ gap: 12 }}>
                {[
                  { label: 'ค่าเช่าตลาดเฉลี่ย', value: '฿650/ตร.ม.', desc: 'สถานีกรุงเทพ ร้านค้าชั้น 1' },
                  { label: 'ค่าเช่าปัจจุบัน', value: '฿615/ตร.ม.', desc: 'สัญญา SRT-2567-001-001' },
                  { label: 'แนะนำขึ้น', value: '+5.7%', desc: '฿650/ตร.ม. สำหรับรอบต่อไป' },
                ].map((item, i) => (
                  <div key={i} className="card" style={{ padding: 16, textAlign: 'center' }}>
                    <div style={{ fontSize: 12, color: 'var(--srt-gray-500)', marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: i === 2 ? 'var(--srt-green)' : 'var(--srt-navy)' }}>{item.value}</div>
                    <div style={{ fontSize: 11, color: 'var(--srt-gray-400)' }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
