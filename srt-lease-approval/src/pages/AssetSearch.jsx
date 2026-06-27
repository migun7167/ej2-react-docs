import { useState } from 'react';
import { mockAssets } from '../data/mockData';
import { Search, MapPin, Filter, CheckCircle, Clock, XCircle, Wrench, Eye } from 'lucide-react';

const STATUS_MAP = {
  Available: { label: 'ว่าง', color: 'bg-green-100 text-green-700', icon: CheckCircle, iconColor: 'text-green-600' },
  Reserved: { label: 'จองแล้ว', color: 'bg-amber-100 text-amber-700', icon: Clock, iconColor: 'text-amber-600' },
  Contracted: { label: 'มีสัญญา', color: 'bg-blue-100 text-blue-700', icon: CheckCircle, iconColor: 'text-blue-600' },
  Maintenance: { label: 'ซ่อมบำรุง', color: 'bg-red-100 text-red-700', icon: Wrench, iconColor: 'text-red-600' },
};

export default function AssetSearch({ navigate }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

  const filtered = mockAssets.filter(a => {
    const q = search.toLowerCase();
    return (
      (!q || a.name.toLowerCase().includes(q) || a.location.toLowerCase().includes(q)) &&
      (!statusFilter || a.status === statusFilter) &&
      (!typeFilter || a.type === typeFilter)
    );
  });

  const assetTypes = [...new Set(mockAssets.map(a => a.type))];

  const statsBar = Object.entries(STATUS_MAP).map(([k, v]) => ({
    key: k, label: v.label, color: v.color,
    count: mockAssets.filter(a => a.status === k).length,
  }));

  return (
    <div className="space-y-4">
      {/* Status summary */}
      <div className="grid grid-cols-4 gap-4">
        {statsBar.map(s => (
          <button
            key={s.key}
            onClick={() => setStatusFilter(statusFilter === s.key ? '' : s.key)}
            className={`card p-4 flex items-center gap-3 transition-all cursor-pointer ${statusFilter === s.key ? 'ring-2 ring-srt-navy' : 'hover:shadow-md'}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${s.color}`}>
              <span className="text-lg font-bold">{s.count}</span>
            </div>
            <div>
              <div className="text-base font-bold text-gray-800">{s.count}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="card p-4">
        <div className="flex gap-3 flex-wrap items-center">
          <div className="flex-1 min-w-48 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="ค้นหาทรัพย์สินหรือสถานที่..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="form-input pl-9"
            />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="form-select w-40">
            <option value="">ทุกประเภท</option>
            {assetTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="form-select w-36">
            <option value="">ทุกสถานะ</option>
            {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button onClick={() => setViewMode('grid')} className={`px-3 py-2 text-xs ${viewMode === 'grid' ? 'bg-srt-navy text-white' : 'text-gray-500 hover:bg-gray-50'}`}>Grid</button>
            <button onClick={() => setViewMode('table')} className={`px-3 py-2 text-xs ${viewMode === 'table' ? 'bg-srt-navy text-white' : 'text-gray-500 hover:bg-gray-50'}`}>Table</button>
          </div>
        </div>
      </div>

      {/* Map placeholder */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <MapPin size={16} className="text-srt-red" />
          <span className="text-sm font-medium text-gray-700">แผนที่ทรัพย์สิน (GIS View)</span>
          <span className="text-xs text-gray-400 ml-auto">* แสดงเป็น Demo Placeholder</span>
        </div>
        <div className="h-48 bg-gradient-to-br from-slate-100 to-blue-50 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="grid grid-cols-10 grid-rows-6 h-full w-full">
              {Array.from({ length: 60 }).map((_, i) => <div key={i} className="border border-gray-400"></div>)}
            </div>
          </div>
          <div className="text-center z-10">
            <MapPin size={32} className="text-srt-navy mx-auto mb-2 opacity-40" />
            <p className="text-sm text-gray-500">GIS Map Integration</p>
            <p className="text-xs text-gray-400">เชื่อมต่อกับ GIS System ของการรถไฟ</p>
          </div>
          {filtered.slice(0, 4).map((asset, i) => (
            <div
              key={asset.id}
              className={`absolute w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer ${STATUS_MAP[asset.status]?.color || 'bg-gray-500'} border-2 border-white shadow`}
              style={{ left: `${20 + i * 18}%`, top: `${30 + (i % 2) * 25}%` }}
              title={asset.name}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Asset list */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(asset => {
            const st = STATUS_MAP[asset.status];
            const Icon = st?.icon || CheckCircle;
            return (
              <div
                key={asset.id}
                onClick={() => setSelected(selected?.id === asset.id ? null : asset)}
                className={`card p-4 cursor-pointer transition-all hover:shadow-md ${selected?.id === asset.id ? 'ring-2 ring-srt-navy' : ''}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-mono text-gray-400">{asset.id}</span>
                  <span className={`status-badge ${st?.color}`}>
                    <Icon size={11} className={`mr-1 ${st?.iconColor}`} />
                    {st?.label}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-gray-800 mb-1">{asset.name}</h3>
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                  <MapPin size={11} className="text-srt-red" />
                  {asset.location}
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-sm font-bold text-srt-navy">{asset.area}</div>
                    <div className="text-xs text-gray-400">ตร.ม.</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-sm font-bold text-srt-navy">{asset.floor}</div>
                    <div className="text-xs text-gray-400">ชั้น</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-sm font-bold text-green-700">฿{asset.monthlyRate}</div>
                    <div className="text-xs text-gray-400">/ตร.ม.</div>
                  </div>
                </div>
                {asset.status === 'Available' && (
                  <button
                    onClick={e => { e.stopPropagation(); navigate('new_request'); }}
                    className="w-full mt-3 btn-primary text-center"
                  >
                    ยื่นคำขอเช่า
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['รหัส', 'ชื่อทรัพย์สิน', 'ประเภท', 'สถานที่', 'พื้นที่', 'ราคา/ตร.ม.', 'สถานะ', ''].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(asset => {
                const st = STATUS_MAP[asset.status];
                return (
                  <tr key={asset.id} className="table-row-hover">
                    <td className="px-4 py-3 text-xs font-mono text-gray-400">{asset.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{asset.name}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{asset.type}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{asset.location}</td>
                    <td className="px-4 py-3 text-sm font-medium">{asset.area} ตร.ม.</td>
                    <td className="px-4 py-3 text-sm text-green-700 font-medium">฿{asset.monthlyRate}</td>
                    <td className="px-4 py-3"><span className={`status-badge ${st?.color}`}>{st?.label}</span></td>
                    <td className="px-4 py-3">
                      {asset.status === 'Available' && (
                        <button onClick={() => navigate('new_request')} className="text-xs text-srt-navy hover:underline">ยื่นคำขอ</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
