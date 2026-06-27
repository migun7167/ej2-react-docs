import React, { useState } from 'react';
import { FileText, Plus, Search, Filter, Eye, Edit, RefreshCw, ArrowRightLeft, XCircle, Download, MapPin } from 'lucide-react';
import { contracts, getStatusLabel, getStatusClass, formatCurrency, formatDate } from '../data/mockData';

const statusOptions: { value: string; label: string }[] = [
  { value: 'all', label: 'ทุกสถานะ' },
  { value: 'draft', label: 'ร่างสัญญา' },
  { value: 'review', label: 'กำลังตรวจสอบ' },
  { value: 'pending_approval', label: 'รออนุมัติ' },
  { value: 'pending_signature', label: 'รอลงนาม' },
  { value: 'active', label: 'มีผลบังคับ' },
  { value: 'expiring_soon', label: 'ใกล้หมดอายุ' },
  { value: 'renewal_in_progress', label: 'กำลังต่ออายุ' },
  { value: 'terminated', label: 'ยกเลิกแล้ว' },
];

const typeOptions = ['ทุกประเภท', 'ร้านค้า', 'พื้นที่พาณิชย์', 'ที่ดิน', 'อาคาร', 'ป้ายโฆษณา', 'ลานจอดรถ', 'ห้องพัก'];

interface ContractDetailModalProps {
  contractId: string;
  onClose: () => void;
}

