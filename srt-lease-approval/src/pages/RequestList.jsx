import { useState } from 'react';
import { mockRequests, STATUS_CONFIG } from '../data/mockData';
import StatusBadge from '../components/StatusBadge';
import SLABar from '../components/SLABar';
import { Search, Filter, Plus, Eye, AlertTriangle } from 'lucide-react';

const ALL_STATUSES = Object.keys(STATUS_CONFIG);

export default function RequestList({ navigate }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('submittedDate');

  const filtered = mockRequests
    .filter(r => {
      const q = search.toLowerCase();
      return (
        (!q || r.id.toLowerCase().includes(q) || r.applicantName.toLowerCase().includes(q) || r.assetName.toLowerCase().includes(q)) &&
        (!statusFilter || r.status === statusFilter) &&
        (!typeFilter || r.assetType === typeFilter)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'submittedDate') return b.submittedDate.localeCompare(a.submittedDate);
      if (sortBy === 'estimatedRent') return (b.estimatedRent || 0) - (a.estimatedRent || 0);
      return 0;
    });

  const assetTypes = [...new Set(mockRequests.map(r => r.assetType))];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-48 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาด้วยเลขคำขอ ชื่อผู้ขอ หรือทรัพย์สิน..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="form-input pl-9"
            />
          </div>

          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="form-select w-48">
            <option value="">ทุกสถานะ</option>
            {ALL_STATUSES.map(s => (
              <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
            ))}
          </select>

          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="form-select w-40">
            <option value="">ทุกประเภท</option>
            {assetTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="form-select w-40">
            <option value="submittedDate">เรียงตามวันที่</option>
            <option value="estimatedRent">เรียงตามค่าเช่า</option>
          </select>

          <button onClick={() => navigate('new_request')} className="btn-primary flex items-center gap-2 ml-auto">
            <Plus size={15} />
            ยื่นคำขอใหม่
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'คำขอทั้งหมด', count: mockRequests.length, color: 'text-srt-navy' },
          { label: 'เกิน SLA', count: mockRequests.filter(r => r.isOverSLA).length, color: 'text-red-600' },
          { label: 'รออนุมัติ', count: mockRequests.filter(r => r.status === 'Waiting for Approval').length, color: 'text-amber-600' },
          { label: 'รอชำระมัดจำ', count: mockRequests.filter(r => r.status === 'Waiting for Deposit').length, color: 'text-purple-600' },
        ].map(s => (
          <div key={s.label} className="card p-3 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 whitespace-nowrap">เลขคำขอ</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">ผู้ขอเช่า</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">ทรัพย์สิน / สถานที่</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 whitespace-nowrap">ประเภท</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">สถานะ</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">SLA</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 whitespace-nowrap">ค่าเช่า/เดือน</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 whitespace-nowrap">วันที่ยื่น</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(req => (
                <tr key={req.id} className="table-row-hover cursor-pointer" onClick={() => navigate('request_detail', { requestId: req.id })}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {req.isOverSLA && <AlertTriangle size={13} className="text-red-500 flex-shrink-0" />}
                      <span className="text-xs font-mono font-medium text-srt-navy">{req.id}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-800 font-medium">{req.applicantName}</div>
                    <div className="text-xs text-gray-400">{req.applicantType}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-800 max-w-xs truncate">{req.assetName}</div>
                    <div className="text-xs text-gray-400">{req.location} · {req.area} ตร.ม.</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-gray-100 text-gray-600 rounded-md px-2 py-1">{req.assetType}</span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="px-4 py-3 min-w-[120px]">
                    <SLABar slaHours={req.slaHours} slaUsed={req.slaUsed} isOverSLA={req.isOverSLA} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {req.estimatedRent ? (
                      <span className="text-sm font-medium text-green-700">฿{req.estimatedRent.toLocaleString()}</span>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">{req.submittedDate}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={e => { e.stopPropagation(); navigate('request_detail', { requestId: req.id }); }}
                      className="text-srt-navy hover:text-srt-navy-light transition-colors"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-gray-400 text-sm">ไม่พบรายการที่ตรงกัน</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500">แสดง {filtered.length} จาก {mockRequests.length} รายการ</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-xs border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40">ก่อนหน้า</button>
            <button className="px-3 py-1 text-xs bg-srt-navy text-white rounded-lg">1</button>
            <button className="px-3 py-1 text-xs border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50">ถัดไป</button>
          </div>
        </div>
      </div>
    </div>
  );
}
