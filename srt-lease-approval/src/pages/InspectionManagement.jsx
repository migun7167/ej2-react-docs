import { useState } from 'react';
import { mockInspections } from '../data/mockData';
import { Camera, MapPin, CheckCircle, Clock, Calendar, User, ChevronDown, Plus, ClipboardCheck } from 'lucide-react';

const STATUS_MAP = {
  Pending: { label: 'รอดำเนินการ', color: 'bg-amber-100 text-amber-700' },
  Scheduled: { label: 'นัดหมายแล้ว', color: 'bg-blue-100 text-blue-700' },
  Completed: { label: 'เสร็จสิ้น', color: 'bg-green-100 text-green-700' },
  Failed: { label: 'ไม่ผ่าน', color: 'bg-red-100 text-red-700' },
};

const CHECKLIST_ITEMS = [
  'สภาพพื้นที่โดยรวม',
  'ระบบไฟฟ้าและน้ำ',
  'ทางเข้าออกและความปลอดภัย',
  'การบุกรุกพื้นที่',
  'สภาพสิ่งก่อสร้าง',
  'ความเหมาะสมกับวัตถุประสงค์',
];

export default function InspectionManagement({ navigate }) {
  const [activeTab, setActiveTab] = useState('list');
  const [expandedId, setExpandedId] = useState(null);
  const [checklist, setChecklist] = useState({});

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2">
        {[{ key: 'list', label: 'รายการตรวจพื้นที่' }, { key: 'mobile', label: 'Mobile Inspection Form' }].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === t.key ? 'bg-srt-navy text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'list' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'ทั้งหมด', count: mockInspections.length, color: 'text-srt-navy' },
              { label: 'รอดำเนินการ', count: mockInspections.filter(i => i.status === 'Pending').length, color: 'text-amber-600' },
              { label: 'เสร็จสิ้น', count: mockInspections.filter(i => i.status === 'Completed').length, color: 'text-green-600' },
            ].map(s => (
              <div key={s.label} className="card p-4 text-center">
                <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {mockInspections.map(ins => (
              <div key={ins.id} className="card overflow-hidden">
                <button
                  onClick={() => setExpandedId(expandedId === ins.id ? null : ins.id)}
                  className="w-full p-4 flex items-center gap-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${STATUS_MAP[ins.status]?.color}`}>
                    <ClipboardCheck size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-srt-navy">{ins.id}</span>
                      <span className="text-xs text-gray-400">→</span>
                      <span className="text-xs text-gray-500">{ins.requestId}</span>
                    </div>
                    <div className="text-sm font-medium text-gray-800 mt-0.5">{ins.assetName}</div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><User size={11} /> {ins.officer}</span>
                      <span className="flex items-center gap-1"><Calendar size={11} /> {ins.scheduledDate}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`status-badge ${STATUS_MAP[ins.status]?.color}`}>{STATUS_MAP[ins.status]?.label}</span>
                    {ins.photos > 0 && (
                      <span className="flex items-center gap-1 text-xs text-gray-500"><Camera size={12} /> {ins.photos}</span>
                    )}
                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${expandedId === ins.id ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {expandedId === ins.id && (
                  <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div>
                        <h4 className="text-xs font-semibold text-gray-600 mb-2">Checklist ตรวจพื้นที่</h4>
                        <div className="space-y-1.5">
                          {CHECKLIST_ITEMS.map(item => (
                            <label key={item} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={checklist[`${ins.id}_${item}`] ?? (ins.status === 'Completed')}
                                onChange={e => setChecklist(c => ({ ...c, [`${ins.id}_${item}`]: e.target.checked }))}
                                className="rounded text-srt-navy"
                              />
                              <span className="text-sm text-gray-700">{item}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-gray-600 mb-2">ผลการตรวจ</h4>
                        {ins.notes ? (
                          <div className="bg-white rounded-lg p-3 border border-gray-200 text-sm text-gray-700">{ins.notes}</div>
                        ) : (
                          <textarea rows={4} placeholder="บันทึกผลการตรวจพื้นที่..." className="form-input resize-none" />
                        )}
                        {ins.status !== 'Completed' && (
                          <div className="flex gap-2 mt-2">
                            <button className="btn-success flex-1 flex items-center justify-center gap-1"><CheckCircle size={13} /> ผ่าน</button>
                            <button className="btn-danger flex-1 flex items-center justify-center gap-1">ไม่ผ่าน</button>
                          </div>
                        )}
                      </div>
                    </div>
                    {ins.status === 'Completed' && (
                      <div className="mt-3 bg-green-50 rounded-lg p-3 flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-600" />
                        <span className="text-sm text-green-700 font-medium">ผลการตรวจ: {ins.result} — มีรูปภาพ {ins.photos} รูป</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'mobile' && (
        <div className="max-w-sm mx-auto">
          <div className="card overflow-hidden">
            <div className="bg-srt-navy p-4 text-white">
              <div className="text-sm font-semibold">Mobile Inspection Form</div>
              <div className="text-xs text-white/70 mt-0.5">สำหรับเจ้าหน้าที่ภาคสนาม</div>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="form-label">รหัสคำขอ</label>
                <input defaultValue="LR-2566-0003" className="form-input" />
              </div>
              <div>
                <label className="form-label">พิกัด GPS</label>
                <div className="flex gap-2">
                  <input placeholder="Lat: 13.7200" className="form-input" readOnly />
                  <button className="btn-primary whitespace-nowrap flex items-center gap-1">
                    <MapPin size={13} /> ดึงพิกัด
                  </button>
                </div>
              </div>
              <div>
                <label className="form-label">ถ่ายรูปพื้นที่</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-srt-navy transition-colors cursor-pointer">
                  <Camera size={28} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">แตะเพื่อถ่ายรูป</p>
                  <p className="text-xs text-gray-400 mt-1">0/10 รูป</p>
                </div>
              </div>
              <div>
                <label className="form-label">Checklist</label>
                <div className="space-y-2">
                  {CHECKLIST_ITEMS.map(item => (
                    <label key={item} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg cursor-pointer">
                      <input type="checkbox" className="rounded text-srt-navy" />
                      <span className="text-sm text-gray-700">{item}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="form-label">ผลการตรวจ</label>
                <textarea rows={3} placeholder="สรุปผลการตรวจพื้นที่..." className="form-input resize-none" />
              </div>
              <button className="btn-primary w-full">ส่งผลการตรวจ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
