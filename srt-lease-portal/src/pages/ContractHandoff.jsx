import { useState } from 'react';
import { ArrowRightLeft, CheckCircle, X, AlertTriangle } from 'lucide-react';
import { mockHandoffs } from '../data/mockData';

const STATUS_LABEL = { SENT:'ส่งต่อแล้ว', READY:'พร้อมส่งต่อ', WAITING_DEPOSIT:'รอชำระมัดจำ', ERROR:'มีข้อผิดพลาด' };
const STATUS_COLOR = { SENT:'bg-green-100 text-green-700', READY:'bg-blue-100 text-blue-700', WAITING_DEPOSIT:'bg-amber-100 text-amber-700', ERROR:'bg-red-100 text-red-700' };

const CHECKLIST = [
  { key: 'tenantInfo',  label: 'ข้อมูลผู้เช่าครบถ้วน (ชื่อ, เลขบัตร/นิติบุคคล, ที่อยู่, โทร)' },
  { key: 'assetInfo',   label: 'ข้อมูลทรัพย์สินถูกต้อง (รหัส, ชื่อ, พื้นที่, ชั้น)' },
  { key: 'payment',     label: 'ยืนยันการชำระมัดจำแล้ว' },
  { key: 'docs',        label: 'เอกสารครบถ้วนและแนบไฟล์แล้ว' },
  { key: 'valuation',   label: 'ผ่านการประเมินราคาแล้ว' },
  { key: 'approval',    label: 'ผ่านการอนุมัติทุกระดับแล้ว' },
];

