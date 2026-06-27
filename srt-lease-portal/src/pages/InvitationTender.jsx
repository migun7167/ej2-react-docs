import { useState } from 'react';
import { X, Plus, CheckCircle, XCircle, Megaphone } from 'lucide-react';
import { mockInvitations } from '../data/mockData';

const STATUS_LABEL = { OPEN:'เปิดรับข้อเสนอ', CLOSED:'ปิดแล้ว', DRAFT:'ร่าง' };
const STATUS_COLOR = { OPEN:'bg-green-100 text-green-700', CLOSED:'bg-gray-100 text-gray-600', DRAFT:'bg-amber-100 text-amber-700' };

function RuleEngine() {
  const [rent, setRent]    = useState('');
  const [area, setArea]    = useState('');
  const [type, setType]    = useState('ร้านค้า');
  const [result, setResult] = useState(null);

  const check = () => {
    const r = Number(rent);
    const a = Number(area);
    if (!r || !a) { setResult({ need: false, reason: 'กรุณาระบุข้อมูลให้ครบ' }); return; }
    if (r >= 100000) { setResult({ need: true, reason: `ค่าเช่า ${r.toLocaleString()} บาท ≥ 100,000 บาท → ต้องประกาศเชิญชวน` }); return; }
    if (a >= 200) { setResult({ need: true, reason: `พื้นที่ ${a} ตร.ม. ≥ 200 ตร.ม. → ต้องประกาศเชิญชวน` }); return; }
    if (type === 'ห้างสรรพสินค้า') { setResult({ need: true, reason: `ประเภท "${type}" → ต้องประกาศเชิญชวนทุกกรณี` }); return; }
    setResult({ need: false, reason: `ค่าเช่า ${r.toLocaleString()} บาท / พื้นที่ ${a} ตร.ม. / ประเภท "${type}" → ไม่จำเป็นต้องประกาศเชิญชวน` });
  };

  return (
    <div className="card-p">
      <h3 className="font-bold text-srt-navy mb-4 flex items-center gap-2"><Megaphone size={16} />Decision Rule Engine: ต้องประกาศเชิญชวนหรือไม่?</h3>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label className="lbl">ค่าเช่า/เดือน (บาท)</label>
          <input type="number" className="inp" value={rent} onChange={e => setRent(e.target.value)} placeholder="เช่น 150000" />
        </div>
        <div>
          <label className="lbl">พื้นที่ (ตร.ม.)</label>
          <input type="number" className="inp" value={area} onChange={e => setArea(e.target.value)} placeholder="เช่น 120" />
        </div>
        <div>
          <label className="lbl">ประเภทกิจการ</label>
          <select className="sel" value={type} onChange={e => setType(e.target.value)}>
            {['ร้านค้า','ร้านอาหาร','สำนักงาน','แผงค้า','ห้างสรรพสินค้า'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <button className="btn-navy" onClick={check}>ตรวจสอบ</button>
      {result && (
        <div className={`mt-4 flex items-start gap-3 rounded-xl p-4 border
          ${result.need ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
          {result.need
            ? <Megaphone size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
            : <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
          }
          <div>
            <div className={`font-bold text-sm ${result.need ? 'text-amber-700' : 'text-green-700'}`}>
              {result.need ? 'ต้องประกาศเชิญชวน' : 'ไม่จำเป็นต้องประกาศเชิญชวน'}
            </div>
            <div className="text-xs mt-1 text-gray-600">{result.reason}</div>
          </div>
        </div>
      )}
      <div className="mt-4 text-xs text-gray-400">
        <strong>กฎเกณฑ์:</strong> ต้องประกาศหาก (1) ค่าเช่า ≥ 100,000 บาท/เดือน หรือ (2) พื้นที่ ≥ 200 ตร.ม. หรือ (3) เป็นประเภทห้างสรรพสินค้า
      </div>
    </div>
  );
}

export default function InvitationTender() {
  const [invitations, setInvitations] = useState(mockInvitations);
  const [selected, setSelected]       = useState(null);
  const [showCreate, setShowCreate]   = useState(false);
  const [winner, setWinner]           = useState({});

  const handleSelectWinner = (invId, bidderName) => {
    setWinner(w => ({ ...w, [invId]: bidderName }));
    setInvitations(prev => prev.map(inv =>
      inv.id === invId ? { ...inv, winner: bidderName, status: 'CLOSED' } : inv
    ));
  };

  return (
    <div className="space-y-4">
      <RuleEngine />

      <div className="flex items-center justify-between">
        <h3 className="font-bold text-srt-navy">รายการประกาศเชิญชวน ({invitations.length})</h3>
        <button className="btn-navy" onClick={() => setShowCreate(true)}><Plus size={16} />สร้างประกาศใหม่</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Invitation list */}
        <div className="space-y-3">
          {invitations.map(inv => (
            <div
              key={inv.id}
              className={`card p-4 cursor-pointer transition-all ${selected?.id === inv.id ? 'ring-2 ring-srt-navy' : 'hover:shadow-md'}`}
              onClick={() => setSelected(inv)}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="font-bold text-xs text-srt-navy font-mono">{inv.id}</span>
                  <span className="ml-2 text-xs text-gray-400">{inv.requestId}</span>
                </div>
                <span className={`badge ${STATUS_COLOR[inv.status]}`}>{STATUS_LABEL[inv.status]}</span>
              </div>
              <div className="font-medium text-sm text-gray-800">{inv.assetName}</div>
              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                <span>เปิด: {inv.publishDate}</span>
                <span>ปิด: {inv.closeDate}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-gray-400">ราคาขั้นต่ำ</span>
                <span className="font-bold text-sm text-srt-navy">฿{inv.minimumBid.toLocaleString()}/เดือน</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="badge bg-blue-50 text-blue-600">{inv.bidders.length} ราย</span>
                {inv.winner && <span className="badge bg-green-100 text-green-700">ผู้ชนะ: {inv.winner}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Detail panel */}
        {selected ? (
          <div className="card-p space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-srt-navy">{selected.assetName}</h4>
              <span className={`badge ${STATUS_COLOR[selected.status]}`}>{STATUS_LABEL[selected.status]}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-400 text-xs block">วันที่เปิด</span>{selected.publishDate}</div>
              <div><span className="text-gray-400 text-xs block">วันที่ปิด</span>{selected.closeDate}</div>
              <div className="col-span-2"><span className="text-gray-400 text-xs block">ราคาขั้นต่ำ</span>
                <span className="text-xl font-extrabold text-srt-navy">฿{selected.minimumBid.toLocaleString()}</span>
                <span className="text-gray-400 text-xs ml-1">/เดือน</span>
              </div>
            </div>

            {selected.bidders.length > 0 ? (
              <div>
                <h5 className="font-bold text-sm text-gray-600 mb-3">ผู้ยื่นข้อเสนอ</h5>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="th pl-0">ชื่อ</th>
                      <th className="th text-right">ราคาเสนอ</th>
                      <th className="th text-center">คะแนน</th>
                      <th className="th">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.bidders.map((b, i) => (
                      <tr key={i} className={`border-b border-gray-50 ${(winner[selected.id] || selected.winner) === b.name ? 'bg-green-50' : ''}`}>
                        <td className="td pl-0 text-xs font-medium text-gray-700 max-w-[120px] truncate">{b.name}</td>
                        <td className="td text-right font-bold text-srt-navy">฿{b.bid.toLocaleString()}</td>
                        <td className="td text-center">
                          <span className={`badge ${b.score >= 85 ? 'bg-green-100 text-green-700' : b.score >= 75 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                            {b.score}
                          </span>
                        </td>
                        <td className="td">
                          {(winner[selected.id] || selected.winner) === b.name ? (
                            <span className="badge bg-green-100 text-green-700"><CheckCircle size={10} />ชนะ</span>
                          ) : selected.status === 'OPEN' ? (
                            <button className="btn-navy btn-sm" onClick={() => handleSelectWinner(selected.id, b.name)}>
                              เลือกผู้ชนะ
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-xl">
                {selected.status === 'DRAFT' ? 'ยังไม่ได้เผยแพร่ประกาศ' : 'ยังไม่มีผู้ยื่นข้อเสนอ'}
              </div>
            )}
            {selected.status === 'DRAFT' && (
              <button className="btn-navy w-full"><Megaphone size={16} />เผยแพร่ประกาศ</button>
            )}
          </div>
        ) : (
          <div className="card-p flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Megaphone size={40} className="mx-auto opacity-20 mb-3" />
              <p className="text-sm">เลือกรายการเพื่อดูรายละเอียด</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-srt-navy">สร้างประกาศเชิญชวนใหม่</h3>
              <button className="btn-ghost p-1" onClick={() => setShowCreate(false)}><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div><label className="lbl">เลขคำขอ</label><input className="inp" placeholder="LR-2567-XXXX" /></div>
              <div><label className="lbl">ชื่อทรัพย์สิน</label><input className="inp" placeholder="ชื่อทรัพย์สิน" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="lbl">วันที่เปิด</label><input type="date" className="inp" /></div>
                <div><label className="lbl">วันที่ปิด</label><input type="date" className="inp" /></div>
              </div>
              <div><label className="lbl">ราคาขั้นต่ำ (บาท/เดือน)</label><input type="number" className="inp" placeholder="0" /></div>
              <div><label className="lbl">เงื่อนไขการยื่น</label><textarea className="inp" rows={2} /></div>
            </div>
            <div className="flex gap-3 mt-5">
              <button className="btn-ghost flex-1" onClick={() => setShowCreate(false)}>ยกเลิก</button>
              <button className="btn-navy flex-1" onClick={() => setShowCreate(false)}>บันทึกร่าง</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
