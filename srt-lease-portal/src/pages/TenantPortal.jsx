import { useState } from 'react';
import { FileText, Upload, CreditCard, Bell, CheckCircle } from 'lucide-react';
import { mockRequests, mockNotifications } from '../data/mockData';
import StatusBadge from '../components/StatusBadge';
import ProcessTimeline from '../components/ProcessTimeline';

const TENANT_NAME = 'บริษัท กาแฟดอยตุง จำกัด';
const MY_REQS = mockRequests.filter(r => r.applicantName === TENANT_NAME || r.id === 'LR-2567-0001');
const MY_NOTIFS = mockNotifications.slice(0, 4);

export default function TenantPortal({ navigate }) {
  const [selectedReq, setSelectedReq] = useState(MY_REQS[0] || null);

  const pending  = MY_REQS.filter(r => !['APPROVED','REJECTED','HANDOFF'].includes(r.status)).length;
  const approved = MY_REQS.filter(r => r.status === 'APPROVED' || r.status === 'HANDOFF').length;
  const waitPay  = MY_REQS.filter(r => r.status === 'DEPOSIT_PENDING').length;

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Welcome Banner */}
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-r from-srt-navy to-srt-navy-l text-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm opacity-70 mb-1">ยินดีต้อนรับ</div>
              <h2 className="text-xl font-bold">{TENANT_NAME}</h2>
              <div className="text-sm opacity-80 mt-1">พอร์ทัลผู้ขอเช่าทรัพย์สิน — การรถไฟแห่งประเทศไทย</div>
            </div>
            <div className="text-5xl opacity-20">🏢</div>
          </div>
        </div>
        <div className="grid grid-cols-4 divide-x divide-gray-100">
          {[
            { label:'คำขอของฉัน', value: MY_REQS.length, color:'text-srt-navy' },
            { label:'รอดำเนินการ', value: pending, color:'text-amber-600' },
            { label:'อนุมัติแล้ว', value: approved, color:'text-green-600' },
            { label:'รอชำระเงิน', value: waitPay, color:'text-pink-600' },
          ].map(s => (
            <div key={s.label} className="p-4 text-center">
              <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* My Requests */}
        <div className="card-p">
          <h3 className="font-bold text-srt-navy mb-4 flex items-center gap-2"><FileText size={16} />คำขอของฉัน</h3>
          <div className="space-y-3">
            {MY_REQS.map(req => (
              <div
                key={req.id}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedReq?.id === req.id ? 'border-srt-navy bg-srt-navy/5' : 'border-gray-100 hover:border-srt-navy/40'}`}
                onClick={() => setSelectedReq(req)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-bold text-xs text-srt-navy font-mono">{req.id}</span>
                    <StatusBadge status={req.status} size="sm" />
                  </div>
                </div>
                <div className="text-sm text-gray-700 mt-1 font-medium">{req.assetName}</div>
                <div className="text-xs text-gray-400">{req.location} · {req.assetType}</div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-emerald-700 font-semibold">฿{req.estimatedRent.toLocaleString()}/เดือน</span>
                  <span className="text-[10px] text-gray-400">ยื่น: {req.submittedDate}</span>
                </div>
              </div>
            ))}
            {MY_REQS.length === 0 && <div className="text-center text-gray-400 py-6">ยังไม่มีคำขอ</div>}
          </div>
          <button className="btn-navy w-full mt-4" onClick={() => navigate('new_request')}>+ ยื่นคำขอใหม่</button>
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* Status Timeline */}
          {selectedReq && (
            <div className="card-p">
              <h3 className="font-bold text-srt-navy mb-3 text-sm">ความคืบหน้า — {selectedReq.id}</h3>
              <ProcessTimeline currentStatus={selectedReq.status} />
            </div>
          )}

          {/* Document Upload */}
          <div className="card-p">
            <h3 className="font-bold text-srt-navy mb-3 flex items-center gap-2 text-sm"><Upload size={14} />อัปโหลดเอกสาร</h3>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center hover:border-srt-navy/40 transition-colors cursor-pointer">
              <Upload size={24} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-400">ลากไฟล์หรือคลิกเพื่อเลือก</p>
              <p className="text-xs text-gray-300 mt-1">PDF, JPG, PNG สูงสุด 10MB</p>
            </div>
          </div>

          {/* Payment Status */}
          <div className="card-p">
            <h3 className="font-bold text-srt-navy mb-3 flex items-center gap-2 text-sm"><CreditCard size={14} />สถานะการชำระเงิน</h3>
            {waitPay > 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <div className="text-sm font-bold text-amber-700">มีรายการรอชำระมัดจำ {waitPay} รายการ</div>
                <div className="text-xs text-amber-600 mt-1">กรุณาชำระภายในกำหนดเพื่อไม่ให้คำขอถูกยกเลิก</div>
                <button className="btn-navy btn-sm mt-3"><CreditCard size={12} />ชำระเงิน</button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle size={16} />ไม่มีรายการค้างชำระ
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="card-p">
            <h3 className="font-bold text-srt-navy mb-3 flex items-center gap-2 text-sm"><Bell size={14} />การแจ้งเตือน</h3>
            <div className="space-y-2">
              {MY_NOTIFS.map(n => (
                <div key={n.id} className={`flex gap-2 p-2.5 rounded-xl ${!n.read ? 'bg-blue-50' : 'bg-gray-50'}`}>
                  <span className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${!n.read ? 'bg-srt-red' : 'bg-gray-300'}`} />
                  <div>
                    <div className="text-xs font-semibold text-gray-800">{n.title}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">{n.message}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
