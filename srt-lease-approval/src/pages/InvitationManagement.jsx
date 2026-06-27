import { mockInvitations } from '../data/mockData';
import { useState } from 'react';
import { Megaphone, Users, Trophy, Calendar, AlertCircle, CheckCircle, Plus } from 'lucide-react';

const MOCK_BIDDERS = [
  { id: 1, name: 'บริษัท เทคโนพาร์ค จำกัด', bid: 135000, score: 88, status: 'Winner' },
  { id: 2, name: 'บริษัท โลจิสติกส์ไทย จำกัด', bid: 128000, score: 82, status: 'Runner-up' },
  { id: 3, name: 'ห้างหุ้นส่วนจำกัด แสงทอง', bid: 112000, score: 74, status: 'Rejected' },
];

const STATUS_MAP = {
  Open: { label: 'เปิดรับข้อเสนอ', color: 'bg-green-100 text-green-700' },
  Evaluation: { label: 'อยู่ระหว่างคัดเลือก', color: 'bg-amber-100 text-amber-700' },
  Closed: { label: 'ปิดแล้ว', color: 'bg-gray-100 text-gray-600' },
  Awarded: { label: 'ประกาศผู้ชนะ', color: 'bg-blue-100 text-blue-700' },
};

export default function InvitationManagement() {
  const [selected, setSelected] = useState(mockInvitations[0]);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [decisionResult, setDecisionResult] = useState(null);

  const checkInvitationRequired = () => {
    setDecisionResult({
      required: true,
      reason: 'ค่าเช่าเกิน ฿50,000/เดือน และพื้นที่เกิน 500 ตร.ม. ตามระเบียบการรถไฟข้อ 12.3',
    });
    setShowDecisionModal(true);
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'ประกาศทั้งหมด', count: mockInvitations.length, color: 'text-srt-navy' },
          { label: 'เปิดรับข้อเสนอ', count: mockInvitations.filter(i => i.status === 'Open').length, color: 'text-green-600' },
          { label: 'คัดเลือก', count: mockInvitations.filter(i => i.status === 'Evaluation').length, color: 'text-amber-600' },
          { label: 'ผู้เสนอราคา', count: mockInvitations.reduce((s, i) => s + i.bidders, 0), color: 'text-blue-600' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Invitation Decision Rule */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-srt-navy-dark mb-3 flex items-center gap-2">
          <AlertCircle size={15} className="text-srt-red" />
          Invitation Decision Rule Engine
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div>
              <label className="form-label">ค่าเช่าประมาณการ (บาท/เดือน)</label>
              <input type="number" defaultValue="120000" className="form-input" />
            </div>
            <div>
              <label className="form-label">พื้นที่ (ตร.ม.)</label>
              <input type="number" defaultValue="1200" className="form-input" />
            </div>
            <div>
              <label className="form-label">ประเภททรัพย์สิน</label>
              <select className="form-select">
                {['ที่ดิน', 'อาคาร', 'พื้นที่เชิงพาณิชย์', 'ห้อง'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <button onClick={checkInvitationRequired} className="btn-primary w-full">ตรวจสอบว่าต้องประกาศหรือไม่</button>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-gray-600 mb-2">เกณฑ์ที่ต้องประกาศเชิญชวน</h4>
            <div className="space-y-1.5">
              {[
                'ค่าเช่า ≥ ฿50,000/เดือน',
                'พื้นที่ ≥ 500 ตร.ม.',
                'ที่ดินทุกกรณี (ตามกฎหมาย)',
                'อาคารหลายชั้นหรืออาคารสำคัญ',
                'กรณีที่มีผู้สนใจหลายราย',
              ].map((rule, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-srt-navy mt-1 flex-shrink-0"></span>
                  {rule}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Decision modal */}
      {showDecisionModal && decisionResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${decisionResult.required ? 'bg-amber-100' : 'bg-green-100'}`}>
                {decisionResult.required ? <AlertCircle size={28} className="text-amber-600" /> : <CheckCircle size={28} className="text-green-600" />}
              </div>
              <h3 className="text-lg font-bold text-srt-navy-dark mb-2">
                {decisionResult.required ? 'ต้องประกาศเชิญชวน' : 'ไม่ต้องประกาศเชิญชวน'}
              </h3>
              <p className="text-sm text-gray-600 mb-4">{decisionResult.reason}</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDecisionModal(false)} className="btn-secondary flex-1">ปิด</button>
                {decisionResult.required && (
                  <button onClick={() => setShowDecisionModal(false)} className="btn-primary flex-1">จัดทำประกาศ</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invitations list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">ประกาศเชิญชวน</h3>
            <button className="btn-primary flex items-center gap-1 text-xs py-1.5">
              <Plus size={13} /> สร้างประกาศ
            </button>
          </div>
          {mockInvitations.map(inv => (
            <button
              key={inv.id}
              onClick={() => setSelected(inv)}
              className={`w-full card p-4 text-left transition-all hover:shadow-md ${selected?.id === inv.id ? 'ring-2 ring-srt-navy' : ''}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-medium text-srt-navy">{inv.id}</span>
                <span className={`status-badge ${STATUS_MAP[inv.status]?.color}`}>{STATUS_MAP[inv.status]?.label}</span>
              </div>
              <div className="text-sm font-medium text-gray-800 mb-1">{inv.assetName}</div>
              <div className="flex gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Calendar size={11} /> {inv.publishDate}</span>
                <span className="flex items-center gap-1"><Users size={11} /> {inv.bidders} ราย</span>
              </div>
              <div className="text-xs text-green-700 font-medium mt-1">ราคาขั้นต่ำ: ฿{inv.minimumBid.toLocaleString()}/เดือน</div>
            </button>
          ))}
        </div>

        {/* Detail */}
        {selected && (
          <div className="lg:col-span-2 card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-srt-navy-dark">{selected.assetName}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-medium text-srt-navy">{selected.id}</span>
                  <span className={`status-badge ${STATUS_MAP[selected.status]?.color}`}>{STATUS_MAP[selected.status]?.label}</span>
                </div>
              </div>
              <Megaphone size={24} className="text-srt-navy opacity-30" />
            </div>

            {/* Timeline */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: 'วันประกาศ', value: selected.publishDate },
                { label: 'วันปิดรับ', value: selected.closeDate },
                { label: 'ราคาขั้นต่ำ', value: `฿${selected.minimumBid.toLocaleString()}` },
              ].map(item => (
                <div key={item.label} className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500">{item.label}</div>
                  <div className="text-sm font-bold text-srt-navy mt-0.5">{item.value}</div>
                </div>
              ))}
            </div>

            {/* Bidders comparison */}
            {selected.bidders > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Users size={14} /> ผู้เสนอราคา & เปรียบเทียบ
                </h4>
                <div className="space-y-2">
                  {MOCK_BIDDERS.map(b => (
                    <div key={b.id} className={`flex items-center gap-3 p-3 rounded-lg border ${b.status === 'Winner' ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${b.status === 'Winner' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                        {b.status === 'Winner' ? <Trophy size={14} /> : b.id}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-800">{b.name}</div>
                        <div className="flex gap-4 text-xs text-gray-500 mt-0.5">
                          <span>เสนอ: ฿{b.bid.toLocaleString()}/เดือน</span>
                          <span>คะแนน: {b.score}/100</span>
                        </div>
                      </div>
                      <span className={`status-badge ${b.status === 'Winner' ? 'bg-green-100 text-green-700' : b.status === 'Runner-up' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                        {b.status === 'Winner' ? 'ผู้ชนะ' : b.status === 'Runner-up' ? 'อันดับ 2' : 'ไม่ผ่าน'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selected.status === 'Evaluation' && (
              <button className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
                <Trophy size={14} /> ประกาศผู้ชนะ
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