function ContractDetailModal({ contractId, onClose }: ContractDetailModalProps) {
  const contract = contracts.find(c => c.id === contractId);
  const [tab, setTab] = useState('info');
  if (!contract) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-box-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>รายละเอียดสัญญา #{contract.contractNo}</div>
            <div style={{ fontSize: 12, color: 'var(--srt-gray-500)' }}>{contract.tenantName} · {contract.assetName}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className={`badge ${getStatusClass(contract.status)}`}>{getStatusLabel(contract.status)}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--srt-gray-400)' }}>×</button>
          </div>
        </div>
        <div className="modal-body">
          <div className="tab-nav">
            {['info', 'financial', 'timeline', 'documents', 'esign'].map(t => (
              <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                {t === 'info' ? 'ข้อมูลสัญญา' : t === 'financial' ? 'การเงิน' : t === 'timeline' ? 'Timeline' : t === 'documents' ? 'เอกสาร' : 'e-Signature'}
              </button>
            ))}
          </div>

          {tab === 'info' && (
            <div>
              <div className="grid grid-2" style={{ gap: 12 }}>
                <div><label className="form-label">เลขที่สัญญา</label><div style={{ fontWeight: 600, color: 'var(--srt-navy)' }}>{contract.contractNo}</div></div>
                <div><label className="form-label">ประเภทสัญญา</label><div>{contract.type}</div></div>
                <div><label className="form-label">ผู้เช่า</label><div style={{ fontWeight: 600 }}>{contract.tenantName}</div></div>
                <div><label className="form-label">รหัสทรัพย์สิน</label><div>{contract.assetCode}</div></div>
                <div><label className="form-label">ทรัพย์สิน</label><div>{contract.assetName}</div></div>
                <div><label className="form-label">สถานี</label><div>{contract.station}</div></div>
                <div><label className="form-label">พื้นที่</label><div>{contract.area > 0 ? contract.area + ' ตร.ม.' : 'ไม่มีข้อมูล'}</div></div>
                <div><label className="form-label">เจ้าหน้าที่</label><div>{contract.officer}</div></div>
                <div><label className="form-label">วันเริ่มสัญญา</label><div>{formatDate(contract.startDate)}</div></div>
                <div><label className="form-label">วันสิ้นสุดสัญญา</label><div>{formatDate(contract.endDate)}</div></div>
                <div><label className="form-label">ต่ออายุครั้งที่</label><div>{contract.renewalCount} ครั้ง</div></div>
                <div><label className="form-label">ระดับความเสี่ยง</label><div><span className={`badge badge-${contract.riskLevel === 'สูง' ? 'high' : contract.riskLevel === 'ปานกลาง' ? 'medium' : 'low'}`}>{contract.riskLevel}</span></div></div>
              </div>
              {contract.daysToExpiry > 0 && contract.daysToExpiry <= 90 && (
                <div className="alert alert-warning mt-4">
                  <RefreshCw size={14} /> สัญญานี้จะหมดอายุในอีก <strong>{contract.daysToExpiry} วัน</strong> ({formatDate(contract.endDate)}) กรุณาดำเนินการต่ออายุ
                </div>
              )}
              {contract.hasDebt && (
                <div className="alert alert-danger mt-2">
                  มียอดหนี้ค้าง <strong>{formatCurrency(contract.debtAmount)}</strong> กรุณาดำเนินการเร่งด่วน
                </div>
              )}
            </div>
          )}

          {tab === 'financial' && (
            <div>
              <div className="grid grid-3" style={{ gap: 12 }}>
                <div className="card" style={{ textAlign: 'center', padding: 16 }}>
                  <div style={{ fontSize: 12, color: 'var(--srt-gray-500)' }}>ค่าเช่า/เดือน</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--srt-navy)' }}>฿{contract.monthlyRent.toLocaleString()}</div>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: 16 }}>
                  <div style={{ fontSize: 12, color: 'var(--srt-gray-500)' }}>เงินประกัน</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--srt-green)' }}>฿{contract.deposit.toLocaleString()}</div>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: 16 }}>
                  <div style={{ fontSize: 12, color: 'var(--srt-gray-500)' }}>หนี้ค้าง</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: contract.hasDebt ? 'var(--srt-red)' : 'var(--srt-green)' }}>
                    {contract.hasDebt ? '฿' + contract.debtAmount.toLocaleString() : 'ไม่มี'}
                  </div>
                </div>
              </div>
              <div className="mt-4 card" style={{ padding: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 12 }}>ตารางแจ้งหนี้</div>
                <table className="data-table">
                  <thead><tr><th>รอบ</th><th>กำหนดชำระ</th><th>จำนวน</th><th>สถานะ</th></tr></thead>
                  <tbody>
                    <tr><td>มิ.ย. 2567</td><td>5 มิ.ย. 2567</td><td>฿{contract.monthlyRent.toLocaleString()}</td><td><span className="badge badge-active">ชำระแล้ว</span></td></tr>
                    <tr><td>ก.ค. 2567</td><td>5 ก.ค. 2567</td><td>฿{contract.monthlyRent.toLocaleString()}</td><td><span className="badge badge-pending">รอชำระ</span></td></tr>
                    <tr><td>ส.ค. 2567</td><td>5 ส.ค. 2567</td><td>฿{contract.monthlyRent.toLocaleString()}</td><td><span className="badge badge-draft">ยังไม่ถึงกำหนด</span></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'timeline' && (
            <div>
              <div className="timeline">
                <div className="timeline-item">
                  <div className="timeline-dot done" />
                  <div className="timeline-content">
                    <h4>รับคำขอเช่าจากระบบ</h4>
                    <p>{formatDate(contract.startDate)} · นายอนุมัติ เขตพื้นที่</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot done" />
                  <div className="timeline-content">
                    <h4>สร้างร่างสัญญา</h4>
                    <p>{contract.officer}</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot done" />
                  <div className="timeline-content">
                    <h4>ตรวจสอบโดยฝ่ายกฎหมาย</h4>
                    <p>นายวิสุทธิ์ กฎหมาย · อนุมัติ</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot done" />
                  <div className="timeline-content">
                    <h4>ตรวจสอบโดยฝ่ายการเงิน</h4>
                    <p>นางเพ็ญศรี การเงิน · อนุมัติ</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className={`timeline-dot ${['active','signed','expiring_soon','renewal_in_progress','terminated'].includes(contract.status) ? 'done' : 'current'}`} />
                  <div className="timeline-content">
                    <h4>ลงนามสัญญา</h4>
                    <p>{contract.tenantSigned && contract.srtSigned ? 'ลงนามครบแล้ว' : 'รอดำเนินการ'}</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className={`timeline-dot ${['active','expiring_soon','renewal_in_progress'].includes(contract.status) ? 'done' : 'pending'}`} />
                  <div className="timeline-content">
                    <h4>สัญญามีผลบังคับใช้</h4>
                    <p>{formatDate(contract.startDate)}</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot pending" />
                  <div className="timeline-content">
                    <h4>วันสิ้นสุดสัญญา</h4>
                    <p>{formatDate(contract.endDate)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'documents' && (
            <div>
              {[
                { name: 'สัญญาฉบับลงนาม', size: '2.4 MB', type: 'PDF', date: contract.startDate, status: 'สมบูรณ์' },
                { name: 'บัตรประชาชน/หนังสือจดทะเบียน', size: '1.1 MB', type: 'PDF', date: contract.startDate, status: 'สมบูรณ์' },
                { name: 'แผนผังพื้นที่', size: '3.8 MB', type: 'PDF', date: contract.startDate, status: 'สมบูรณ์' },
                { name: 'หนังสือมอบอำนาจ', size: '0.8 MB', type: 'PDF', date: contract.startDate, status: 'สมบูรณ์' },
                { name: 'หลักฐานชำระเงินประกัน', size: '0.5 MB', type: 'PDF', date: contract.startDate, status: 'สมบูรณ์' },
              ].map((doc, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--srt-gray-100)' }}>
                  <div style={{ width: 36, height: 36, background: '#fee2e2', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--srt-red)' }}>PDF</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{doc.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--srt-gray-400)' }}>{doc.size} · อัปโหลด {formatDate(doc.date)}</div>
                  </div>
                  <span className="badge badge-active">{doc.status}</span>
                  <button className="btn btn-ghost btn-sm"><Download size={12} /></button>
                </div>
              ))}
            </div>
          )}

          {tab === 'esign' && (
            <div>
              <div className="alert alert-info">
                <FileText size={14} /> สถานะการลงนามอิเล็กทรอนิกส์ของสัญญานี้
              </div>
              <div>
                {[
                  { name: contract.signerTenant || 'ผู้เช่า', role: 'ผู้เช่า / ผู้รับโอน', signed: contract.tenantSigned, date: contract.tenantSigned ? contract.startDate : null },
                  { name: 'นายพยาน ดีจริง', role: 'พยานฝ่ายผู้เช่า', signed: contract.tenantSigned, date: contract.tenantSigned ? contract.startDate : null },
                  { name: contract.signerSRT || 'ผู้มีอำนาจ SRT', role: 'ผู้มีอำนาจลงนาม SRT', signed: contract.srtSigned, date: contract.srtSigned ? contract.startDate : null },
                ].map((signer, i) => (
                  <div key={i} className="approval-step">
                    <div className="approval-step-num" style={{ background: signer.signed ? 'var(--srt-green)' : 'var(--srt-gray-300)' }}>{i + 1}</div>
                    <div className="approval-step-info">
                      <div className="approval-step-name">{signer.name}</div>
                      <div className="approval-step-role">{signer.role}</div>
                      {signer.signed && signer.date && <div style={{ fontSize: 11, color: 'var(--srt-green)', marginTop: 2 }}>✓ ลงนามแล้ว · {formatDate(signer.date)}</div>}
                    </div>
                    <div>
                      <span className={`badge ${signer.signed ? 'badge-active' : 'badge-pending'}`}>{signer.signed ? 'ลงนามแล้ว' : 'รอลงนาม'}</span>
                    </div>
                  </div>
                ))}
              </div>
              {contract.tenantSigned && contract.srtSigned && (
                <div className="alert alert-success mt-4">
                  <FileText size={14} /> สัญญาลงนามครบถ้วนแล้ว - มีหลักฐานการลงนาม Audit Trail บันทึกไว้เรียบร้อย
                </div>
              )}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>ปิด</button>
          <button className="btn btn-outline"><Download size={14} /> ดาวน์โหลดสัญญา</button>
          <button className="btn btn-primary"><Edit size={14} /> แก้ไขสัญญา</button>
        </div>
      </div>
    </div>
  );
}

