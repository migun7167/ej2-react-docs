import { useState } from 'react';
import { Search, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { mockAuditLogs } from '../data/mockData';

const ACTION_COLORS = {
  CREATE:            'bg-blue-100 text-blue-700',
  STATUS_CHANGE:     'bg-purple-100 text-purple-700',
  DOC_APPROVE:       'bg-green-100 text-green-700',
  APPROVE:           'bg-green-100 text-green-700',
  REJECT:            'bg-red-100 text-red-700',
  INSPECTION_CREATE: 'bg-yellow-100 text-yellow-700',
  INSPECTION_COMPLETE:'bg-emerald-100 text-emerald-700',
  VALUATION_CREATE:  'bg-indigo-100 text-indigo-700',
  VALUATION_COMPLETE:'bg-teal-100 text-teal-700',
  PAYMENT_CONFIRM:   'bg-pink-100 text-pink-700',
  HANDOFF:           'bg-cyan-100 text-cyan-700',
  NOTIFICATION:      'bg-gray-100 text-gray-600',
  VIEW:              'bg-gray-50 text-gray-500',
  SETTINGS_UPDATE:   'bg-orange-100 text-orange-700',
};

const ENTITY_TYPES = ['ทุกประเภท','Request','Document','Inspection','Valuation','Approval','Deposit','Handoff','Notification','Settings'];
const ACTION_TYPES = ['ทุก Action','CREATE','STATUS_CHANGE','APPROVE','REJECT','PAYMENT_CONFIRM','HANDOFF','VIEW','SETTINGS_UPDATE'];

export default function AuditLog() {
  const [search, setSearch]     = useState('');
  const [entityF, setEntityF]   = useState('ทุกประเภท');
  const [actionF, setActionF]   = useState('ทุก Action');
  const [expanded, setExpanded] = useState(null);

  const filtered = mockAuditLogs.filter(log => {
    const q = search.toLowerCase();
    const mq = !q || log.userName.toLowerCase().includes(q) || log.entityId.toLowerCase().includes(q) || log.action.toLowerCase().includes(q);
    const me = entityF === 'ทุกประเภท' || log.entityType === entityF;
    const ma = actionF === 'ทุก Action' || log.action === actionF;
    return mq && me && ma;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="card-p flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="inp pl-8" placeholder="ค้นหาชื่อผู้ใช้, เลขคำขอ, action..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="sel w-40" value={entityF} onChange={e => setEntityF(e.target.value)}>
          {ENTITY_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
        <select className="sel w-44" value={actionF} onChange={e => setActionF(e.target.value)}>
          {ACTION_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
        <button className="btn-white btn-sm"><Download size={14} />Export</button>
      </div>

      <div className="text-xs text-gray-400 px-1">{filtered.length} รายการ</div>

      {/* Timeline */}
      <div className="space-y-2">
        {filtered.map(log => {
          const isOpen = expanded === log.id;
          const actionColor = ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-600';
          return (
            <div key={log.id} className="card overflow-hidden">
              <div
                className="flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(isOpen ? null : log.id)}
              >
                {/* Dot */}
                <div className="flex flex-col items-center mt-0.5 flex-shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-srt-navy" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`badge ${actionColor} text-[10px]`}>{log.action}</span>
                    <span className="text-xs font-bold text-gray-700">{log.entityType}</span>
                    <span className="text-xs font-mono text-srt-navy">{log.entityId}</span>
                    {log.oldValue && log.newValue && (
                      <span className="text-[10px] text-gray-400">
                        {log.oldValue} → <span className="text-gray-600 font-medium">{log.newValue}</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500">{log.userName}</span>
                    <span className="text-[10px] text-gray-400">{log.timestamp}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-300 font-mono hidden sm:block">{log.ipAddress}</span>
                  {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
              </div>

              {isOpen && (
                <div className="px-5 pb-4 border-t border-gray-100 pt-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <div className="text-gray-400 font-bold uppercase mb-1">Log ID</div>
                      <div className="font-mono text-gray-600">{log.id}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 font-bold uppercase mb-1">User ID</div>
                      <div className="font-mono text-gray-600">{log.userId}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 font-bold uppercase mb-1">IP Address</div>
                      <div className="font-mono text-gray-600">{log.ipAddress}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 font-bold uppercase mb-1">Timestamp</div>
                      <div className="font-mono text-gray-600">{log.timestamp}</div>
                    </div>
                    {log.oldValue && (
                      <div className="col-span-2">
                        <div className="text-gray-400 font-bold uppercase mb-1">ค่าเดิม</div>
                        <div className="bg-red-50 border border-red-100 rounded px-2 py-1 font-mono text-red-600">{log.oldValue}</div>
                      </div>
                    )}
                    {log.newValue && (
                      <div className="col-span-2">
                        <div className="text-gray-400 font-bold uppercase mb-1">ค่าใหม่</div>
                        <div className="bg-green-50 border border-green-100 rounded px-2 py-1 font-mono text-green-600">{log.newValue}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="card-p text-center text-gray-400 py-8">ไม่พบข้อมูล Audit Log ตามเงื่อนไข</div>
        )}
      </div>
    </div>
  );
}
