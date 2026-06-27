import React, { useState } from 'react';
import { CheckSquare, CheckCircle, XCircle, MessageSquare, Clock, AlertTriangle, ChevronDown, Eye } from 'lucide-react';
import { approvalTasks, contracts, getStatusLabel, getStatusClass, formatCurrency, formatDate } from '../data/mockData';

interface ApproveModalProps {
  taskId: string;
  action: 'approve' | 'reject' | 'return';
  onClose: () => void;
}

function ApproveModal({ taskId, action, onClose }: ApproveModalProps) {
  const [comment, setComment] = useState('');
  const task = approvalTasks.find(t => t.id === taskId);
  if (!task) return null;

  const colorMap = { approve: 'var(--srt-green)', reject: 'var(--srt-red)', return: 'var(--srt-gold)' };
  const labelMap = { approve: 'อนุมัติ', reject: 'ปฏิเสธ', return: 'ส่งกลับแก้ไข' };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span style={{ fontWeight: 700 }}>{labelMap[action]} - {task.action}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}>×</button>
        </div>
        <div className="modal-body">
          <div className="alert alert-info">
            <CheckSquare size={14} />
            <span>สัญญา <strong>{task.contractNo}</strong> · {task.tenantName} · มูลค่า {formatCurrency(task.value)}/เดือน</span>
          </div>
          <div className="form-group">
            <label className="form-label">ความเห็น {action !== 'approve' ? <span className="required">*</span> : '(ไม่บังคับ)'}</label>
            <textarea className="form-control" rows={4} value={comment} onChange={e => setComment(e.target.value)} placeholder={action === 'approve' ? 'ระบุความเห็นเพิ่มเติม (ถ้ามี)' : 'กรุณาระบุเหตุผล...'} />
          </div>
          {action === 'approve' && (
            <div className="alert alert-success">
              <CheckCircle size={14} /> การอนุมัติจะถูกบันทึกพร้อม Timestamp, IP และ User ID ของท่านลงใน Audit Trail ทันที
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>ยกเลิก</button>
          <button className="btn" style={{ background: colorMap[action], color: '#fff' }} onClick={onClose}>
            {labelMap[action]}
          </button>
        </div>
      </div>
    </div>
  );
}

const approvalMatrix = [
  { level: 'ระดับ 1', approver: 'ฝ่ายกฎหมาย', condition: 'สัญญาทุกฉบับ', sla: '3 วันทำการ', scope: 'ตรวจข้อความและเงื่อนไขสัญญา' },
  { level: 'ระดับ 2', approver: 'ผู้อำนวยการฝ่ายทรัพย์สิน', condition: 'ค่าเช่า ≤ 200,000 บาท/เดือน', sla: '3 วันทำการ', scope: 'อนุมัติสัญญาวงเงินไม่สูง' },
  { level: 'ระดับ 3', approver: 'รองผู้ว่าการฝ่ายบริหาร', condition: 'ค่าเช่า 200,001 - 1,000,000 บาท/เดือน', sla: '5 วันทำการ', scope: 'อนุมัติสัญญาวงเงินสูง' },
  { level: 'ระดับ 4', approver: 'ผู้ว่าการรถไฟ', condition: 'ค่าเช่า > 1,000,000 บาท/เดือน', sla: '7 วันทำการ', scope: 'อนุมัติสัญญาวงเงินสูงสุด' },
];

