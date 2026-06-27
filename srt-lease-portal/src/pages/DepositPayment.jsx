import { useState } from 'react';
import { CreditCard, Download, CheckCircle, X, Printer } from 'lucide-react';
import { mockDeposits } from '../data/mockData';

const STATUS_LABEL = { PAID:'ชำระแล้ว', PENDING:'รอชำระ', OVERDUE:'เกินกำหนด' };
const STATUS_COLOR = { PAID:'bg-green-100 text-green-700', PENDING:'bg-amber-100 text-amber-700', OVERDUE:'bg-red-100 text-red-700' };

export default function DepositPayment() {
  const [tab, setTab] = useState(0);
  const [deposits, setDeposits] = useState(mockDeposits);
  const [confirmId, setConfirmId] = useState(null);
  const [slipId, setSlipId] = useState(null);
  const [ref1Input, setRef1Input] = useState('');
  const [receiptInput, setReceiptInput] = useState('');

  const paid    = deposits.filter(d => d.paymentStatus === 'PAID').length;
  const pending = deposits.filter(d => d.paymentStatus === 'PENDING').length;
  const overdue = deposits.filter(d => d.paymentStatus === 'OVERDUE').length;
  const totalAmt = deposits.reduce((s, d) => s + d.depositAmount, 0);

  const handleConfirm = (id) => {
    setDeposits(prev => prev.map(d =>
      d.id === id ? { ...d, paymentStatus: 'PAID', paidDate: '2567-04-27', receiptNo: receiptInput || `RC-2567-${Math.floor(1000 + Math.random() * 9000)}` } : d
    ));
    setConfirmId(null);
  };

  const slipDeposit = deposits.find(d => d.id === slipId);

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex border-b border-gray-100 bg-white rounded-t-2xl overflow-hidden px-2">
        {['รายการมัดจำ','ใบนำจ่าย (Pay-in Slip)'].map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap
              ${tab === i ? 'border-srt-navy text-srt-navy' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
            {i === 1 && <CreditCard size={14} className="inline mr-1" />}{t}
          </button>
        ))}
      </div>

      {tab === 0 && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label:'ชำระแล้ว',      value:paid,    color:'text-green-600',  bg:'bg-green-50' },
              { label:'รอชำระ',        value:pending, color:'text-amber-600',  bg:'bg-amber-50' },
              { label:'เกินกำหนด',     value:overdue, color:'text-red-600',   bg:'bg-red-50' },
              { label:'มูลค่ารวม',     value:`฿${(totalAmt/1000000).toFixed(2)}M`, color:'text-srt-navy', bg:'bg-blue-50' },
            ].map(s => (
              <div key={s.label} className={`card-p ${s.bg}`}>
                <div className="text-xs text-gray-400">{s.label}</div>
                <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-gray-100 bg-gray-50/50">
                <tr>
                  <th className="th">เลขมัดจำ</th>
                  <th className="th">คำขอ</th>
                  <th className="th">ผู้เช่า</th>
                  <th className="th">ทรัพย์สิน</th>
                  <th className="th text-right">ค่าเช่า/เดือน</th>
                  <th className="th text-right">มัดจำ</th>
                  <th className="th">กำหนดชำระ</th>
                  <th className="th">สถานะ</th>
                  <th className="th">Action</th>
                </tr>
              </thead>
              <tbody>
                {deposits.map(d => (
                  <tr key={d.id} className="tr-h border-b border-gray-50">
                    <td className="td font-mono text-xs text-srt-navy">{d.id}</td>
                    <td className="td text-xs">{d.requestId}</td>
                    <td className="td text-xs text-gray-700 max-w-[120px] truncate">{d.applicantName}</td>
                    <td className="td text-xs text-gray-500 max-w-[100px] truncate">{d.assetName}</td>
                    <td className="td text-right text-sm font-medium text-srt-navy">฿{d.rentAmount.toLocaleString()}</td>
                    <td className="td text-right text-sm font-bold text-gray-800">฿{d.depositAmount.toLocaleString()}</td>
                    <td className="td text-xs text-gray-500">{d.dueDate}</td>
                    <td className="td">
                      <span className={`badge ${STATUS_COLOR[d.paymentStatus]}`}>{STATUS_LABEL[d.paymentStatus]}</span>
                      {d.paymentStatus === 'PAID' && d.paidDate && (
                        <div className="text-[10px] text-gray-400 mt-0.5">ชำระ: {d.paidDate}</div>
                      )}
                    </td>
                    <td className="td">
                      <div className="flex gap-1">
                        {d.paymentStatus !== 'PAID' && (
                          <button className="btn-green btn-sm" onClick={() => setConfirmId(d.id)}>
                            <CheckCircle size={12} />ยืนยัน
                          </button>
                        )}
                        <button className="btn-white btn-sm" onClick={() => setSlipId(d.id)}>
                          <Printer size={12} />Slip
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 1 && (
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <div className="mb-3 flex gap-3">
              <select className="sel" value={slipId || ''} onChange={e => setSlipId(e.target.value || null)}>
                <option value="">-- เลือกรายการมัดจำ --</option>
                {deposits.map(d => <option key={d.id} value={d.id}>{d.id} — {d.applicantName}</option>)}
              </select>
              <button className="btn-navy"><Download size={16} />ดาวน์โหลด</button>
            </div>

            {slipDeposit ? (
              <div className="card border-2 border-srt-navy rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-srt-navy text-white p-5 text-center">
                  <div className="text-lg font-bold">🚂 การรถไฟแห่งประเทศไทย</div>
                  <div className="text-sm opacity-80">STATE RAILWAY OF THAILAND</div>
                  <div className="text-sm mt-2 font-semibold">ใบนำจ่ายค่ามัดจำเช่าทรัพย์สิน</div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">เลขที่ใบนำจ่าย</span>
                    <span className="font-bold">{slipDeposit.id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">เลขที่คำขอ</span>
                    <span>{slipDeposit.requestId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">ชื่อผู้เช่า</span>
                    <span className="font-medium text-right max-w-[200px]">{slipDeposit.applicantName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">ทรัพย์สิน</span>
                    <span className="text-right max-w-[200px]">{slipDeposit.assetName}</span>
                  </div>

                  <div className="border-t border-dashed border-gray-200 pt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">ค่าเช่า/เดือน</span>
                      <span>฿{slipDeposit.rentAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-lg font-extrabold">
                      <span>ยอดชำระมัดจำ</span>
                      <span className="text-srt-red">฿{slipDeposit.depositAmount.toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-gray-400 text-right mt-0.5">ครบกำหนด: {slipDeposit.dueDate}</div>
                  </div>

                  <div className="border-t border-dashed border-gray-200 pt-3">
                    <div className="text-xs text-gray-400 mb-2">ข้อมูลสำหรับชำระเงิน (Ref)</div>
                    <div className="bg-gray-50 rounded-xl p-3 font-mono text-sm space-y-1">
                      <div className="flex justify-between"><span className="text-gray-400">Ref.1</span><span className="font-bold">{slipDeposit.ref1}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Ref.2</span><span className="font-bold">{slipDeposit.ref2}</span></div>
                    </div>
                  </div>

                  {/* Barcode placeholder */}
                  <div className="flex flex-col items-center py-3">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 40 }).map((_, i) => (
                        <div key={i} className="bg-black rounded-sm" style={{ width: i % 3 === 0 ? 3 : 1.5, height: i % 5 === 0 ? 48 : 36 }} />
                      ))}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-1">{slipDeposit.ref1}{slipDeposit.ref2}</div>
                  </div>

                  {slipDeposit.paymentStatus === 'PAID' && slipDeposit.receiptNo && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                      <CheckCircle size={20} className="text-green-500 mx-auto mb-1" />
                      <div className="text-xs text-green-700 font-bold">ชำระแล้ว เมื่อวันที่ {slipDeposit.paidDate}</div>
                      <div className="text-xs text-green-600">ใบเสร็จ: {slipDeposit.receiptNo}</div>
                    </div>
                  )}

                  <div className="text-[10px] text-gray-400 text-center">
                    ชำระได้ที่ธนาคารกรุงไทย / ไทยพาณิชย์ / กสิกรไทย หรือ Internet Banking
                  </div>
                </div>
              </div>
            ) : (
              <div className="card-p text-center text-gray-400 py-12">
                <CreditCard size={40} className="mx-auto opacity-20 mb-3" />
                <p>เลือกรายการมัดจำเพื่อดูใบนำจ่าย</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setConfirmId(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-srt-navy">ยืนยันการชำระมัดจำ</h3>
              <button className="btn-ghost p-1" onClick={() => setConfirmId(null)}><X size={18} /></button>
            </div>
            {(() => {
              const d = deposits.find(dep => dep.id === confirmId);
              return d ? (
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-xl p-3 text-sm space-y-1">
                    <div className="flex justify-between"><span className="text-gray-400">รายการ</span><span>{d.id}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">จำนวน</span><span className="font-bold text-srt-red">฿{d.depositAmount.toLocaleString()}</span></div>
                  </div>
                  <div><label className="lbl">เลขที่ใบเสร็จ</label><input className="inp" value={receiptInput} onChange={e => setReceiptInput(e.target.value)} placeholder="RC-2567-XXXX" /></div>
                  <div className="flex gap-3 mt-2">
                    <button className="btn-ghost flex-1" onClick={() => setConfirmId(null)}>ยกเลิก</button>
                    <button className="btn-green flex-1" onClick={() => handleConfirm(confirmId)}><CheckCircle size={16} />ยืนยัน</button>
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
