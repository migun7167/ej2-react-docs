import { mockValuations } from '../data/mockData';
import { useState } from 'react';
import { Calculator, CheckCircle, Clock, TrendingUp, FileText, Edit } from 'lucide-react';

const STATUS_MAP = {
  'In Progress': { label: 'กำลังดำเนินการ', color: 'bg-amber-100 text-amber-700' },
  Completed: { label: 'เสร็จสิ้น', color: 'bg-green-100 text-green-700' },
  Pending: { label: 'รอดำเนินการ', color: 'bg-gray-100 text-gray-600' },
};

const METHODS = ['Market Comparison', 'Cost Approach', 'Income Approach', 'Replacement Cost'];

export default function ValuationManagement() {
  const [selected, setSelected] = useState(null);
  const [simArea, setSimArea] = useState('200');
  const [simRate, setSimRate] = useState('600');
  const [simFactor, setSimFactor] = useState('1.0');

  const simulatedRent = Math.round(parseFloat(simArea || 0) * parseFloat(simRate || 0) * parseFloat(simFactor || 1));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'งานทั้งหมด', count: mockValuations.length, color: 'text-srt-navy' },
          { label: 'กำลังดำเนินการ', count: mockValuations.filter(v => v.status === 'In Progress').length, color: 'text-amber-600' },
          { label: 'เสร็จสิ้น', count: mockValuations.filter(v => v.status === 'Completed').length, color: 'text-green-600' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Valuation list */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">รายการประเมินราคา</h3>
          {mockValuations.map(val => (
            <div
              key={val.id}
              onClick={() => setSelected(selected?.id === val.id ? null : val)}
              className={`card p-4 cursor-pointer transition-all hover:shadow-md ${selected?.id === val.id ? 'ring-2 ring-srt-navy' : ''}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-xs font-medium text-srt-navy">{val.id}</div>
                  <div className="text-xs text-gray-400">{val.requestId}</div>
                </div>
                <span className={`status-badge ${STATUS_MAP[val.status]?.color}`}>{STATUS_MAP[val.status]?.label}</span>
              </div>
              <div className="text-sm font-medium text-gray-800 mb-2">{val.assetName}</div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-gray-50 rounded p-2 text-center">
                  <div className="font-bold text-srt-navy">{val.area} ตร.ม.</div>
                  <div className="text-gray-400">พื้นที่</div>
                </div>
                <div className="bg-gray-50 rounded p-2 text-center">
                  <div className="font-bold text-srt-navy">฿{val.baseRate}</div>
                  <div className="text-gray-400">อัตราฐาน</div>
                </div>
                <div className="bg-gray-50 rounded p-2 text-center">
                  <div className="font-bold text-green-700">฿{val.calculatedRent.toLocaleString()}</div>
                  <div className="text-gray-400">ค่าเช่า/เดือน</div>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span>วิธี: {val.method}</span>
                <span>กำหนด: {val.dueDate}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Valuation Rule Engine Simulator */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-srt-navy-dark mb-4 flex items-center gap-2">
            <Calculator size={16} />
            Valuation Rule Engine Simulator
          </h3>
          <div className="space-y-3">
            <div>
              <label className="form-label">ประเภททรัพย์สิน</label>
              <select className="form-select">
                {['พื้นที่เชิงพาณิชย์', 'ที่ดิน', 'อาคาร', 'ห้อง', 'ป้ายโฆษณา'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">สถานที่</label>
              <select className="form-select">
                {['สถานีกรุงเทพ (Zone A)', 'สถานีบางซื่อ', 'สถานีดอนเมือง'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">วิธีประเมิน</label>
              <select className="form-select">
                {METHODS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="form-label">พื้นที่ (ตร.ม.)</label>
                <input type="number" value={simArea} onChange={e => setSimArea(e.target.value)} className="form-input" />
              </div>
              <div>
                <label className="form-label">อัตรา (฿/ตร.ม.)</label>
                <input type="number" value={simRate} onChange={e => setSimRate(e.target.value)} className="form-input" />
              </div>
              <div>
                <label className="form-label">ปรับ Factor</label>
                <input type="number" step="0.1" value={simFactor} onChange={e => setSimFactor(e.target.value)} className="form-input" />
              </div>
            </div>

            <div className="bg-srt-navy rounded-xl p-4 text-center">
              <div className="text-white/70 text-sm">ค่าเช่าประมาณการ</div>
              <div className="text-3xl font-bold text-white mt-1">฿{simulatedRent.toLocaleString()}</div>
              <div className="text-white/60 text-xs mt-1">ต่อเดือน</div>
              <div className="text-white/50 text-xs mt-2">
                {simArea} ตร.ม. × ฿{simRate} × {simFactor}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-xs text-amber-700">
                <TrendingUp size={13} />
                <span>ราคาขั้นต่ำสำหรับพื้นที่นี้: ฿95,000/เดือน</span>
              </div>
              {simulatedRent < 95000 && (
                <div className="text-xs text-red-600 mt-1 font-medium">⚠️ ต่ำกว่าราคาขั้นต่ำ — ต้องขออนุมัติพิเศษ</div>
              )}
            </div>

            <button className="btn-primary w-full flex items-center justify-center gap-2">
              <FileText size={14} /> บันทึกผลประเมิน
            </button>
          </div>
        </div>
      </div>

      {/* Rate Card */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-srt-navy-dark mb-4 flex items-center gap-2">
          <Edit size={14} />
          Price Master / Rate Card
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['ประเภททรัพย์สิน', 'โซน A (กรุงเทพ)', 'โซน B (ปริมณฑล)', 'โซน C (ต่างจังหวัด)', 'อัตราขั้นต่ำ', ''].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-3 py-2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                ['พื้นที่เชิงพาณิชย์', '฿400-800', '฿250-500', '฿150-300', '฿100', ''],
                ['ที่ดิน', '฿80-200', '฿50-120', '฿20-80', '฿15', ''],
                ['อาคาร', '฿300-600', '฿200-400', '฿100-250', '฿80', ''],
                ['ห้อง', '฿250-500', '฿150-300', '฿80-200', '฿60', ''],
                ['ป้ายโฆษณา', '฿1,500-3,000', '฿800-2,000', '฿400-1,000', '฿300', ''],
              ].map((row, i) => (
                <tr key={i} className="table-row-hover">
                  {row.map((cell, j) => (
                    <td key={j} className={`px-3 py-2.5 ${j === 0 ? 'font-medium text-gray-800' : 'text-gray-600'}`}>
                      {j === row.length - 1 ? (
                        <button className="text-xs text-srt-navy hover:underline">แก้ไข</button>
                      ) : cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