export default function ContractList() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('ทุกประเภท');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = contracts.filter(c => {
    const matchSearch = !search || c.contractNo.includes(search) || c.tenantName.includes(search) || c.assetName.includes(search) || c.station.includes(search);
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    const matchType = filterType === 'ทุกประเภท' || c.type === filterType;
    return matchSearch && matchStatus && matchType;
  });

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-title"><FileText size={22} /> รายการสัญญาทั้งหมด</div>
        <div className="page-header-sub">บริหารและติดตามสัญญาทั้งหมดในระบบ · {contracts.length} ฉบับ</div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body" style={{ paddingTop: 14, paddingBottom: 14 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="search-box" style={{ flex: 1, minWidth: 260 }}>
              <Search size={14} className="search-icon" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาเลขสัญญา ผู้เช่า ทรัพย์สิน สถานี..." style={{ width: '100%' }} />
            </div>
            <select className="form-control" style={{ width: 160 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select className="form-control" style={{ width: 160 }} value={filterType} onChange={e => setFilterType(e.target.value)}>
              {typeOptions.map(o => <option key={o}>{o}</option>)}
            </select>
            <button className="btn btn-primary"><Plus size={14} /> สร้างสัญญาใหม่</button>
            <button className="btn btn-ghost"><Download size={14} /> Export Excel</button>
          </div>
        </div>
      </div>

      {/* Quick filter chips */}
      <div className="chip-group mb-4">
        {statusOptions.map(o => (
          <button key={o.value} className={`chip ${filterStatus === o.value ? 'active' : ''}`} onClick={() => setFilterStatus(o.value)}>{o.label}</button>
        ))}
      </div>

      {/* Summary Bar */}
      <div className="grid grid-4 mb-4">
        {[
          { label: 'ทั้งหมด', count: contracts.length, color: 'var(--srt-navy)' },
          { label: 'มีผลบังคับ', count: contracts.filter(c => c.status === 'active').length, color: 'var(--srt-green)' },
          { label: 'ใกล้หมดอายุ', count: contracts.filter(c => c.status === 'expiring_soon').length, color: 'var(--srt-orange)' },
          { label: 'รอดำเนินการ', count: contracts.filter(c => ['draft','review','pending_approval','pending_signature'].includes(c.status)).length, color: 'var(--srt-gold)' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid var(--srt-gray-200)', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color }} />
            <span style={{ fontSize: 12, color: 'var(--srt-gray-600)' }}>{s.label}</span>
            <span style={{ marginLeft: 'auto', fontWeight: 700, color: s.color }}>{s.count}</span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>เลขที่สัญญา</th>
                <th>ประเภท</th>
                <th>ผู้เช่า</th>
                <th>ทรัพย์สิน / สถานี</th>
                <th>ค่าเช่า/เดือน</th>
                <th>วันเริ่ม</th>
                <th>วันสิ้นสุด</th>
                <th>สถานะ</th>
                <th>ความเสี่ยง</th>
                <th>หนี้ค้าง</th>
                <th>การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--srt-navy)', fontSize: 12 }}>{c.contractNo}</div>
                    <div style={{ fontSize: 10, color: 'var(--srt-gray-400)' }}>ต่ออายุ {c.renewalCount} ครั้ง</div>
                  </td>
                  <td><span style={{ fontSize: 12, background: 'var(--srt-gray-100)', padding: '2px 8px', borderRadius: 4 }}>{c.type}</span></td>
                  <td>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{c.tenantName}</div>
                    <div style={{ fontSize: 11, color: 'var(--srt-gray-400)' }}>{c.tenantId}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: 12 }}>{c.assetCode}</div>
                    <div style={{ fontSize: 11, color: 'var(--srt-gray-400)', display: 'flex', alignItems: 'center', gap: 2 }}>
                      <MapPin size={10} />{c.station}
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>฿{c.monthlyRent.toLocaleString()}</td>
                  <td style={{ fontSize: 12 }}>{formatDate(c.startDate)}</td>
                  <td style={{ fontSize: 12 }}>
                    <div>{formatDate(c.endDate)}</div>
                    {c.daysToExpiry > 0 && c.daysToExpiry <= 90 && (
                      <div style={{ fontSize: 10, color: 'var(--srt-orange)', fontWeight: 600 }}>⚠ {c.daysToExpiry} วัน</div>
                    )}
                  </td>
                  <td><span className={`badge ${getStatusClass(c.status)}`}>{getStatusLabel(c.status)}</span></td>
                  <td><span className={`badge badge-${c.riskLevel === 'สูง' ? 'high' : c.riskLevel === 'ปานกลาง' ? 'medium' : 'low'}`}>{c.riskLevel}</span></td>
                  <td>
                    {c.hasDebt
                      ? <span style={{ color: 'var(--srt-red)', fontWeight: 700, fontSize: 12 }}>฿{c.debtAmount.toLocaleString()}</span>
                      : <span style={{ color: 'var(--srt-green)', fontSize: 12 }}>ไม่มี</span>
                    }
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setSelectedId(c.id)} title="ดูรายละเอียด"><Eye size={13} /></button>
                      <button className="btn btn-ghost btn-sm" title="แก้ไข"><Edit size={13} /></button>
                      {c.status === 'active' && <button className="btn btn-ghost btn-sm" title="ต่ออายุ"><RefreshCw size={13} /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--srt-gray-100)' }}>
          <span style={{ fontSize: 12, color: 'var(--srt-gray-500)' }}>แสดง {filtered.length} จาก {contracts.length} รายการ</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {[1, 2, 3].map(p => (
              <button key={p} className={`btn btn-sm ${p === 1 ? 'btn-primary' : 'btn-ghost'}`}>{p}</button>
            ))}
          </div>
        </div>
      </div>

      {selectedId && <ContractDetailModal contractId={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  );
}