export default function Approval() {
  const [tab, setTab] = useState('pending');
  const [modalData, setModalData] = useState<{ taskId: string; action: 'approve' | 'reject' | 'return' } | null>(null);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  const pendingTasks = approvalTasks.filter(t => t.status === 'รอดำเนินการ' || t.status === 'กำลังดำเนินการ');
  const doneTasks = approvalTasks.filter(t => t.status === 'อนุมัติแล้ว' || t.status === 'ปฏิเสธ');

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-title"><CheckSquare size={22} /> Workflow อนุมัติสัญญา</div>
        <div className="page-header-sub">จัดการการอนุมัติสัญญา ตรวจสอบ SLA และ Approval Matrix</div>
      </div>

      {/* KPI */}
      <div className="grid grid-4 mb-4">
        {[
          { label: 'รออนุมัติ', value: pendingTasks.length, color: 'var(--srt-gold)' },
          { label: 'เกิน SLA', value: 2, color: 'var(--srt-red)' },
          { label: 'อนุมัติวันนี้', value: 3, color: 'var(--srt-green)' },
          { label: 'เฉลี่ย (วัน)', value: '5.2', color: 'var(--srt-navy)' },
        ].map(k => (
          <div key={k.label} className="stat-card">
            <div className="stat-icon" style={{ background: k.color + '18' }}>
              <Clock size={20} color={k.color} />
            </div>
            <div className="stat-info">
              <h3 style={{ color: k.color }}>{k.value}</h3>
              <p>{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="tab-nav">
        {['pending', 'history', 'matrix', 'sla'].map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'pending' ? `รออนุมัติ (${pendingTasks.length})` : t === 'history' ? 'ประวัติการอนุมัติ' : t === 'matrix' ? 'Approval Matrix' : 'SLA Dashboard'}
          </button>
        ))}
      </div>

      {tab === 'pending' && (
        <div>
          {pendingTasks.length === 0 && <div className="empty-state"><CheckCircle size={48} /><h3>ไม่มีงานรออนุมัติ</h3><p>ทุกงานได้รับการดำเนินการเรียบร้อยแล้ว</p></div>}
          {pendingTasks.map(task => {
            const contract = contracts.find(c => c.contractNo === task.contractNo);
            const isExpanded = expandedTask === task.id;
            const isOverSLA = task.dueDate < '2567-06-27';
            return (
              <div key={task.id} className="card mb-4">
                <div className="card-header" style={{ cursor: 'pointer' }} onClick={() => setExpandedTask(isExpanded ? null : task.id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: task.priority === 'High' ? '#fee2e2' : '#fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckSquare size={18} color={task.priority === 'High' ? 'var(--srt-red)' : 'var(--srt-gold)'} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{task.action} · {task.contractNo}</div>
                      <div style={{ fontSize: 12, color: 'var(--srt-gray-500)' }}>{task.tenantName} · {task.type} · ฿{task.value.toLocaleString()}/เดือน</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {isOverSLA && <span className="badge badge-high"><AlertTriangle size={10} /> เกิน SLA</span>}
                    <span className={`badge badge-${task.priority === 'High' ? 'high' : 'medium'}`}>{task.priority}</span>
                    <span className="badge badge-pending">{task.status}</span>
                    <ChevronDown size={16} style={{ transform: isExpanded ? 'rotate(180deg)' : '', transition: '0.2s' }} />
                  </div>
                </div>

                {isExpanded && (
                  <div className="card-body">
                    <div className="grid grid-3 mb-4" style={{ gap: 12 }}>
                      <div><label className="form-label">ผู้ขอ</label><div>{task.requestedBy}</div></div>
                      <div><label className="form-label">วันที่ขอ</label><div>{formatDate(task.requestedDate)}</div></div>
                      <div><label className="form-label">กำหนด SLA</label><div style={{ color: isOverSLA ? 'var(--srt-red)' : 'inherit', fontWeight: isOverSLA ? 700 : 400 }}>{formatDate(task.dueDate)} {isOverSLA && '⚠ เกินกำหนด'}</div></div>
                    </div>

                    {contract && (
                      <div className="card mb-4" style={{ background: 'var(--srt-gray-50)', border: 'none' }}>
                        <div className="card-body" style={{ padding: 14 }}>
                          <div className="grid grid-2" style={{ gap: 10, fontSize: 13 }}>
                            {[['ทรัพย์สิน', contract.assetName], ['สถานี', contract.station], ['ค่าเช่า/เดือน', formatCurrency(contract.monthlyRent)], ['เงินประกัน', formatCurrency(contract.deposit)], ['วันเริ่ม', formatDate(contract.startDate)], ['วันสิ้นสุด', formatDate(contract.endDate)]].map(([k, v]) => (
                              <div key={k} style={{ display: 'flex', gap: 8 }}>
                                <span style={{ color: 'var(--srt-gray-500)', minWidth: 100 }}>{k}:</span>
                                <span style={{ fontWeight: 500 }}>{v}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-ghost btn-sm"><Eye size={13} /> ดูเอกสาร</button>
                      <button className="btn btn-ghost btn-sm"><MessageSquare size={13} /> ขอข้อมูลเพิ่ม</button>
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                        <button className="btn btn-ghost" onClick={() => setModalData({ taskId: task.id, action: 'return' })}>ส่งกลับแก้ไข</button>
                        <button className="btn btn-danger" onClick={() => setModalData({ taskId: task.id, action: 'reject' })}>ปฏิเสธ</button>
                        <button className="btn btn-success" onClick={() => setModalData({ taskId: task.id, action: 'approve' })}>
                          <CheckCircle size={14} /> อนุมัติ
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === 'history' && (
        <div className="card">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr><th>เลขสัญญา</th><th>การดำเนินการ</th><th>ผู้เช่า</th><th>ผู้อนุมัติ</th><th>วันที่</th><th>ผลลัพธ์</th><th>ความเห็น</th></tr>
              </thead>
              <tbody>
                {doneTasks.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 600, color: 'var(--srt-navy)', fontSize: 12 }}>{t.contractNo}</td>
                    <td style={{ fontSize: 12 }}>{t.action}</td>
                    <td style={{ fontSize: 12 }}>{t.tenantName}</td>
                    <td style={{ fontSize: 12 }}>ผู้อำนวยการฝ่ายทรัพย์สิน</td>
                    <td style={{ fontSize: 12 }}>{formatDate(t.requestedDate)}</td>
                    <td><span className={`badge ${t.status === 'อนุมัติแล้ว' ? 'badge-active' : 'badge-terminated'}`}>{t.status}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--srt-gray-500)' }}>-</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'matrix' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Configurable Approval Matrix</span>
            <button className="btn btn-outline btn-sm">แก้ไข Matrix</button>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>ระดับ</th><th>ผู้อนุมัติ</th><th>เงื่อนไข</th><th>SLA</th><th>ขอบเขต</th></tr></thead>
              <tbody>
                {approvalMatrix.map(m => (
                  <tr key={m.level}>
                    <td><span className="badge badge-review">{m.level}</span></td>
                    <td style={{ fontWeight: 600 }}>{m.approver}</td>
                    <td style={{ fontSize: 12 }}>{m.condition}</td>
                    <td><span className="badge badge-pending">{m.sla}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--srt-gray-500)' }}>{m.scope}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'sla' && (
        <div>
          <div className="grid grid-2 mb-4">
            <div className="card">
              <div className="card-header"><span className="card-title">SLA ตามขั้นตอน</span></div>
              <div className="card-body">
                {[
                  { name: 'ตรวจสอบเอกสาร', target: 1, actual: 0.8, pass: true },
                  { name: 'ตรวจสอบกฎหมาย', target: 3, actual: 2.9, pass: true },
                  { name: 'ตรวจสอบการเงิน', target: 2, actual: 1.5, pass: true },
                  { name: 'อนุมัติระดับ 2', target: 3, actual: 4.2, pass: false },
                  { name: 'อนุมัติระดับ 3', target: 5, actual: 5.8, pass: false },
                  { name: 'เตรียมลงนาม', target: 1, actual: 0.5, pass: true },
                ].map(s => (
                  <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 140, fontSize: 12 }}>{s.name}</div>
                    <div style={{ flex: 1 }}>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${Math.min((s.actual / s.target) * 100, 100)}%`, background: s.pass ? 'var(--srt-green)' : 'var(--srt-red)' }} />
                      </div>
                    </div>
                    <div style={{ fontSize: 12, width: 80, textAlign: 'right' }}>
                      <span style={{ fontWeight: 700, color: s.pass ? 'var(--srt-green)' : 'var(--srt-red)' }}>{s.actual}d</span> / {s.target}d
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="card-header"><span className="card-title">งานที่เกิน SLA</span></div>
              <div className="card-body">
                {pendingTasks.filter(t => t.dueDate < '2567-06-27').map(t => (
                  <div key={t.id} className="alert alert-danger mb-2" style={{ margin: 0, marginBottom: 8 }}>
                    <AlertTriangle size={14} />
                    <div>
                      <div style={{ fontWeight: 600 }}>{t.contractNo}</div>
                      <div style={{ fontSize: 12 }}>{t.tenantName} · กำหนด {formatDate(t.dueDate)}</div>
                    </div>
                  </div>
                ))}
                {pendingTasks.filter(t => t.dueDate < '2567-06-27').length === 0 && (
                  <div className="alert alert-success"><CheckCircle size={14} /> ไม่มีงานเกิน SLA</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {modalData && (
        <ApproveModal taskId={modalData.taskId} action={modalData.action} onClose={() => setModalData(null)} />
      )}
    </div>
  );
}
