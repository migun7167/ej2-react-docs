import { useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle, RotateCcw, Download, MapPin, Camera, FileText, Clipboard } from 'lucide-react';
import { mockRequests, mockInspections, mockValuations, mockApprovals, mockAuditLogs } from '../data/mockData';
import StatusBadge from '../components/StatusBadge';
import SLABar from '../components/SLABar';
import ProcessTimeline from '../components/ProcessTimeline';

const TABS = ['ภาพรวม','เอกสาร','ตรวจพื้นที่','ประเมินราคา','การอนุมัติ','ประวัติ'];

const REQUIRED_DOCS = [
  { name: 'สำเนาบัตรประชาชน', uploaded: true },
  { name: 'สำเนาทะเบียนบ้าน', uploaded: true },
  { name: 'หนังสือรับรองบริษัท', uploaded: true },
  { name: 'งบการเงิน', uploaded: true },
  { name: 'แผนธุรกิจ', uploaded: false },
  { name: 'หลักฐานทางการเงิน', uploaded: false },
];

function InfoRow({ label, value }) {
  return (
    <div className="flex gap-2 py-2 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400 w-36 flex-shrink-0">{label}</span>
      <span className="text-sm text-gray-700 font-medium flex-1">{value || '-'}</span>
    </div>
  );
}

