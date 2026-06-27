import { useState } from 'react';
import { CheckCircle, XCircle, RotateCcw, Edit } from 'lucide-react';
import { mockApprovals, mockRequests, APPROVAL_MATRIX } from '../data/mockData';

const PARALLEL_DEPTS = [
  { dept: 'ฝ่ายกฎหมาย',   role: 'เจ้าหน้าที่กฎหมาย', status: 'APPROVED', officer: 'นายทนง ชัยธรรม', date: '2567-04-08' },
  { dept: 'ฝ่ายการเงิน',  role: 'เจ้าหน้าที่การเงิน', status: 'APPROVED', officer: 'นางสาวจันทร์ บัวขาว', date: '2567-04-09' },
  { dept: 'ฝ่ายทรัพย์สิน',role: 'เจ้าหน้าที่ทรัพย์สิน',status: 'PENDING', officer: 'นายนิมิตร พงษ์ศรี', date: null },
];

const pendingReqs = mockRequests.filter(r => ['PENDING_L1','PENDING_L2','PENDING_L3','PENDING_L4'].includes(r.status));

function ApprovalChain({ requestId }) {
  const approvals = mockApprovals.filter(a => a.requestId === requestId);
  if (!approvals.length) return <div className="text-xs text-gray-400">ยังไม่มีข้อมูลการอนุมัติ</div>;
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {approvals.map((apr, i) => (
        <div key={apr.id} className="flex items-center gap-1">
          <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium
            ${apr.status === 'APPROVED' ? 'bg-green-100 text-green-700' : apr.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
            <span>L{apr.level}</span>
            <span className="hidden sm:inline">{apr.role.split(' ')[0]}</span>
            {apr.status === 'APPROVED' && <CheckCircle size={10} />}
            {apr.status === 'REJECTED' && <XCircle size={10} />}
          </div>
          {i < approvals.length - 1 && <span className="text-gray-300">→</span>}
        </div>
      ))}
    </div>
  );
}

