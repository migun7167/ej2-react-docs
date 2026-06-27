import { mockRequests, mockApprovals } from '../data/mockData';
import StatusBadge from '../components/StatusBadge';
import { useState } from 'react';
import { CheckCircle, XCircle, RotateCcw, Clock, User, ChevronRight, Settings } from 'lucide-react';

const MATRIX = [
  { range: 'น้อยกว่า ฿50,000/เดือน', approver: 'ผู้จัดการเขต', level: 1, sla: '3 วันทำการ' },
  { range: '฿50,000 - ฿200,000/เดือน', approver: 'รองผู้ว่าการฝ่ายบริหารทรัพย์สิน', level: 2, sla: '7 วันทำการ' },
  { range: 'มากกว่า ฿200,000/เดือน', approver: 'ผู้ว่าการ', level: 3, sla: '14 วันทำการ' },
  { range: 'ที่ดิน / อาคารสำคัญ', approver: 'คณะกรรมการ', level: 3, sla: '30 วันทำการ' },
];

export default function ApprovalWorkflow({ navigate }) {
  const [activeTab, setActiveTab] = useState('pending');
  const [note, setNote] = useState('');

  const pendingItems = mockRequests.filter(r => r.status === 'Waiting for Approval');

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {[
          { key: 'pending', label: `รออนุมัติ (${pendingItems.length})` },
          { key: 'matrix', label: 'Approval Matrix' },
          { key: 'history', label: 'ประวัติการอนุมัติ' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === t.key ? 'bg-srt-navy text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Pending */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'รออนุมัติ', count: pendingItems.length, color: 'text-amber-600' },
              { label: 'เกิน SLA', count: pendingItems.filter(r => r.isOverSLA).length, color: 'text-red-600' },
              { label: 'Parallel Approval', count: 2, color: 'text-blue-600' },
            ].map(s => (
              <div key={s.label} className="card p-4 text-center">
                <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>

          {pendingItems.map(req => (
            <div key={req.id} className="card p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-medium text-srt-navy">{req.id}</span>
                    <StatusBadge status={req.status} />
                  </div>
                  <h3 className="text-base font-semibold text-gray-800">{req.assetName}</h3>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><User size={11} /> {req.applicantName}</span>
                    <span>พื้นที่: {req.area} ตร.ม.</span>
                    {req.estimatedRent && (
                      <span className="text-green-600 font-medium">฿{req.estimatedRent.toLocaleString()}/เดือน</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => navigate('request_detail', { requestId: req.id })}
                  className="flex items-center gap-1 text-xs text-srt-navy hover:underline"
                >
                  ดูรายละเอียด <ChevronRight size={12} />
                </button>
              </div>

              {/* Approval levels */}
              <div className="flex gap-3 mb-4">
                {mockApprovals.filter(a => a.requestId === req.id).map((apv, i) => (
                  <div key={apv.id} className={`flex-1 p-3 rounded-lg border text-center ${
                    apv.status === 'Approved' ? 'border-green-200 bg-green-50' :
                    apv.status === 'Pending' ? 'border-amber-200 bg-amber-50' :
                    'border-gray-200 bg-gray-50'
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto mb-1 ${
                      apv.status === 'Approved' ? 'bg-green-500' :
                      apv.status === 'Pending' ? 'bg-amber-500' :
                      'bg-gray-300'
                    }`}>
                      {apv.status === 'Approved' ? <CheckCircle size={12} className="text-white" /> : <Clock size={12} className="text-white" />}
                    </div>
                    <div className="text-xs font-medium text-gray-700">ระดับ {apv.level}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{apv.approverName}</div>
                    <div className={`text-xs mt-1 font-medium ${apv.status === 'Approved' ? 'text-green-600' : 'text-amber-600'}`}>
                      {apv.status === 'Approved' ? 'อนุมัติแล้ว' : 'รอดำเนินการ'}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="บันทึกเหตุผลการอนุมัติ..."
                  rows={2}
                  className="form-input resize-none"
                />
                <div className="flex gap-2">
                  <button className="btn-success flex-1 flex items-center justify-center gap-2">
                    <CheckCircle size={14} /> อนุมัติ
                  </button>
                  <button className="btn-danger flex-1 flex items-center justify-center gap-2">
                    <XCircle size={14} /> ปฏิเสธ
                  </button>
                  <button className="btn-secondary flex-1 flex items-center justify-center gap-2">
                    <RotateCcw size={14} /> ส่งกลับแก้ไข
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Matrix */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-srt-navy-dark flex items-center gap-2">
                <Settings size={15} /> Configurable Approval Matrix
              </h3>
              <button className="btn-primary text-xs py-1.5 px-3">เพิ่มกฎ</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {['วงเงิน / เงื่อนไข', 'ผู้อนุมัติ', 'ระดับ', 'SLA', 'สถานะ', ''].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {MATRIX.map((row, i) => (
                    <tr key={i} className="table-row-hover">
                      <td className="px-4 py-3 text-sm text-gray-800">{row.range}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{row.approver}</td>
                      <td className="px-4 py-3">
                        <span className="w-7 h-7 bg-srt-navy text-white rounded-full flex items-center justify-center text-xs font-bold">{row.level}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{row.sla}</td>
                      <td className="px-4 py-3">
                        <span className="status-badge bg-green-100 text-green-700">ใช้งาน</span>
                      </td>
                      <td className="px-4 py-3">
                        <button className="text-xs text-srt-navy hover:underline">แก้ไข</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Parallel Approval */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-srt-navy-dark mb-4">Parallel Approval — ฝ่ายที่ต้องอนุมัติพร้อมกัน</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { dept: 'ฝ่ายกฎหมาย', required: 'คำขอทุกประเภท', icon: '⚖️' },
                { dept: 'ฝ่ายการเงิน', required: 'วงเงิน > ฿100,000/เดือน', icon: '💰' },
                { dept: 'ฝ่ายทรัพย์สิน', required: 'ที่ดินและอาคาร', icon: '🏢' },
              ].map(item => (
                <div key={item.dept} className="bg-srt-navy/5 border border-srt-navy/20 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <div className="text-sm font-medium text-srt-navy">{item.dept}</div>
                  <div className="text-xs text-gray-500 mt-1">{item.required}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* History */}
      {activeTab === 'history' && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['รหัสคำขอ', 'ผู้อนุมัติ', 'ระดับ', 'ผล', 'หมายเหตุ', 'วันที่'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockApprovals.map(apv => (
                <tr key={apv.id} className="table-row-hover">
                  <td className="px-4 py-3 text-xs font-mono text-srt-navy">{apv.requestId}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{apv.approverName}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">ระดับ {apv.level}</td>
                  <td className="px-4 py-3">
                    <span className={`status-badge ${apv.status === 'Approved' ? 'bg-green-100 text-green-700' : apv.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                      {apv.status === 'Approved' ? 'อนุมัติ' : apv.status === 'Pending' ? 'รอ' : 'ปฏิเสธ'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{apv.notes || '-'}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{apv.date || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
