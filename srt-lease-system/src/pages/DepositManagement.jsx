import { mockRequests } from '../data/mockData';
import { useState } from 'react';
import { CreditCard, CheckCircle, Clock, AlertTriangle, Download, Eye } from 'lucide-react';

const DEPOSIT_ITEMS = mockRequests
  .filter(r => ['Waiting for Deposit', 'Deposit Paid', 'Approved'].includes(r.status))
  .map(r => ({
    ...r,
    depositAmount: r.depositAmount || (r.estimatedRent ? r.estimatedRent * 3 : null),
    paymentStatus: r.status === 'Deposit Paid' ? 'Paid' : r.status === 'Waiting for Deposit' ? 'Pending' : 'Not Generated',
    dueDate: r.dueDate,
    paidDate: r.status === 'Deposit Paid' ? '2566-10-22' : null,
    ref1: `SRT${r.id.replace('LR-', '').replace('-', '')}`,
    ref2: `${Math.floor(Math.random() * 900000 + 100000)}`,
  }));

const PAY_STATUS = {
  Paid: { label: 'ชำระแล้ว', color: 'bg-green-100 text-green-700' },
  Pending: { label: 'รอชำระ', color: 'bg-amber-100 text-amber-700' },
  'Not Generated': { label: 'ยังไม่ออกใบแจ้ง', color: 'bg-gray-100 text-gray-600' },
  Overdue: { label: 'เกินกำหนด', color: 'bg-red-100 text-red-700' },
};

export default function DepositManagement() {
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState('list');

  const totalPending = DEPOSIT_ITEMS.filter(d => d.paymentStatus === 'Pending').reduce((s, d) => s + (d.depositAmount || 0), 0);
  const totalPaid = DEPOSIT_ITEMS.filter(d => d.paymentStatus === 'Paid').reduce((s, d) => s + (d.depositAmount || 0), 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'รอชำระ', count: DEPOSIT_ITEMS.filter(d => d.paymentStatus === 'Pending').length, sub: `฿${totalPending.toLocaleString()}`, color: 'text-amber-600' },
          { label: 'ชำระแล้ว', count: DEPOSIT_ITEMS.filter(d => d.paymentStatus === 'Paid').length, sub: `฿${totalPaid.toLocaleString()}`, color: 'text-green-600' },
          { label: 'ยังไม่ออกใบแจ้ง', count: DEPOSIT_ITEMS.filter(d => d.paymentStatus === 'Not Generated').length, sub: 'รายการ', color: 'text-gray-500' },
          { label: 'รวมมัดจำที่คาดการณ์', count: `฿${(totalPending + totalPaid).toLocaleString()}`, sub: 'บาท', color: 'text-srt-navy' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <div className={`text-xl font-bold ${s.color}`}>{s.count}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            <div className="text-xs text-gray-400 mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {[{ key: 'list', label: 'รายการมัดจำ' }, { key: 'payin', label: 'ใบนำจ่าย / Pay-in' }].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === t.key ? 'bg-srt-navy text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'list' && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['เลขคำขอ', 'ผู้ขอเช่า', 'ทรัพย์สิน', 'ค่าเช่า/เดือน', 'ค่ามัดจำ (3 เดือน)', 'สถานะ', 'วันครบกำหนด', ''].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {DEPOSIT_ITEMS.map(item => (
                <tr key={item.id} className="table-row-hover">
                  <td className="px-4 py-3 text-xs font-mono text-srt-navy">{item.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{item.applicantName}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">{item.assetName}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-700">
                    {item.estimatedRent ? `฿${item.estimatedRent.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-srt-navy">
                    {item.depositAmount ? `฿${item.depositAmount.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`status-badge ${PAY_STATUS[item.paymentStatus]?.color}`}>
                      {PAY_STATUS[item.paymentStatus]?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{item.dueDate}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelected(item)}
                      className="text-srt-navy hover:text-srt-navy-light transition-colors"
                    >
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'payin' && (
        <div className="max-w-md mx-auto">
          <div className="card overflow-hidden">
            <div className="bg-srt-navy p-4 text-white flex items-center gap-3">
              <CreditCard size={20} />
              <div>
                <div className="font-semibold">ใบนำจ่าย (Pay-in Slip)</div>
                <div className="text-xs text-white/70">การรถไฟแห่งประเทศไทย</div>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="text-center border-b border-dashed border-gray-300 pb-4">
                <div className="text-xs text-gray-500 mb-1">เลขที่ใบนำจ่าย</div>
                <div className="text-xl font-bold text-srt-navy">SRT-PAY-2566-0005</div>
              </div>
              {[
                ['ผู้ชำระ', 'นาง รัตนา วงษ์สุข'],
                ['เลขคำขอ', 'LR-2566-0005'],
                ['รายการ', 'ค่ามัดจำเช่าทรัพย์สิน'],
                ['ทรัพย์สิน', 'อาคารพาณิชย์ สถานีลาดกระบัง'],
                ['Ref1', 'SRT25660005'],
                ['Ref2', '483920'],
                ['จำนวนเงิน', '฿54,000'],
                ['วันครบกำหนด', '2566-11-01'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-sm text-gray-500">{k}:</span>
                  <span className="text-sm font-medium text-gray-800">{v}</span>
                </div>
              ))}
              <div className="border-t border-dashed border-gray-300 pt-4">
                <div className="flex justify-between text-base font-bold">
                  <span className="text-gray-700">ยอดชำระ</span>
                  <span className="text-srt-red text-xl">฿54,000</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-xs text-gray-500 mb-2">Barcode / QR Code</div>
                <div className="w-full h-16 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-400">
                  QR Code / Barcode สำหรับชำระเงิน
                </div>
              </div>
              <div className="text-xs text-gray-400 text-center">
                รับชำระที่ธนาคาร / Mobile Banking / Counter Service
              </div>
              <button className="btn-primary w-full flex items-center justify-center gap-2">
                <Download size={14} /> ดาวน์โหลด PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-base font-semibold text-srt-navy-dark">รายละเอียดมัดจำ</h3>
                <p className="text-xs text-gray-500">{selected.id}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="space-y-3 mb-4">
              {[
                ['ผู้ขอเช่า', selected.applicantName],
                ['ทรัพย์สิน', selected.assetName],
                ['ค่าเช่า/เดือน', selected.estimatedRent ? `฿${selected.estimatedRent.toLocaleString()}` : '-'],
                ['ค่ามัดจำ', selected.depositAmount ? `฿${selected.depositAmount.toLocaleString()}` : '-'],
                ['วันครบกำหนด', selected.dueDate],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-sm text-gray-500">{k}:</span>
                  <span className="text-sm font-medium text-gray-800">{v}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              {selected.paymentStatus !== 'Paid' && (
                <button className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <CheckCircle size={14} /> บันทึกรับชำระ
                </button>
              )}
              <button onClick={() => setSelected(null)} className="btn-secondary flex-1">ปิด</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
