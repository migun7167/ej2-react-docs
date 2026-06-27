import { useState } from 'react';
import { CheckCircle, XCircle, MapPin, Camera, ChevronDown, ChevronUp, Smartphone } from 'lucide-react';
import { mockInspections } from '../data/mockData';

const STATUS_LABEL = { COMPLETED:'เสร็จสิ้น', PENDING:'รอดำเนินการ', IN_PROGRESS:'กำลังดำเนินการ' };
const STATUS_COLOR = { COMPLETED:'bg-green-100 text-green-700', PENDING:'bg-amber-100 text-amber-700', IN_PROGRESS:'bg-blue-100 text-blue-700' };

const CHECKLIST_ITEMS = [
  'ระบบไฟฟ้าครบถ้วน','ระบบประปาปกติ','ไม่มีรอยรั่วซึม',
  'ประตู-หน้าต่างสมบูรณ์','พื้นที่ตรงตามแบบแปลน',
  'ระบบดับเพลิง','ทางหนีไฟปลอดโปร่ง','ความสะอาดโดยรวม',
];

export default function AreaInspection() {
  const [tab, setTab] = useState(0);
  const [expanded, setExpanded] = useState(null);
  const [inspections, setInspections] = useState(mockInspections);
  const [mobileForm, setMobileForm] = useState({
    requestId: '', gps: '', photos: 0, notes: '', result: null,
    checklist: CHECKLIST_ITEMS.map(item => ({ item, checked: false })),
  });
  const [mobileSubmitted, setMobileSubmitted] = useState(false);

  const toggleCheck = (inspId, itemIdx) => {
    setInspections(prev => prev.map(ins => {
      if (ins.id !== inspId) return ins;
      const cl = [...ins.checklist];
      cl[itemIdx] = { ...cl[itemIdx], checked: !cl[itemIdx].checked };
      return { ...ins, checklist: cl };
    }));
  };

  const toggleMobileCheck = (idx) => {
    setMobileForm(f => {
      const cl = [...f.checklist];
      cl[idx] = { ...cl[idx], checked: !cl[idx].checked };
      return { ...f, checklist: cl };
    });
  };

  const done  = inspections.filter(i => i.status === 'COMPLETED').length;
  const pend  = inspections.filter(i => i.status === 'PENDING').length;

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="card overflow-hidden">
        <div className="flex border-b border-gray-100">
          {['รายการตรวจพื้นที่','Mobile Form ตรวจพื้นที่'].map((t, i) => (
            <button key={t} onClick={() => setTab(i)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2
                ${tab === i ? 'border-srt-navy text-srt-navy bg-white' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
              {i === 1 && <Smartphone size={14} className="inline mr-1" />}{t}
            </button>
          ))}
        </div>

        <div className="p-5">
          {tab === 0 && (
            <div className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label:'ทั้งหมด',      value:inspections.length, color:'text-srt-navy', bg:'bg-blue-50' },
                  { label:'รอดำเนินการ',  value:pend,               color:'text-amber-600', bg:'bg-amber-50' },
                  { label:'เสร็จสิ้น',    value:done,               color:'text-green-600', bg:'bg-green-50' },
                ].map(s => (
                  <div key={s.label} className={`rounded-xl p-4 ${s.bg}`}>
                    <div className="text-xs text-gray-400">{s.label}</div>
                    <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Inspection cards */}
              {inspections.map(ins => (
                <div key={ins.id} className="card border border-gray-100">
                  <div
                    className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpanded(expanded === ins.id ? null : ins.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-srt-navy font-mono">{ins.requestId}</span>
                        <span className={`badge ${STATUS_COLOR[ins.status]}`}>{STATUS_LABEL[ins.status]}</span>
                        {ins.result === 'PASSED' && <span className="badge bg-green-100 text-green-700">✓ ผ่าน</span>}
                        {ins.result === 'FAILED' && <span className="badge bg-red-100 text-red-700">✗ ไม่ผ่าน</span>}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">{ins.assetName}</div>
                      <div className="text-xs text-gray-400">{ins.officerName} · วันที่: {ins.scheduledDate}</div>
                    </div>
                    {expanded === ins.id ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                  </div>

                  {expanded === ins.id && (
                    <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><MapPin size={12} />{ins.gpsLat}, {ins.gpsLng}</span>
                        <span className="flex items-center gap-1"><Camera size={12} />{ins.photos} รูปถ่าย</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {ins.checklist.map((item, idx) => (
                          <label key={idx} className={`flex items-center gap-2 p-2.5 rounded-xl cursor-pointer transition-colors
                            ${item.checked ? 'bg-green-50 border border-green-100' : 'bg-gray-50 border border-gray-100'}`}>
                            <input
                              type="checkbox"
                              className="accent-green-500"
                              checked={item.checked}
                              onChange={() => toggleCheck(ins.id, idx)}
                            />
                            <span className="text-xs text-gray-700">{item.item}</span>
                          </label>
                        ))}
                      </div>

                      <div>
                        <label className="lbl">บันทึกหมายเหตุ</label>
                        <textarea className="inp" rows={2} defaultValue={ins.notes} placeholder="ระบุข้อสังเกต ปัญหาที่พบ..." />
                      </div>

                      {ins.status !== 'COMPLETED' && (
                        <div className="flex gap-3">
                          <button className="btn-green">✓ บันทึก ผ่าน</button>
                          <button className="btn-red">✗ บันทึก ไม่ผ่าน</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Mobile Form */}
          {tab === 1 && (
            <div className="flex justify-center">
              {mobileSubmitted ? (
                <div className="text-center py-8">
                  <CheckCircle size={48} className="text-green-500 mx-auto mb-3" />
                  <h3 className="font-bold text-srt-navy text-lg">บันทึกการตรวจสำเร็จ!</h3>
                  <p className="text-sm text-gray-500 mt-1">ข้อมูลถูกส่งเรียบร้อยแล้ว</p>
                  <button className="btn-navy mt-4" onClick={() => setMobileSubmitted(false)}>ตรวจรายการถัดไป</button>
                </div>
              ) : (
                <div className="w-80 bg-gray-900 rounded-3xl p-3 shadow-2xl">
                  <div className="bg-white rounded-2xl overflow-hidden h-[600px] overflow-y-auto">
                    <div className="bg-srt-navy text-white text-center py-3 text-sm font-bold">
                      📋 แบบฟอร์มตรวจพื้นที่
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <label className="lbl">เลขคำขอ</label>
                        <input className="inp text-xs" placeholder="LR-2567-XXXX" value={mobileForm.requestId} onChange={e => setMobileForm(f => ({ ...f, requestId: e.target.value }))} />
                      </div>
                      <div>
                        <label className="lbl">ตำแหน่ง GPS</label>
                        <button className="w-full border border-dashed border-srt-navy rounded-xl py-2 text-sm text-srt-navy font-medium hover:bg-srt-navy/5"
                          onClick={() => setMobileForm(f => ({ ...f, gps: '13.7399, 100.5143' }))}>
                          <MapPin size={14} className="inline mr-1" />
                          {mobileForm.gps || 'กดเพื่อบันทึก GPS'}
                        </button>
                      </div>
                      <div>
                        <label className="lbl">ถ่ายรูปทรัพย์สิน</label>
                        <button className="w-full border border-dashed border-gray-300 rounded-xl py-2 text-sm text-gray-500 hover:bg-gray-50"
                          onClick={() => setMobileForm(f => ({ ...f, photos: f.photos + 1 }))}>
                          <Camera size={14} className="inline mr-1" />
                          {mobileForm.photos > 0 ? `${mobileForm.photos} รูป` : 'ถ่ายรูป'}
                        </button>
                      </div>
                      <div>
                        <label className="lbl">รายการตรวจสอบ</label>
                        <div className="space-y-1">
                          {mobileForm.checklist.map((item, i) => (
                            <label key={i} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-xs
                              ${item.checked ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600'}`}>
                              <input type="checkbox" className="accent-green-500" checked={item.checked} onChange={() => toggleMobileCheck(i)} />
                              {item.item}
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="lbl">หมายเหตุ</label>
                        <textarea className="inp text-xs" rows={2} value={mobileForm.notes} onChange={e => setMobileForm(f => ({ ...f, notes: e.target.value }))} placeholder="บันทึกข้อสังเกต..." />
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 btn-green text-xs py-2" onClick={() => { setMobileForm(f => ({ ...f, result: 'PASSED' })); setMobileSubmitted(true); }}>✓ ผ่าน</button>
                        <button className="flex-1 btn-red text-xs py-2" onClick={() => { setMobileForm(f => ({ ...f, result: 'FAILED' })); setMobileSubmitted(true); }}>✗ ไม่ผ่าน</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