export default function RequestDetail({ navigate, selectedRequestId }) {
  const [tab, setTab] = useState(0);
  const [approvalNote, setApprovalNote] = useState('');
  const [actionDone, setActionDone] = useState(null);

  const req = mockRequests.find(r => r.id === selectedRequestId) || mockRequests[0];
  const inspection = mockInspections.find(i => i.requestId === req.id);
  const valuation  = mockValuations.find(v => v.requestId === req.id);
  const approvals  = mockApprovals.filter(a => a.requestId === req.id);
  const logs       = mockAuditLogs.filter(l => l.entityId === req.id || l.requestId === req.id);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="card-p flex items-start gap-4">
        <button className="btn-ghost p-2 mt-0.5" onClick={() => navigate('requests')}>
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h2 className="text-lg font-bold text-srt-navy font-mono">{req.id}</h2>
            <StatusBadge status={req.status} />
            {req.isOverSLA && <span className="badge bg-red-100 text-red-600">⚠️ เกิน SLA</span>}
            {req.priority === 'high' && <span className="badge bg-orange-100 text-orange-600">🔴 ด่วน</span>}
          </div>
          <div className="text-sm text-gray-500">{req.applicantName} · {req.assetName} · {req.location}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400 mb-1">SLA Progress</div>
          <SLABar used={req.slaUsed} total={req.slaHours} />
          <div className="text-xs text-gray-400 mt-1">{req.slaUsed}/{req.slaHours} ชม.</div>
        </div>
      </div>

      {/* Timeline */}
      <div className="card-p">
        <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">ขั้นตอนการดำเนินการ</h3>
        <ProcessTimeline currentStatus={req.status} />
      </div>

      {/* Tabs */}
      <div className="card overflow-hidden">
        <div className="flex border-b border-gray-100 bg-gray-50/50">
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              className={`flex-1 py-3 text-xs font-semibold transition-colors border-b-2 whitespace-nowrap
                ${tab === i ? 'border-srt-navy text-srt-navy bg-white' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="p-5">
          {/* ภาพรวม */}
          {tab === 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-gray-600 text-sm mb-3 flex items-center gap-2"><FileText size={14} />ข้อมูลผู้ขอเช่า</h4>
                <InfoRow label="ชื่อ-นามสกุล/บริษัท" value={req.applicantName} />
                <InfoRow label="ประเภท" value={req.applicantType} />
                <InfoRow label="เลขผู้เสียภาษี/บัตร" value={req.taxId} />
                <InfoRow label="เบอร์โทร" value={req.phone} />
                <InfoRow label="อีเมล" value={req.email} />
              </div>
              <div>
                <h4 className="font-bold text-gray-600 text-sm mb-3 flex items-center gap-2"><MapPin size={14} />ข้อมูลทรัพย์สิน</h4>
                <InfoRow label="ชื่อทรัพย์สิน" value={req.assetName} />
                <InfoRow label="รหัสทรัพย์สิน" value={req.assetId} />
                <InfoRow label="ประเภท" value={req.assetType} />
                <InfoRow label="สถานที่" value={req.location} />
                <InfoRow label="พื้นที่" value={`${req.area} ตร.ม.`} />
                <InfoRow label="ชั้น" value={req.floor} />
              </div>
              <div>
                <h4 className="font-bold text-gray-600 text-sm mb-3">การเงิน</h4>
                <InfoRow label="ค่าเช่า/เดือน" value={`฿${req.estimatedRent.toLocaleString()}`} />
                <InfoRow label="เงินมัดจำ" value={`฿${req.depositAmount.toLocaleString()}`} />
                <InfoRow label="ระยะเวลาเช่า" value={`${req.requestedPeriod} ปี`} />
                <InfoRow label="วัตถุประสงค์" value={req.purpose} />
              </div>
              <div>
                <h4 className="font-bold text-gray-600 text-sm mb-3">วันที่สำคัญ</h4>
                <InfoRow label="วันที่ยื่น" value={req.submittedDate} />
                <InfoRow label="กำหนดเสร็จ" value={req.dueDate} />
                <InfoRow label="เจ้าหน้าที่รับผิดชอบ" value={req.officerName} />
                <InfoRow label="ผู้อนุมัติ" value={req.approverName} />
              </div>
            </div>
          )}

          {/* เอกสาร */}
          {tab === 1 && (
            <div>
              <h4 className="font-bold text-gray-600 text-sm mb-4">รายการเอกสารประกอบ</h4>
              <div className="space-y-2">
                {REQUIRED_DOCS.map((doc, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${doc.uploaded ? 'border-green-100 bg-green-50' : 'border-red-100 bg-red-50'}`}>
                    {doc.uploaded
                      ? <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                      : <XCircle size={18} className="text-red-400 flex-shrink-0" />
                    }
                    <span className="flex-1 text-sm">{doc.name}</span>
                    {doc.uploaded
                      ? <button className="btn-white btn-sm"><Download size={12} />ดาวน์โหลด</button>
                      : <span className="text-xs text-red-500 font-medium">ยังไม่มีไฟล์</span>
                    }
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
                เอกสารครบ {REQUIRED_DOCS.filter(d => d.uploaded).length}/{REQUIRED_DOCS.length} รายการ
              </div>
            </div>
          )}

          {/* ตรวจพื้นที่ */}
          {tab === 2 && (
            <div>
              {inspection ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="flex-1 grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-gray-400">เจ้าหน้าที่:</span> {inspection.officerName}</div>
                      <div><span className="text-gray-400">วันตรวจ:</span> {inspection.scheduledDate}</div>
                      <div><span className="text-gray-400">GPS:</span> {inspection.gpsLat}, {inspection.gpsLng}</div>
                      <div><span className="text-gray-400">รูปถ่าย:</span> {inspection.photos} ภาพ <Camera size={13} className="inline" /></div>
                    </div>
                    <div>
                      {inspection.result === 'PASSED' && <span className="badge bg-green-100 text-green-700">✓ ผ่าน</span>}
                      {inspection.result === 'FAILED' && <span className="badge bg-red-100 text-red-700">✗ ไม่ผ่าน</span>}
                      {!inspection.result && <span className="badge bg-yellow-100 text-yellow-700">กำลังดำเนินการ</span>}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-600 mb-3 flex items-center gap-2"><Clipboard size={14} />รายการตรวจสอบ</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {inspection.checklist.map((item, i) => (
                        <div key={i} className={`flex items-center gap-2 p-2.5 rounded-lg text-sm ${item.checked ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                          {item.checked ? <CheckCircle size={14} /> : <XCircle size={14} />}
                          {item.item}
                        </div>
                      ))}
                    </div>
                  </div>
                  {inspection.notes && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800">
                      <strong>หมายเหตุ:</strong> {inspection.notes}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">ยังไม่มีข้อมูลการตรวจพื้นที่</div>
              )}
            </div>
          )}

          {/* ประเมินราคา */}
          {tab === 3 && (
            <div>
              {valuation ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="text-xs text-gray-400 mb-3 font-bold uppercase">ปัจจัยการคำนวณ</div>
                      <InfoRow label="วิธีการประเมิน" value={valuation.method} />
                      <InfoRow label="อัตราฐาน" value={`฿${valuation.baseRate}/ตร.ม.`} />
                      <InfoRow label="พื้นที่" value={`${valuation.area} ตร.ม.`} />
                      <InfoRow label="ปัจจัยทำเล" value={`x${valuation.locationFactor}`} />
                      <InfoRow label="ปัจจัยสภาพ" value={`x${valuation.conditionFactor}`} />
                    </div>
                    <div className="bg-srt-navy/5 rounded-xl p-4">
                      <div className="text-xs text-gray-400 mb-3 font-bold uppercase">ผลการประเมิน</div>
                      <div className="space-y-3">
                        <div><div className="text-xs text-gray-400">ค่าเช่าที่คำนวณได้</div><div className="text-xl font-bold text-gray-600">฿{valuation.calculatedRent.toLocaleString()}</div></div>
                        <div><div className="text-xs text-gray-400">ค่าเช่าที่ปรับแล้ว</div><div className="text-2xl font-extrabold text-srt-navy">฿{valuation.adjustedRent.toLocaleString()}</div></div>
                        <div><div className="text-xs text-gray-400">ค่าเช่าขั้นต่ำ</div><div className="text-base font-semibold text-gray-500">฿{valuation.minimumRent.toLocaleString()}</div></div>
                      </div>
                    </div>
                  </div>
                  {valuation.notes && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800">
                      <strong>หมายเหตุ:</strong> {valuation.notes}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">ยังไม่มีข้อมูลการประเมินราคา</div>
              )}
            </div>
          )}

          {/* การอนุมัติ */}
          {tab === 4 && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-gray-600 mb-3">ห่วงโซ่การอนุมัติ</h4>
              <div className="flex items-start gap-0">
                {approvals.map((apr, i) => (
                  <div key={apr.id} className="flex items-start">
                    <div className="flex flex-col items-center w-40">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 text-sm
                        ${apr.status === 'APPROVED' ? 'bg-green-500 border-green-500 text-white' : ''}
                        ${apr.status === 'PENDING' ? 'bg-amber-100 border-amber-400 text-amber-700' : ''}
                        ${apr.status === 'REJECTED' ? 'bg-red-500 border-red-500 text-white' : ''}
                      `}>
                        L{apr.level}
                      </div>
                      <div className="text-xs font-bold text-gray-700 mt-2 text-center">{apr.approverName}</div>
                      <div className="text-[10px] text-gray-400 text-center">{apr.role}</div>
                      <div className="mt-1">
                        {apr.status === 'APPROVED' && <span className="badge bg-green-100 text-green-600 text-[10px]">✓ อนุมัติ</span>}
                        {apr.status === 'PENDING' && <span className="badge bg-amber-100 text-amber-600 text-[10px]">รอพิจารณา</span>}
                        {apr.status === 'REJECTED' && <span className="badge bg-red-100 text-red-600 text-[10px]">ไม่อนุมัติ</span>}
                      </div>
                      {apr.actionDate && <div className="text-[10px] text-gray-400 mt-1">{apr.actionDate}</div>}
                      {apr.notes && <div className="text-[10px] text-blue-600 mt-1 text-center italic">"{apr.notes}"</div>}
                    </div>
                    {i < approvals.length - 1 && (
                      <div className={`h-0.5 w-8 mt-5 flex-shrink-0 ${i < approvals.findIndex(a => a.status === 'PENDING') ? 'bg-green-400' : 'bg-gray-200'}`} />
                    )}
                  </div>
                ))}
              </div>
              {approvals.some(a => a.status === 'PENDING') && !actionDone && (
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <label className="lbl">หมายเหตุการอนุมัติ</label>
                  <textarea className="inp" rows={3} value={approvalNote} onChange={e => setApprovalNote(e.target.value)} placeholder="ระบุเหตุผลหรือข้อสังเกต..." />
                  <div className="flex gap-3">
                    <button className="btn-green" onClick={() => setActionDone('approved')}><CheckCircle size={16} />อนุมัติ</button>
                    <button className="btn-red" onClick={() => setActionDone('rejected')}><XCircle size={16} />ไม่อนุมัติ</button>
                    <button className="btn-white" onClick={() => setActionDone('returned')}><RotateCcw size={16} />ส่งคืนแก้ไข</button>
                  </div>
                </div>
              )}
              {actionDone && (
                <div className={`p-3 rounded-xl text-sm font-medium flex items-center gap-2
                  ${actionDone==='approved' ? 'bg-green-100 text-green-700' : actionDone==='rejected' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                  <CheckCircle size={16} />
                  {actionDone==='approved' ? 'อนุมัติเรียบร้อยแล้ว' : actionDone==='rejected' ? 'บันทึกการไม่อนุมัติแล้ว' : 'ส่งคืนเพื่อแก้ไขแล้ว'}
                </div>
              )}
            </div>
          )}

          {/* ประวัติ */}
          {tab === 5 && (
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-gray-600 mb-3">ประวัติการดำเนินการ (Audit Trail)</h4>
              {mockAuditLogs.slice(0, 8).map(log => (
                <div key={log.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-1 rounded-full bg-srt-navy/20 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-srt-navy">{log.action}</span>
                      <span className="text-[10px] text-gray-400">{log.entityType}</span>
                      <span className="text-[10px] text-gray-400">{log.timestamp}</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">โดย: {log.userName}</div>
                    {log.oldValue && log.newValue && (
                      <div className="text-[10px] text-gray-400 mt-0.5">{log.oldValue} → {log.newValue}</div>
                    )}
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
