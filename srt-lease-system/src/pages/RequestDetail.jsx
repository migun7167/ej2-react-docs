import { mockRequests, mockApprovals, PROCESS_STEPS, STATUS_CONFIG } from '../data/mockData';
import StatusBadge from '../components/StatusBadge';
import SLABar from '../components/SLABar';
import { useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle, RotateCcw, MessageSquare, FileText, Clock, User, MapPin, Ruler } from 'lucide-react';

const TIMELINE = [
  { status: 'Submitted', date: '2566-11-01 09:00', actor: 'สมชาย ใจดี', note: 'ยื่นคำขอเช่าเข้าระบบ' },
  { status: 'Document Checking', date: '2566-11-01 10:30', actor: 'มานี สุขสม', note: 'เริ่มตรวจสอบเอกสาร' },
  { status: 'Asset Availability Checking', date: '2566-11-02 09:00', actor: 'ระบบ', note: 'ตรวจสอบสถานะทรัพย์สิน: พร้อมให้เช่า' },
  { status: 'Area Inspection', date: '2566-11-03 14:00', actor: 'ปิยะ ตั้งใจ', note: 'มอบหมายตรวจพื้นที่' },
  { status: 'Valuation', date: '2566-11-05 09:00', actor: 'สุพรรณ ประเมินดี', note: 'รับงานประเมินราคา' },
  { status: 'Waiting for Approval', date: '2566-11-07 10:00', actor: 'ระบบ', note: 'ส่งเข้า Workflow อนุมัติ' },
];

