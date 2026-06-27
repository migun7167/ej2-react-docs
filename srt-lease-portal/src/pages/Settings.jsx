import { useState } from 'react';
import { Save, Edit, X, Plus, Settings as SettingsIcon } from 'lucide-react';
import { STATUS_FLOW } from '../data/mockData';

const INITIAL_SLA = STATUS_FLOW.slice(1).map((s, i) => ({
  id: s.id, label: s.label, hours: [120, 72, 48, 168, 168, 240, 240, 240, 48, 72, 120, 240, 24, 24, 48][i] || 72,
}));

const INITIAL_TEMPLATES = [
  { id: 1, name: 'ยืนยันการรับคำขอ',     type: 'EMAIL', channel: 'Email', active: true },
  { id: 2, name: 'เตือนเอกสารไม่ครบ',   type: 'SMS',   channel: 'SMS',   active: true },
  { id: 3, name: 'แจ้งผลการอนุมัติ',     type: 'LINE',  channel: 'LINE',  active: true },
  { id: 4, name: 'เตือนกำหนดชำระมัดจำ', type: 'EMAIL', channel: 'Email', active: true },
  { id: 5, name: 'แจ้งส่งต่อสัญญา',     type: 'EMAIL', channel: 'Email', active: false },
];

const INITIAL_USERS = [
  { id: 'U001', name: 'นายสมชาย รักไทย',      role: 'เจ้าหน้าที่สถานี',    dept: 'สถานีกรุงเทพ',  status: 'active' },
  { id: 'U002', name: 'นางสาวพิมพ์ ใจดี',     role: 'เจ้าหน้าที่ทรัพย์สิน', dept: 'ฝ่ายทรัพย์สิน', status: 'active' },
  { id: 'U003', name: 'นายประสิทธิ์ ดำรง',    role: 'เจ้าหน้าที่สถานี',    dept: 'สถานีมักกะสัน', status: 'active' },
  { id: 'U004', name: 'นางมาลี วิชิต',        role: 'เจ้าหน้าที่ประเมินราคา', dept: 'ฝ่ายทรัพย์สิน', status: 'active' },
  { id: 'U005', name: 'นายสมบัติ ใจดี',       role: 'ผู้อนุมัติ',          dept: 'สถานีกรุงเทพ',  status: 'active' },
  { id: 'U006', name: 'นางสาวจิรา มั่นคง',    role: 'ผู้อนุมัติ',          dept: 'เขตกรุงเทพ',   status: 'active' },
  { id: 'U007', name: 'นายวรวุฒิ ชัยพร',      role: 'ผู้บริหาร',           dept: 'ฝ่ายทรัพย์สิน', status: 'active' },
  { id: 'ADMIN', name: 'Administrator',       role: 'Admin',              dept: 'IT',            status: 'active' },
];

const MASTER_ASSET_TYPES = ['ร้านค้า','ร้านอาหาร','สำนักงาน','แผงค้า','พื้นที่เปิดโล่ง','พื้นที่โฆษณา','ห้างสรรพสินค้า'];
const MASTER_PURPOSES    = ['ร้านค้าทั่วไป','ร้านอาหาร/เครื่องดื่ม','ร้านกาแฟ','สำนักงาน','ธนาคาร/ATM','ร้านสะดวกซื้อ','ร้านเสริมสวย','ร้านยา','โฆษณา','อื่นๆ'];
const MASTER_LOCS        = ['สถานีกรุงเทพ','สถานีหัวลำโพง','สถานีมักกะสัน','สถานีพญาไท','สถานีดอนเมือง','สถานีบางซื่อ','สถานีรังสิต'];

