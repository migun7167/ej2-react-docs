import { useState } from 'react';
import { Search, Grid, List, X, MapPin } from 'lucide-react';
import { mockAssets } from '../data/mockData';

const STATUS_COLOR = {
  Available:   { badge: 'bg-green-100 text-green-700',  dot: 'bg-green-500'  },
  Reserved:    { badge: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-500'  },
  Contracted:  { badge: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500'   },
  Maintenance: { badge: 'bg-gray-100 text-gray-600',   dot: 'bg-gray-400'   },
};
const STATUS_LABEL = { Available:'ว่าง', Reserved:'จองแล้ว', Contracted:'มีสัญญา', Maintenance:'ซ่อมบำรุง' };

const TYPES   = ['ทุกประเภท','ร้านค้า','ร้านอาหาร','สำนักงาน','แผงค้า','พื้นที่เปิดโล่ง','พื้นที่โฆษณา'];
const STATUSES = ['ทุกสถานะ','Available','Reserved','Contracted','Maintenance'];
const LOCS    = ['ทุกสถานี','สถานีกรุงเทพ','สถานีหัวลำโพง','สถานีมักกะสัน','สถานีพญาไท','สถานีดอนเมือง','สถานีบางซื่อ'];

const DOT_POSITIONS = [
  { x: 25, y: 60, id: 'AST-001' }, { x: 45, y: 40, id: 'AST-002' },
  { x: 60, y: 55, id: 'AST-003' }, { x: 70, y: 30, id: 'AST-004' },
  { x: 30, y: 75, id: 'AST-005' }, { x: 25, y: 62, id: 'AST-006' },
  { x: 80, y: 20, id: 'AST-007' }, { x: 70, y: 32, id: 'AST-008' },
];

export default function AssetAvailability({ navigate }) {
  const [search, setSearch]   = useState('');
  const [typeF, setType]      = useState('ทุกประเภท');
  const [locF, setLoc]        = useState('ทุกสถานี');
  const [statusF, setStatus]  = useState('ทุกสถานะ');
  const [view, setView]       = useState('grid');
  const [selected, setSelected] = useState(null);

  const filtered = mockAssets.filter(a => {
    const q = search.toLowerCase();
    const mq = !q || a.name.toLowerCase().includes(q) || a.location.toLowerCase().includes(q);
    const mt = typeF === 'ทุกประเภท' || a.type === typeF;
    const ml = locF === 'ทุกสถานี' || a.location === locF;
    const ms = statusF === 'ทุกสถานะ' || a.status === statusF;
    return mq && mt && ml && ms;
  });

  const counts = {
    Available:   mockAssets.filter(a => a.status === 'Available').length,
    Reserved:    mockAssets.filter(a => a.status === 'Reserved').length,
    Contracted:  mockAssets.filter(a => a.status === 'Contracted').length,
    Maintenance: mockAssets.filter(a => a.status === 'Maintenance').length,
  };

  return (
    <div className="space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(counts).map(([k, v]) => (
          <div
            key={k}
            className={`card-p cursor-pointer transition-all ${statusF === k ? 'ring-2 ring-srt-navy' : ''}`}
            onClick={() => setStatus(statusF === k ? 'ทุกสถานะ' : k)}
          >
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${STATUS_COLOR[k].dot}`} />
              <div className="flex-1">
                <div className="text-xs text-gray-400">{STATUS_LABEL[k]}</div>
                <div className="text-2xl font-extrabold text-srt-navy">{v}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* GIS Map Placeholder */}
      <div className="card-p">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-srt-navy flex items-center gap-2"><MapPin size={16} />แผนที่ทรัพย์สิน (ตัวอย่าง)</h3>
        </div>
        <div className="relative w-full h-48 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl overflow-hidden border border-blue-100">
          {/* Grid lines */}
          {[...Array(8)].map((_, i) => (
            <div key={`h${i}`} className="absolute w-full border-t border-blue-100/60" style={{ top: `${(i + 1) * 12.5}%` }} />
          ))}
          {[...Array(10)].map((_, i) => (
            <div key={`v${i}`} className="absolute h-full border-l border-blue-100/60" style={{ left: `${(i + 1) * 10}%` }} />
          ))}
          <div className="absolute top-2 left-3 text-[10px] text-blue-400 font-bold">แผนที่สถานะทรัพย์สิน SRT</div>
          {DOT_POSITIONS.map(pos => {
            const asset = mockAssets.find(a => a.id === pos.id);
            if (!asset) return null;
            const sc = STATUS_COLOR[asset.status];
            return (
              <button
                key={pos.id}
                className={`absolute w-5 h-5 rounded-full border-2 border-white shadow-md cursor-pointer hover:scale-125 transition-transform ${sc.dot}`}
                style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%,-50%)' }}
                title={asset.name}
                onClick={() => setSelected(asset)}
              />
            );
          })}
          <div className="absolute bottom-2 right-2 flex gap-2">
            {Object.entries(STATUS_LABEL).map(([k, v]) => (
              <div key={k} className="flex items-center gap-1 bg-white/80 rounded px-1.5 py-0.5">
                <span className={`w-2 h-2 rounded-full ${STATUS_COLOR[k].dot}`} />
                <span className="text-[9px] text-gray-600">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters + View Toggle */}
      <div className="card-p flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-40 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="inp pl-8" placeholder="ค้นหาทรัพย์สิน..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="sel w-36" value={typeF} onChange={e => setType(e.target.value)}>{TYPES.map(t => <option key={t}>{t}</option>)}</select>
        <select className="sel w-40" value={locF} onChange={e => setLoc(e.target.value)}>{LOCS.map(l => <option key={l}>{l}</option>)}</select>
        <select className="sel w-36" value={statusF} onChange={e => setStatus(e.target.value)}>
          {STATUSES.map(s => <option key={s}>{s === 'ทุกสถานะ' ? s : STATUS_LABEL[s] || s}</option>)}
        </select>
        <div className="flex border border-gray-200 rounded-xl overflow-hidden">
          <button onClick={() => setView('grid')} className={`p-2 ${view === 'grid' ? 'bg-srt-navy text-white' : 'hover:bg-gray-50 text-gray-400'}`}><Grid size={16} /></button>
          <button onClick={() => setView('list')} className={`p-2 ${view === 'list' ? 'bg-srt-navy text-white' : 'hover:bg-gray-50 text-gray-400'}`}><List size={16} /></button>
        </div>
      </div>

      {/* Asset Grid */}
      {view === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(asset => {
            const sc = STATUS_COLOR[asset.status];
            return (
              <div key={asset.id} className="card hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelected(asset)}>
                <div className="h-24 bg-gradient-to-br from-srt-navy/10 to-srt-navy/5 rounded-t-2xl flex items-center justify-center">
                  <span className="text-4xl opacity-60">
                    {asset.type === 'ร้านค้า' ? '🏪' : asset.type === 'ร้านอาหาร' ? '🍽️' : asset.type === 'สำนักงาน' ? '🏢' : asset.type === 'แผงค้า' ? '🛒' : '📍'}
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-sm font-bold text-gray-800 leading-tight">{asset.name}</h4>
                    <span className={`badge ${sc.badge} flex-shrink-0`}>{STATUS_LABEL[asset.status]}</span>
                  </div>
                  <div className="text-xs text-gray-400 flex items-center gap-1 mb-2"><MapPin size={10} />{asset.location}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <span className="badge bg-gray-100 text-gray-500">{asset.type}</span>
                    <span>{asset.area} ตร.ม.</span>
                    <span>ชั้น {asset.floor}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-gray-400">อัตราค่าเช่า</div>
                      <div className="text-sm font-bold text-srt-navy">฿{asset.monthlyRate}/ตร.ม.</div>
                    </div>
                    {asset.status === 'Available' && (
                      <button className="btn-navy btn-sm" onClick={e => { e.stopPropagation(); navigate('new_request'); }}>
                        ยื่นคำขอ
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">ไม่พบทรัพย์สินตามเงื่อนไข</div>
          )}
        </div>
      )}

      {/* Asset Table */}
      {view === 'list' && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-gray-100 bg-gray-50/50">
              <tr>
                <th className="th">ทรัพย์สิน</th>
                <th className="th">ประเภท</th>
                <th className="th">สถานที่</th>
                <th className="th">พื้นที่</th>
                <th className="th">ชั้น</th>
                <th className="th">อัตราค่าเช่า</th>
                <th className="th">สถานะ</th>
                <th className="th">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(asset => {
                const sc = STATUS_COLOR[asset.status];
                return (
                  <tr key={asset.id} className="tr-h" onClick={() => setSelected(asset)}>
                    <td className="td font-medium text-gray-800">{asset.name}</td>
                    <td className="td"><span className="badge bg-gray-100 text-gray-600">{asset.type}</span></td>
                    <td className="td text-sm text-gray-500">{asset.location}</td>
                    <td className="td text-sm">{asset.area} ตร.ม.</td>
                    <td className="td text-sm">{asset.floor}</td>
                    <td className="td text-sm font-semibold text-srt-navy">฿{asset.monthlyRate}/ตร.ม.</td>
                    <td className="td"><span className={`badge ${sc.badge}`}>{STATUS_LABEL[asset.status]}</span></td>
                    <td className="td">
                      {asset.status === 'Available' && (
                        <button className="btn-navy btn-sm" onClick={e => { e.stopPropagation(); navigate('new_request'); }}>ยื่นคำขอ</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-bold text-srt-navy text-lg">{selected.name}</h3>
              <button className="btn-ghost p-1" onClick={() => setSelected(null)}><X size={20} /></button>
            </div>
            <div className="space-y-2 text-sm mb-5">
              <div className="flex gap-2"><span className="text-gray-400 w-28">รหัส</span><span>{selected.id}</span></div>
              <div className="flex gap-2"><span className="text-gray-400 w-28">ประเภท</span><span>{selected.type}</span></div>
              <div className="flex gap-2"><span className="text-gray-400 w-28">สถานที่</span><span>{selected.location}</span></div>
              <div className="flex gap-2"><span className="text-gray-400 w-28">พื้นที่</span><span>{selected.area} ตร.ม.</span></div>
              <div className="flex gap-2"><span className="text-gray-400 w-28">ชั้น</span><span>{selected.floor}</span></div>
              <div className="flex gap-2"><span className="text-gray-400 w-28">อัตราค่าเช่า</span><span className="font-bold text-srt-navy">฿{selected.monthlyRate}/ตร.ม./เดือน</span></div>
              <div className="flex gap-2"><span className="text-gray-400 w-28">สถานะ</span><span className={`badge ${STATUS_COLOR[selected.status].badge}`}>{STATUS_LABEL[selected.status]}</span></div>
              <div className="flex gap-2"><span className="text-gray-400 w-28">คำอธิบาย</span><span className="text-gray-600 flex-1 leading-relaxed">{selected.description}</span></div>
            </div>
            <div className="flex gap-3">
              <button className="btn-ghost flex-1" onClick={() => setSelected(null)}>ปิด</button>
              {selected.status === 'Available' && (
                <button className="btn-navy flex-1" onClick={() => { setSelected(null); navigate('new_request'); }}>
                  ยื่นคำขอเช่าทรัพย์สินนี้
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
