import { useState } from 'react';
import { Search, Filter, Download, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { mockRequests } from '../data/mockData';
import StatusBadge from '../components/StatusBadge';
import SLABar from '../components/SLABar';

const ASSET_TYPES = ['ทุกประเภท','ร้านค้า','ร้านอาหาร','สำนักงาน','แผงค้า','พื้นที่เปิดโล่ง','พื้นที่โฆษณา','ห้างสรรพสินค้า','ร้านกาแฟ'];
const LOCATIONS = ['ทุกสถานี','สถานีกรุงเทพ','สถานีหัวลำโพง','สถานีมักกะสัน','สถานีพญาไท','สถานีดอนเมือง','สถานีบางซื่อ'];
const STATUSES = ['ทุกสถานะ','SUBMITTED','DOC_CHECK','DOC_INCOMPLETE','INSPECTION','VALUATION','INVITATION','COMMITTEE','PENDING_L1','PENDING_L2','PENDING_L3','APPROVED','REJECTED','DEPOSIT_PENDING','HANDOFF'];

const STATUS_LABEL = {
  SUBMITTED:'ยื่นคำขอ',DOC_CHECK:'ตรวจเอกสาร',DOC_INCOMPLETE:'เอกสารไม่ครบ',
  INSPECTION:'ตรวจพื้นที่',VALUATION:'ประเมินราคา',INVITATION:'ประกาศเชิญ',
  COMMITTEE:'คณะกรรมการ',PENDING_L1:'รออนุมัติ L1',PENDING_L2:'รออนุมัติ L2',
  PENDING_L3:'รออนุมัติ L3',APPROVED:'อนุมัติ',REJECTED:'ไม่อนุมัติ',
  DEPOSIT_PENDING:'รอมัดจำ',HANDOFF:'ส่งต่อแล้ว',
};

export default function RequestList({ navigate }) {
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatus]     = useState('ทุกสถานะ');
  const [typeFilter, setType]         = useState('ทุกประเภท');
  const [locationFilter, setLocation] = useState('ทุกสถานี');
  const [page, setPage]               = useState(1);
  const perPage = 8;

  const filtered = mockRequests.filter(r => {
    const q = search.toLowerCase();
    const matchQ = !q || r.id.toLowerCase().includes(q) || r.applicantName.toLowerCase().includes(q) || r.assetName.toLowerCase().includes(q);
    const matchS = statusFilter === 'ทุกสถานะ' || r.status === statusFilter;
    const matchT = typeFilter === 'ทุกประเภท' || r.assetType === typeFilter;
    const matchL = locationFilter === 'ทุกสถานี' || r.location === locationFilter;
    return matchQ && matchS && matchT && matchL;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const total   = mockRequests.length;
  const overSLA = mockRequests.filter(r => r.isOverSLA).length;
  const pending = mockRequests.filter(r => ['PENDING_L1','PENDING_L2','PENDING_L3'].includes(r.status)).length;
  const waitDep = mockRequests.filter(r => r.status === 'DEPOSIT_PENDING').length;

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'คำขอทั้งหมด', value: total, color: 'text-srt-navy', bg: 'bg-blue-50' },
          { label: 'เกิน SLA', value: overSLA, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'รออนุมัติ', value: pending, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'รอชำระมัดจำ', value: waitDep, color: 'text-pink-600', bg: 'bg-pink-50' },
        ].map(s => (
          <div key={s.label} className={`card-p flex items-center gap-3 ${s.bg}`}>
            <div className="flex-1">
              <div className="text-xs text-gray-500">{s.label}</div>
              <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card-p">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-48 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="inp pl-9"
              placeholder="ค้นหาเลขคำขอ, ชื่อผู้ขอเช่า, ทรัพย์สิน..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select className="sel w-40" value={statusFilter} onChange={e => { setStatus(e.target.value); setPage(1); }}>
            {STATUSES.map(s => <option key={s}>{s === 'ทุกสถานะ' ? s : STATUS_LABEL[s] || s}</option>)}
          </select>
          <select className="sel w-36" value={typeFilter} onChange={e => { setType(e.target.value); setPage(1); }}>
            {ASSET_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <select className="sel w-44" value={locationFilter} onChange={e => { setLocation(e.target.value); setPage(1); }}>
            {LOCATIONS.map(l => <option key={l}>{l}</option>)}
          </select>
          <button className="btn-white btn-sm flex items-center gap-1.5">
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-100 bg-gray-50/50">
              <tr>
                <th className="th">เลขคำขอ</th>
                <th className="th">ผู้ขอเช่า</th>
                <th className="th">ทรัพย์สิน / สถานที่</th>
                <th className="th">ประเภท</th>
                <th className="th">วัตถุประสงค์</th>
                <th className="th">สถานะ</th>
                <th className="th">SLA</th>
                <th className="th">ค่าเช่า/เดือน</th>
                <th className="th">วันยื่น</th>
                <th className="th">Action</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 && (
                <tr><td colSpan={10} className="td text-center text-gray-400 py-8">ไม่พบข้อมูล</td></tr>
              )}
              {paged.map(r => (
                <tr key={r.id} className="tr-h border-b border-gray-50" onClick={() => navigate('request_detail', r.id)}>
                  <td className="td">
                    <div className="flex items-center gap-1.5">
                      {r.isOverSLA && <AlertTriangle size={12} className="text-red-500 flex-shrink-0" />}
                      <span className="font-mono text-xs font-bold text-srt-navy">{r.id}</span>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{r.priority === 'high' ? '🔴 ด่วน' : r.priority === 'normal' ? '🟡 ปกติ' : '🟢 ต่ำ'}</div>
                  </td>
                  <td className="td">
                    <div className="font-medium text-gray-800 text-xs max-w-[160px] truncate">{r.applicantName}</div>
                    <span className="badge bg-gray-100 text-gray-500 text-[10px] mt-0.5">{r.applicantType}</span>
                  </td>
                  <td className="td">
                    <div className="text-xs font-medium text-gray-700 max-w-[150px] truncate">{r.assetName}</div>
                    <div className="text-[10px] text-gray-400">{r.location}</div>
                  </td>
                  <td className="td">
                    <span className="badge bg-indigo-50 text-indigo-700 text-[10px]">{r.assetType}</span>
                  </td>
                  <td className="td text-xs text-gray-600 max-w-[120px] truncate">{r.purpose}</td>
                  <td className="td"><StatusBadge status={r.status} size="sm" /></td>
                  <td className="td w-32"><SLABar used={r.slaUsed} total={r.slaHours} /></td>
                  <td className="td">
                    <span className="text-xs font-semibold text-emerald-700">฿{r.estimatedRent.toLocaleString()}</span>
                  </td>
                  <td className="td text-xs text-gray-500">{r.submittedDate}</td>
                  <td className="td">
                    <button
                      className="btn-navy btn-sm"
                      onClick={e => { e.stopPropagation(); navigate('request_detail', r.id); }}
                    >
                      ดูรายละเอียด
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            แสดง {Math.min((page - 1) * perPage + 1, filtered.length)}–{Math.min(page * perPage, filtered.length)} จาก {filtered.length} รายการ
          </span>
          <div className="flex items-center gap-1">
            <button
              className="btn-ghost btn-sm p-1.5"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${page === p ? 'bg-srt-navy text-white' : 'btn-ghost'}`}
              >
                {p}
              </button>
            ))}
            <button
              className="btn-ghost btn-sm p-1.5"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