export default function Settings() {
  const [tab, setTab] = useState(0);
  const [slaList, setSlaList]   = useState(INITIAL_SLA);
  const [editSlaId, setEditSlaId] = useState(null);
  const [editHours, setEditHours] = useState(0);
  const [templates] = useState(INITIAL_TEMPLATES);
  const [users]     = useState(INITIAL_USERS);
  const [savedSla, setSavedSla] = useState(false);

  const startSlaEdit = (item) => { setEditSlaId(item.id); setEditHours(item.hours); };
  const saveSlaEdit  = () => {
    setSlaList(prev => prev.map(s => s.id === editSlaId ? { ...s, hours: Number(editHours) } : s));
    setEditSlaId(null);
    setSavedSla(true);
    setTimeout(() => setSavedSla(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex border-b border-gray-100 bg-white rounded-t-2xl overflow-hidden px-2">
        {['SLA Config','Notification Templates','User Management','Master Data'].map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap
              ${tab === i ? 'border-srt-navy text-srt-navy' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* SLA Config */}
      {tab === 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-srt-navy flex items-center gap-2"><SettingsIcon size={16} />กำหนดเวลา SLA ตามขั้นตอน</h3>
            {savedSla && <span className="badge bg-green-100 text-green-700"><Save size={12} />บันทึกแล้ว</span>}
          </div>
          <table className="w-full">
            <thead className="border-b border-gray-100 bg-gray-50/50">
              <tr>
                <th className="th">ขั้นตอน</th>
                <th className="th text-center">SLA (ชั่วโมง)</th>
                <th className="th text-center">SLA (วัน)</th>
                <th className="th text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {slaList.map(item => (
                <tr key={item.id} className="border-b border-gray-50">
                  <td className="td font-medium text-gray-700">{item.label}</td>
                  <td className="td text-center">
                    {editSlaId === item.id ? (
                      <input
                        type="number"
                        className="inp w-24 text-center mx-auto"
                        value={editHours}
                        onChange={e => setEditHours(e.target.value)}
                        autoFocus
                      />
                    ) : (
                      <span className="font-bold text-srt-navy">{item.hours}</span>
                    )}
                  </td>
                  <td className="td text-center text-gray-500 text-sm">{(item.hours / 8).toFixed(1)} วัน</td>
                  <td className="td text-center">
                    {editSlaId === item.id ? (
                      <div className="flex gap-1 justify-center">
                        <button className="btn-green btn-sm" onClick={saveSlaEdit}><Save size={12} />บันทึก</button>
                        <button className="btn-ghost btn-sm" onClick={() => setEditSlaId(null)}><X size={12} /></button>
                      </div>
                    ) : (
                      <button className="btn-white btn-sm" onClick={() => startSlaEdit(item)}><Edit size={12} />แก้ไข</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Notification Templates */}
      {tab === 1 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-srt-navy">Notification Templates</h3>
            <button className="btn-navy btn-sm"><Plus size={14} />เพิ่ม Template</button>
          </div>
          <div className="divide-y divide-gray-100">
            {templates.map(t => (
              <div key={t.id} className="flex items-center gap-4 px-5 py-4">
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-800">{t.name}</div>
                  <div className="flex gap-2 mt-1">
                    <span className={`badge text-[10px] ${t.channel === 'Email' ? 'bg-blue-100 text-blue-700' : t.channel === 'SMS' ? 'bg-green-100 text-green-700' : 'bg-teal-100 text-teal-700'}`}>
                      {t.channel}
                    </span>
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className={`w-10 h-5 rounded-full transition-colors ${t.active ? 'bg-srt-navy' : 'bg-gray-300'} relative`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${t.active ? 'left-5' : 'left-0.5'}`} />
                  </div>
                  <span className="text-xs text-gray-500">{t.active ? 'เปิด' : 'ปิด'}</span>
                </label>
                <button className="btn-white btn-sm"><Edit size={12} />แก้ไข</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Management */}
      {tab === 2 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-srt-navy">จัดการผู้ใช้งาน</h3>
            <button className="btn-navy btn-sm"><Plus size={14} />เพิ่มผู้ใช้</button>
          </div>
          <table className="w-full">
            <thead className="border-b border-gray-100 bg-gray-50/50">
              <tr>
                <th className="th">รหัส</th>
                <th className="th">ชื่อ</th>
                <th className="th">บทบาท</th>
                <th className="th">ฝ่าย/หน่วยงาน</th>
                <th className="th text-center">สถานะ</th>
                <th className="th text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-gray-50 tr-h">
                  <td className="td font-mono text-xs text-srt-navy">{u.id}</td>
                  <td className="td font-medium text-gray-700">{u.name}</td>
                  <td className="td"><span className="badge bg-srt-navy/10 text-srt-navy">{u.role}</span></td>
                  <td className="td text-sm text-gray-500">{u.dept}</td>
                  <td className="td text-center"><span className="badge bg-green-100 text-green-700">ใช้งาน</span></td>
                  <td className="td text-center">
                    <div className="flex gap-1 justify-center">
                      <button className="btn-white btn-sm"><Edit size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Master Data */}
      {tab === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {[
            { title: 'ประเภททรัพย์สิน', items: MASTER_ASSET_TYPES },
            { title: 'วัตถุประสงค์การเช่า', items: MASTER_PURPOSES },
            { title: 'สถานที่/สถานี', items: MASTER_LOCS },
          ].map(group => (
            <div key={group.title} className="card-p">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-srt-navy text-sm">{group.title}</h4>
                <button className="btn-white btn-sm"><Plus size={12} />เพิ่ม</button>
              </div>
              <div className="space-y-1">
                {group.items.map(item => (
                  <div key={item} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg group">
                    <span className="text-sm text-gray-700">{item}</span>
                    <button className="btn-ghost btn-sm opacity-0 group-hover:opacity-100 p-1"><Edit size={12} /></button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
