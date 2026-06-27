import { useState } from 'react';
import { Calculator, AlertTriangle, CheckCircle } from 'lucide-react';
import { mockValuations, RATE_CARD } from '../data/mockData';

const METHODS = ['อัตราตลาด + ปัจจัยปรับ','ราคาประมูลตลาด','ต้นทุนทดแทน'];
const ZONES   = ['Zone 1 (กรุงเทพฯ ชั้นใน)','Zone 2 (กรุงเทพฯ ชั้นนอก)','Zone 3 (ต่างจังหวัด)'];
const ASSET_TYPES = RATE_CARD.map(r => r.assetType);

function ValCard({ val, selected, onClick }) {
  const statusColor = val.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700';
  return (
    <div
      className={`card p-4 cursor-pointer transition-all ${selected ? 'ring-2 ring-srt-navy' : 'hover:shadow-md'}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="font-bold text-xs text-srt-navy font-mono">{val.requestId}</span>
        <span className={`badge ${statusColor}`}>{val.status === 'COMPLETED' ? 'เสร็จสิ้น' : 'กำลังดำเนินการ'}</span>
      </div>
      <div className="text-sm text-gray-700 font-medium truncate">{val.assetName}</div>
      <div className="text-xs text-gray-400 mt-1">{val.officerName}</div>
      {val.status === 'COMPLETED' && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-400">ค่าเช่าที่ประเมิน:</span>
          <span className="text-sm font-bold text-srt-navy ml-1">฿{val.adjustedRent.toLocaleString()}/เดือน</span>
        </div>
      )}
    </div>
  );
}

export default function Valuation() {
  const [selected, setSelected] = useState(mockValuations[0]);
  const [method, setMethod]   = useState(selected?.method || METHODS[0]);
  const [assetType, setAssetType] = useState('ร้านค้า');
  const [zone, setZone]       = useState(0);
  const [area, setArea]       = useState(selected?.area || 45);
  const [locFactor, setLocFactor] = useState(selected?.locationFactor || 1.0);
  const [condFactor, setCondFactor] = useState(selected?.conditionFactor || 1.0);
  const [tab, setTab] = useState(0);

  const rateEntry = RATE_CARD.find(r => r.assetType === assetType);
  const baseRate  = rateEntry ? [rateEntry.zone1, rateEntry.zone2, rateEntry.zone3][zone] : 500;
  const calcRent  = Math.round(baseRate * area * locFactor * condFactor);
  const minRent   = Math.round(baseRate * area * 0.8);
  const belowMin  = calcRent < minRent;

  return (
    <div className="space-y-4">
      <div className="flex border-b border-gray-100 bg-white rounded-t-2xl px-2">
        {['ประเมินราคา','Rate Card','ประวัติ'].map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors
              ${tab === i ? 'border-srt-navy text-srt-navy' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left: task list */}
          <div className="space-y-3">
            <h3 className="font-bold text-gray-600 text-sm px-1">งานประเมินราคา ({mockValuations.length})</h3>
            {mockValuations.map(val => (
              <ValCard key={val.id} val={val} selected={selected?.id === val.id} onClick={() => { setSelected(val); setArea(val.area); setLocFactor(val.locationFactor); setCondFactor(val.conditionFactor); }} />
            ))}
          </div>

          {/* Right: form */}
          <div className="lg:col-span-2 card-p space-y-5">
            {selected ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-srt-navy">{selected.requestId} — {selected.assetName}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">เจ้าหน้าที่: {selected.officerName}</p>
                  </div>
                  <Calculator size={20} className="text-srt-navy" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="lbl">วิธีการประเมิน</label>
                    <select className="sel" value={method} onChange={e => setMethod(e.target.value)}>
                      {METHODS.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="lbl">ประเภททรัพย์สิน</label>
                    <select className="sel" value={assetType} onChange={e => setAssetType(e.target.value)}>
                      {ASSET_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="lbl">โซน</label>
                    <select className="sel" value={zone} onChange={e => setZone(Number(e.target.value))}>
                      {ZONES.map((z, i) => <option key={z} value={i}>{z}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="lbl">พื้นที่ (ตร.ม.)</label>
                    <input type="number" className="inp" value={area} onChange={e => setArea(Number(e.target.value))} />
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-600">ปัจจัยทำเล: ×{locFactor.toFixed(2)}</label>
                    <span className="text-xs text-gray-400">0.80 – 1.50</span>
                  </div>
                  <input type="range" min="0.80" max="1.50" step="0.05" value={locFactor} onChange={e => setLocFactor(Number(e.target.value))} className="w-full accent-srt-navy" />
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-600">ปัจจัยสภาพ: ×{condFactor.toFixed(2)}</label>
                    <span className="text-xs text-gray-400">0.70 – 1.20</span>
                  </div>
                  <input type="range" min="0.70" max="1.20" step="0.05" value={condFactor} onChange={e => setCondFactor(Number(e.target.value))} className="w-full accent-srt-navy" />
                </div>

                {/* Result */}
                <div className="bg-srt-navy/5 rounded-2xl p-5">
                  <div className="grid grid-cols-3 gap-4 text-center mb-4">
                    <div>
                      <div className="text-xs text-gray-400">อัตราฐาน</div>
                      <div className="text-lg font-bold text-gray-600">฿{baseRate}</div>
                      <div className="text-[10px] text-gray-400">บาท/ตร.ม.</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">ค่าเช่าที่คำนวณ</div>
                      <div className="text-lg font-bold text-srt-navy">฿{calcRent.toLocaleString()}</div>
                      <div className="text-[10px] text-gray-400">บาท/เดือน</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">ค่าเช่าขั้นต่ำ</div>
                      <div className="text-lg font-bold text-gray-500">฿{minRent.toLocaleString()}</div>
                      <div className="text-[10px] text-gray-400">บาท/เดือน</div>
                    </div>
                  </div>

                  {belowMin && (
                    <div className="flex items-center gap-2 bg-red-100 border border-red-200 rounded-xl px-3 py-2 text-sm text-red-700">
                      <AlertTriangle size={16} />
                      ค่าเช่าที่คำนวณต่ำกว่าอัตราขั้นต่ำ กรุณาปรับปัจจัย
                    </div>
                  )}
                  {!belowMin && (
                    <div className="flex items-center gap-2 bg-green-100 border border-green-200 rounded-xl px-3 py-2 text-sm text-green-700">
                      <CheckCircle size={16} />
                      ค่าเช่าอยู่ในเกณฑ์ที่กำหนด
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button className="btn-navy flex-1">บันทึกผลการประเมิน</button>
                  <button className="btn-white">รีเซ็ต</button>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-400">เลือกรายการเพื่อประเมินราคา</div>
            )}
          </div>
        </div>
      )}

      {tab === 1 && (
        <div className="card-p">
          <h3 className="font-bold text-srt-navy mb-4">Rate Card อัตราค่าเช่า (บาท/ตร.ม./เดือน)</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="th">ประเภททรัพย์สิน</th>
                <th className="th text-center">Zone 1<div className="text-[10px] font-normal text-gray-400">กรุงเทพฯ ชั้นใน</div></th>
                <th className="th text-center">Zone 2<div className="text-[10px] font-normal text-gray-400">กรุงเทพฯ ชั้นนอก</div></th>
                <th className="th text-center">Zone 3<div className="text-[10px] font-normal text-gray-400">ต่างจังหวัด</div></th>
              </tr>
            </thead>
            <tbody>
              {RATE_CARD.map(r => (
                <tr key={r.assetType} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="td font-medium text-gray-700">{r.assetType}</td>
                  <td className="td text-center font-bold text-srt-navy">฿{r.zone1.toLocaleString()}</td>
                  <td className="td text-center font-semibold text-gray-600">฿{r.zone2.toLocaleString()}</td>
                  <td className="td text-center text-gray-500">฿{r.zone3.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-gray-400 mt-3">* อัตราอาจปรับตามปัจจัยทำเลและสภาพทรัพย์สิน (×0.80 – ×1.50)</p>
        </div>
      )}

      {tab === 2 && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-gray-100 bg-gray-50/50">
              <tr>
                <th className="th">รหัส</th>
                <th className="th">คำขอ</th>
                <th className="th">ทรัพย์สิน</th>
                <th className="th">วิธีการ</th>
                <th className="th text-right">ค่าเช่าที่ประเมิน</th>
                <th className="th">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {mockValuations.map(v => (
                <tr key={v.id} className="tr-h">
                  <td className="td font-mono text-xs text-srt-navy">{v.id}</td>
                  <td className="td text-xs">{v.requestId}</td>
                  <td className="td text-xs text-gray-600">{v.assetName}</td>
                  <td className="td text-xs text-gray-500">{v.method}</td>
                  <td className="td text-right font-bold text-srt-navy">฿{v.adjustedRent.toLocaleString()}</td>
                  <td className="td">
                    <span className={`badge ${v.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {v.status === 'COMPLETED' ? 'เสร็จสิ้น' : 'กำลังดำเนินการ'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