export default function ApprovalWorkflow() {
  const [tab, setTab] = useState(0);
  const [notes, setNotes]     = useState({});
  const [actions, setActions] = useState({});
  const [matrix, setMatrix]   = useState(APPROVAL_MATRIX);
  const [editingRow, setEditingRow] = useState(null);

  const handleAction = (reqId, action) => {
    setActions(a => ({ ...a, [reqId]: action }));
  };

  return (
    <div className="space-y-4">
      <div className="flex border-b border-gray-100 bg-white rounded-t-2xl overflow-hidden px-2">
        {['งานรออนุมัติ','Approval Matrix','ประวัติการอนุมัติ'].map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap
              ${tab === i ? 'border-srt-navy text-srt-navy' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
            {t}
            {i === 0 && <span className="ml-1.5 bg-srt-red text-white text-[10px] rounded-full px-1.5 py-0.5">{pendingReqs.length}</span>}
          </button>
        ))}
      </div>

      {/* งานรออนุมัติ */}
      {tab === 0 && (
        <div className="space-y-4">
          {/* Parallel Approval Banner */}
          <div className="card-p">
            <h4 className="font-bold text-sm text-gray-600 mb-3">การอนุมัติแบบขนาน (Parallel) — ฝ่ายต่างๆ</h4>
            <div className="grid grid-cols-3 gap-3">
              {PARALLEL_DEPTS.map(d => (
                <div key={d.dept} className={`p-3 rounded-xl border ${d.status === 'APPROVED' ? 'border-green-100 bg-green-50' : 'border-amber-100 bg-amber-50'}`}>
                  <div className="font-bold text-xs text-gray-700">{d.dept}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{d.officer}</div>
                  <div className="mt-2">
                    {d.status === 'APPROVED'
                      ? <span className="badge bg-green-100 text-green-700">✓ อนุมัติ {d.date}</span>
                      : <span className="badge bg-amber-100 text-amber-700">รอพิจารณา</span>
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>

          {pendingReqs.length === 0 && (
            <div className="card-p text-center text-gray-400 py-8">ไม่มีงานรออนุมัติ</div>
          )}
          {pendingReqs.map(req => (
            <div key={req.id} className="card-p space-y-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-srt-navy font-mono">{req.id}</span>
                    <span className="badge bg-amber-100 text-amber-700">{req.status.replace('_',' ')}</span>
                    {req.priority === 'high' && <span className="badge bg-red-100 text-red-600">🔴 ด่วน</span>}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{req.applicantName}</div>
                  <div className="text-xs text-gray-400">{req.assetName} · {req.location} · ฿{req.estimatedRent.toLocaleString()}/เดือน</div>
                </div>
                <div className="text-right text-xs text-gray-400">
                  <div>ยื่น: {req.submittedDate}</div>
                  <div className="text-amber-600 font-medium">SLA: {req.slaUsed}/{req.slaHours} ชม.</div>
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-400 mb-2">ห่วงโซ่การอนุมัติ:</div>
                <ApprovalChain requestId={req.id} />
              </div>

              {actions[req.id] ? (
                <div className={`flex items-center gap-2 rounded-xl p-3 text-sm font-medium
                  ${actions[req.id] === 'approved' ? 'bg-green-100 text-green-700' : actions[req.id] === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                  <CheckCircle size={16} />
                  {actions[req.id] === 'approved' ? 'อนุมัติเรียบร้อยแล้ว' : actions[req.id] === 'rejected' ? 'บันทึกการไม่อนุมัติ' : 'ส่งคืนเพื่อแก้ไขแล้ว'}
                </div>
              ) : (
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <div>
                    <label className="lbl">หมายเหตุ</label>
                    <textarea
                      className="inp"
                      rows={2}
                      value={notes[req.id] || ''}
                      onChange={e => setNotes(n => ({ ...n, [req.id]: e.target.value }))}
                      placeholder="ระบุเหตุผลหรือข้อสังเกต..."
                    />
                  </div>
                  <div className="flex gap-3">
                    <button className="btn-green btn-sm" onClick={() => handleAction(req.id, 'approved')}>
                      <CheckCircle size={14} />อนุมัติ
                    </button>
                    <button className="btn-red btn-sm" onClick={() => handleAction(req.id, 'rejected')}>
                      <XCircle size={14} />ไม่อนุมัติ
                    </button>
                    <button className="btn-white btn-sm" onClick={() => handleAction(req.id, 'returned')}>
                      <RotateCcw size={14} />ส่งคืนแก้ไข
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Approval Matrix */}
      {tab === 1 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-srt-navy">Approval Matrix</h3>
            <button className="btn-navy btn-sm"><Edit size={14} />แก้ไข</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="th">ประเภทคำขอ</th>
                  <th className="th">ช่วงวงเงิน (บาท/เดือน)</th>
                  <th className="th">ระดับ 1</th>
                  <th className="th">ระดับ 2</th>
                  <th className="th">ระดับ 3</th>
                  <th className="th">ระดับ 4</th>
                  <th className="th text-center">SLA (ชม.)</th>
                </tr>
              </thead>
              <tbody>
                {matrix.map(row => (
                  <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="td font-medium text-gray-700">{row.label}</td>
                    <td className="td text-sm text-gray-600">
                      ฿{row.amountMin.toLocaleString()} – {row.amountMax ? `฿${row.amountMax.toLocaleString()}` : 'ขึ้นไป'}
                    </td>
                    {[row.level1, row.level2, row.level3, row.level4].map((l, i) => (
                      <td key={i} className="td">
                        <span className={`badge ${l !== '-' ? 'bg-srt-navy/10 text-srt-navy' : 'bg-gray-50 text-gray-300'}`}>{l}</span>
                      </td>
                    ))}
                    <td className="td text-center font-bold text-srt-navy">{row.slaHours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ประวัติ */}
      {tab === 2 && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-gray-100 bg-gray-50/50">
              <tr>
                <th className="th">รหัส</th>
                <th className="th">คำขอ</th>
                <th className="th">ระดับ</th>
                <th className="th">ผู้อนุมัติ</th>
                <th className="th">บทบาท</th>
                <th className="th">สถานะ</th>
                <th className="th">วันที่</th>
                <th className="th">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody>
              {mockApprovals.map(a => (
                <tr key={a.id} className="tr-h border-b border-gray-50">
                  <td className="td font-mono text-xs text-srt-navy">{a.id}</td>
                  <td className="td text-xs">{a.requestId}</td>
                  <td className="td text-center"><span className="badge bg-gray-100 text-gray-600">L{a.level}</span></td>
                  <td className="td text-xs text-gray-700">{a.approverName}</td>
                  <td className="td text-xs text-gray-500">{a.role}</td>
                  <td className="td">
                    <span className={`badge ${a.status === 'APPROVED' ? 'bg-green-100 text-green-700' : a.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      {a.status === 'APPROVED' ? 'อนุมัติ' : a.status === 'REJECTED' ? 'ไม่อนุมัติ' : 'รอพิจารณา'}
                    </span>
                  </td>
                  <td className="td text-xs text-gray-500">{a.actionDate || '-'}</td>
                  <td className="td text-xs text-gray-500 max-w-[120px] truncate">{a.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