export default function ContractHandoff() {
  const [handoffs, setHandoffs] = useState(mockHandoffs);
  const [modalId, setModalId]   = useState(null);
  const [checks, setChecks]     = useState({});
  const [sentId, setSentId]     = useState(null);

  const ready  = handoffs.filter(h => h.handoffStatus === 'READY').length;
  const sent   = handoffs.filter(h => h.handoffStatus === 'SENT').length;
  const errors = handoffs.filter(h => h.handoffStatus === 'ERROR').length;

  const toggleCheck = (key) => {
    setChecks(c => ({ ...c, [key]: !c[key] }));
  };

  const allChecked = CHECKLIST.every(item => checks[item.key]);

  const handleSend = (id) => {
    setHandoffs(prev => prev.map(h =>
      h.id === id ? { ...h, handoffStatus: 'SENT', handoffDate: '2567-04-27', contractSystem: `SRT-CONTRACT-2567-${Math.floor(100 + Math.random() * 900)}` } : h
    ));
    setSentId(id);
    setModalId(null);
    setChecks({});
  };

  const modalHandoff = handoffs.find(h => h.id === modalId);

  return (
    <div className="space-y-5">
      {/* Heading */}
      <div className="card-p bg-srt-navy/5 border border-srt-navy/10">
        <div className="flex items-center gap-3">
          <ArrowRightLeft size={24} className="text-srt-navy" />
          <div>
            <h2 className="text-lg font-bold text-srt-navy">ส่งต่อข้อมูลเข้าระบบทำสัญญาเช่า</h2>
            <p className="text-sm text-gray-500 mt-0.5">ส่งต่อข้อมูลคำขอที่อนุมัติและชำระมัดจำแล้ว เข้าสู่ระบบจัดทำสัญญาเช่าของการรถไฟฯ</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card-p bg-blue-50"><div className="text-xs text-gray-400">รอส่งต่อ</div><div className="text-2xl font-extrabold text-blue-700">{ready}</div></div>
        <div className="card-p bg-green-50"><div className="text-xs text-gray-400">ส่งต่อแล้ว</div><div className="text-2xl font-extrabold text-green-700">{sent}</div></div>
        <div className="card-p bg-red-50"><div className="text-xs text-gray-400">มีข้อผิดพลาด</div><div className="text-2xl font-extrabold text-red-700">{errors}</div></div>
      </div>

      {/* Success Banner */}
      {sentId && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
          <div>
            <div className="font-bold text-green-700 text-sm">ส่งข้อมูลเข้าระบบทำสัญญาเช่าเรียบร้อยแล้ว!</div>
            <div className="text-xs text-green-600 mt-0.5">
              รหัสในระบบสัญญา: {handoffs.find(h => h.id === sentId)?.contractSystem}
            </div>
          </div>
          <button className="ml-auto btn-ghost p-1" onClick={() => setSentId(null)}><X size={16} /></button>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 font-bold text-srt-navy">รายการรอส่งต่อ</div>
        <table className="w-full">
          <thead className="border-b border-gray-100 bg-gray-50/50">
            <tr>
              <th className="th">เลขคำขอ</th>
              <th className="th">ผู้เช่า</th>
              <th className="th">ทรัพย์สิน</th>
              <th className="th text-right">ค่าเช่า/เดือน</th>
              <th className="th">สถานะมัดจำ</th>
              <th className="th">สถานะส่งต่อ</th>
              <th className="th">รหัสสัญญา</th>
              <th className="th">Action</th>
            </tr>
          </thead>
          <tbody>
            {handoffs.map(h => (
              <tr key={h.id} className="tr-h border-b border-gray-50">
                <td className="td font-mono text-xs text-srt-navy">{h.requestId}</td>
                <td className="td text-xs text-gray-700 max-w-[150px] truncate">{h.applicantName}</td>
                <td className="td text-xs text-gray-500 max-w-[120px] truncate">{h.assetName}</td>
                <td className="td text-right font-bold text-srt-navy">฿{h.rentAmount.toLocaleString()}</td>
                <td className="td">
                  <span className={`badge ${h.depositStatus === 'ชำระแล้ว' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {h.depositStatus}
                  </span>
                </td>
                <td className="td">
                  <span className={`badge ${STATUS_COLOR[h.handoffStatus]}`}>{STATUS_LABEL[h.handoffStatus]}</span>
                </td>
                <td className="td">
                  {h.contractSystem
                    ? <span className="font-mono text-xs text-green-700">{h.contractSystem}</span>
                    : <span className="text-gray-300 text-xs">-</span>
                  }
                </td>
                <td className="td">
                  {h.handoffStatus === 'READY' && (
                    <button className="btn-navy btn-sm" onClick={() => setModalId(h.id)}>
                      <ArrowRightLeft size={12} />ส่งต่อ
                    </button>
                  )}
                  {h.handoffStatus === 'SENT' && (
                    <span className="text-xs text-green-600 font-medium">✓ ส่งต่อแล้ว</span>
                  )}
                  {h.handoffStatus === 'WAITING_DEPOSIT' && (
                    <span className="text-xs text-amber-600 font-medium flex items-center gap-1"><AlertTriangle size={12} />รอมัดจำ</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Handoff History */}
      <div className="card-p">
        <h3 className="font-bold text-srt-navy mb-4">ประวัติการส่งต่อ</h3>
        <div className="space-y-2">
          {handoffs.filter(h => h.handoffStatus === 'SENT').map(h => (
            <div key={h.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
              <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
              <div className="flex-1">
                <span className="font-bold text-sm text-gray-800">{h.requestId}</span>
                <span className="text-sm text-gray-600 ml-2">{h.applicantName}</span>
                <div className="text-xs text-gray-400">{h.handoffDate} · {h.contractSystem}</div>
              </div>
              <span className="badge bg-green-100 text-green-700">ส่งต่อแล้ว</span>
            </div>
          ))}
          {handoffs.filter(h => h.handoffStatus === 'SENT').length === 0 && (
            <div className="text-center text-gray-400 py-4">ยังไม่มีประวัติการส่งต่อ</div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalId && modalHandoff && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setModalId(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-srt-navy">Checklist ก่อนส่งต่อ</h3>
              <button className="btn-ghost p-1" onClick={() => setModalId(null)}><X size={18} /></button>
            </div>
            <div className="bg-srt-navy/5 rounded-xl p-3 mb-4 text-sm">
              <div className="font-bold text-srt-navy">{modalHandoff.requestId}</div>
              <div className="text-gray-600">{modalHandoff.applicantName}</div>
              <div className="text-gray-400 text-xs">{modalHandoff.assetName}</div>
            </div>
            <div className="space-y-2 mb-5">
              {CHECKLIST.map(item => (
                <label key={item.key} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-colors
                  ${checks[item.key] ? 'border-green-200 bg-green-50' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'}`}>
                  <input type="checkbox" className="accent-green-500 flex-shrink-0" checked={!!checks[item.key]} onChange={() => toggleCheck(item.key)} />
                  <span className={`text-sm ${checks[item.key] ? 'text-green-700 line-through opacity-70' : 'text-gray-700'}`}>{item.label}</span>
                </label>
              ))}
            </div>
            {!allChecked && (
              <div className="text-xs text-amber-600 flex items-center gap-1 mb-3">
                <AlertTriangle size={12} />กรุณาตรวจสอบให้ครบทุกรายการก่อนส่งต่อ
              </div>
            )}
            <div className="flex gap-3">
              <button className="btn-ghost flex-1" onClick={() => setModalId(null)}>ยกเลิก</button>
              <button
                className="btn-navy flex-1"
                disabled={!allChecked}
                onClick={() => handleSend(modalId)}
              >
                <ArrowRightLeft size={16} />ส่งต่อเข้าระบบสัญญา
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