export default function RequestDetail({ navigate, selectedRequestId }) {
  const req = mockRequests.find(r => r.id === selectedRequestId) || mockRequests[0];
  const approvals = mockApprovals.filter(a => a.requestId === req.id);
  const [activeTab, setActiveTab] = useState('overview');
  const [approvalNote, setApprovalNote] = useState('');

  const currentStepIndex = PROCESS_STEPS.findIndex(s => s.key === req.status);

  const TABS = [
    { key: 'overview', label: 'ภาพรวม' },
    { key: 'documents', label: 'เอกสาร' },
    { key: 'approval', label: 'การอนุมัติ' },
    { key: 'timeline', label: 'ประวัติ' },
  ];

  return (
    <div className="space-y-4">
      {/* Back + Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('requests')} className="text-gray-500 hover:text-srt-navy flex items-center gap-1 text-sm">
          <ArrowLeft size={16} /> กลับ
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-srt-navy-dark">{req.id}</h1>
            <StatusBadge status={req.status} />
            {req.isOverSLA && <span className="status-badge bg-red-100 text-red-700">เกิน SLA</span>}
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{req.assetName}</p>
        </div>
        {req.status === 'Waiting for Approval' && (
          <div className="flex gap-2">
            <button className="btn-success flex items-center gap-2"><CheckCircle size={14} /> อนุมัติ</button>
            <button className="btn-danger flex items-center gap-2"><XCircle size={14} /> ปฏิเสธ</button>
            <button className="btn-secondary flex items-center gap-2"><RotateCcw size={14} /> ส่งกลับแก้ไข</button>
          </div>
        )}
      </div>

      {/* Process Steps */}
      <div className="card p-4 overflow-x-auto">
        <div className="flex items-center min-w-max gap-0">
          {PROCESS_STEPS.filter(s => !['Invitation Decision', 'Invitation / Tender'].includes(s.key) || req.requireInvitation).map((step, i, arr) => {
            const isDone = PROCESS_STEPS.indexOf(step) < currentStepIndex;
            const isCurrent = step.key === req.status;
            return (
              <div key={step.key} className="flex items-center">
                <div className={`flex flex-col items-center w-20 ${isDone ? 'opacity-100' : isCurrent ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                    isDone ? 'bg-green-500 text-white' :
                    isCurrent ? 'bg-srt-navy text-white ring-4 ring-srt-navy/20' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {isDone ? '✓' : step.icon}
                  </div>
                  <div className={`text-xs mt-1 text-center leading-tight ${isCurrent ? 'text-srt-navy font-medium' : 'text-gray-400'}`}>
                    {step.label}
                  </div>
                </div>
                {i < arr.length - 1 && (
                  <div className={`w-8 h-0.5 mx-1 flex-shrink-0 ${isDone ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SLA */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-2">
          <Clock size={14} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">SLA ขั้นตอนปัจจุบัน</span>
        </div>
        <SLABar slaHours={req.slaHours} slaUsed={req.slaUsed} isOverSLA={req.isOverSLA} />
      </div>

      {/* Tabs */}
      <div className="card overflow-hidden">
        <div className="flex border-b border-gray-200">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === t.key
                  ? 'border-srt-navy text-srt-navy'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><User size={14} /> ข้อมูลผู้ขอเช่า</h3>
                <div className="space-y-2">
                  {[
                    ['ชื่อ', req.applicantName],
                    ['ประเภท', req.applicantType],
                    ['วัตถุประสงค์', req.purpose],
                    ['เจ้าหน้าที่ดูแล', req.officer],
                  ].map(([k, v]) => (
                    <div key={k} className="flex gap-2">
                      <span className="text-xs text-gray-400 w-28 flex-shrink-0">{k}:</span>
                      <span className="text-sm text-gray-800">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><MapPin size={14} /> ข้อมูลทรัพย์สิน</h3>
                <div className="space-y-2">
                  {[
                    ['ทรัพย์สิน', req.assetName],
                    ['ประเภท', req.assetType],
                    ['สถานที่', req.location],
                    ['พื้นที่', `${req.area} ตร.ม.`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex gap-2">
                      <span className="text-xs text-gray-400 w-28 flex-shrink-0">{k}:</span>
                      <span className="text-sm text-gray-800">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Ruler size={14} /> ราคาและเงื่อนไข</h3>
                <div className="space-y-2">
                  {[
                    ['ค่าเช่าประมาณ', req.estimatedRent ? `฿${req.estimatedRent.toLocaleString()}/เดือน` : 'รอประเมิน'],
                    ['ค่ามัดจำ', req.depositAmount ? `฿${req.depositAmount.toLocaleString()}` : 'รอกำหนด'],
                    ['ต้องประกาศ', req.requireInvitation ? 'ใช่' : 'ไม่ต้อง'],
                    ['ความครบถ้วน', `${req.completeness}%`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex gap-2">
                      <span className="text-xs text-gray-400 w-28 flex-shrink-0">{k}:</span>
                      <span className="text-sm text-gray-800 font-medium">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Clock size={14} /> วันที่สำคัญ</h3>
                <div className="space-y-2">
                  {[
                    ['วันยื่นคำขอ', req.submittedDate],
                    ['กำหนด SLA', req.dueDate],
                    ['ผู้อนุมัติ', req.approver || 'ยังไม่ระบุ'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex gap-2">
                      <span className="text-xs text-gray-400 w-28 flex-shrink-0">{k}:</span>
                      <span className="text-sm text-gray-800">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Documents */}
          {activeTab === 'documents' && (
            <div className="space-y-3">
              {['สำเนาหนังสือรับรองบริษัท', 'สำเนาบัตรประชาชนกรรมการ', 'แผนผังที่ตั้งกิจการ', 'หนังสือมอบอำนาจ'].map((doc, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                  <FileText size={16} className="text-srt-navy flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-800">{doc}</div>
                    <div className="text-xs text-gray-400">PDF · อัปโหลดเมื่อ 2566-11-01</div>
                  </div>
                  <button className="text-xs text-srt-navy hover:underline">ดาวน์โหลด</button>
                </div>
              ))}
            </div>
          )}

          {/* Approval */}
          {activeTab === 'approval' && (
            <div className="space-y-4">
              {approvals.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">ยังไม่มีประวัติการอนุมัติ</p>
              )}
              {approvals.map((apv, i) => (
                <div key={apv.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      apv.status === 'Approved' ? 'bg-green-100' : apv.status === 'Rejected' ? 'bg-red-100' : 'bg-amber-100'
                    }`}>
                      {apv.status === 'Approved' ? <CheckCircle size={16} className="text-green-600" /> :
                       apv.status === 'Rejected' ? <XCircle size={16} className="text-red-600" /> :
                       <Clock size={16} className="text-amber-600" />}
                    </div>
                    {i < approvals.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 mt-2 min-h-8"></div>}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-medium text-gray-800">{apv.approverName}</div>
                        <div className="text-xs text-gray-500">{apv.role} · ระดับที่ {apv.level}</div>
                      </div>
                      <span className={`status-badge ${apv.status === 'Approved' ? 'bg-green-100 text-green-700' : apv.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                        {apv.status === 'Approved' ? 'อนุมัติ' : apv.status === 'Pending' ? 'รอดำเนินการ' : 'ปฏิเสธ'}
                      </span>
                    </div>
                    {apv.notes && <p className="text-xs text-gray-600 mt-1 bg-gray-50 rounded-lg p-2">{apv.notes}</p>}
                    {apv.date && <div className="text-xs text-gray-400 mt-1">{apv.date}</div>}
                  </div>
                </div>
              ))}

              {req.status === 'Waiting for Approval' && (
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"><MessageSquare size={14} /> บันทึกการอนุมัติ</h4>
                  <textarea
                    value={approvalNote}
                    onChange={e => setApprovalNote(e.target.value)}
                    rows={3}
                    placeholder="ระบุเหตุผล ข้อสังเกต หรือเงื่อนไขการอนุมัติ..."
                    className="form-input resize-none"
                  />
                  <div className="flex gap-2 mt-2">
                    <button className="btn-success flex items-center gap-2 flex-1 justify-center"><CheckCircle size={14} /> อนุมัติ</button>
                    <button className="btn-danger flex items-center gap-2 flex-1 justify-center"><XCircle size={14} /> ปฏิเสธ</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Timeline */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              {TIMELINE.map((event, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-srt-navy flex-shrink-0 mt-1"></div>
                    {i < TIMELINE.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 mt-2 min-h-8"></div>}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-medium text-gray-800">{event.note}</div>
                        <div className="text-xs text-gray-500">{event.actor}</div>
                      </div>
                      <div className="text-xs text-gray-400 flex-shrink-0 ml-4">{event.date}</div>
                    </div>
                    <StatusBadge status={event.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
