import { mockDashboardStats } from '../data/mockData';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, FunnelChart, Funnel, LabelList
} from 'recharts';
import { Download, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

const REPORTS = [
  { id: 'pipeline', label: 'Lease Request Pipeline', desc: 'จำนวนคำขอตามสถานะ' },
  { id: 'sla', label: 'SLA Dashboard', desc: 'คำขอใกล้เกิน/เกิน SLA' },
  { id: 'conversion', label: 'Conversion Report', desc: 'คำขอที่กลายเป็นสัญญา' },
  { id: 'revenue', label: 'Revenue Pipeline', desc: 'รายได้คาดการณ์' },
  { id: 'workload', label: 'Workload Report', desc: 'ภาระงานเจ้าหน้าที่' },
  { id: 'audit', label: 'Audit Report', desc: 'ประวัติการแก้ไขและอนุมัติ' },
];

const WORKLOAD_DATA = [
  { name: 'ฝ่ายเจ้าหน้าที่พื้นที่', pending: 15, completed: 42 },
  { name: 'ฝ่ายตรวจพื้นที่', pending: 8, completed: 25 },
  { name: 'ฝ่ายประเมินราคา', pending: 6, completed: 18 },
  { name: 'ฝ่ายกฎหมาย', pending: 4, completed: 30 },
  { name: 'ฝ่ายการเงิน', pending: 12, completed: 35 },
];

const CONVERSION_FUNNEL = [
  { name: 'ยื่นคำขอ', value: 142, fill: '#1a2d5a' },
  { name: 'ผ่านตรวจเอกสาร', value: 118, fill: '#2a4080' },
  { name: 'ผ่านตรวจพื้นที่', value: 98, fill: '#3b5ba0' },
  { name: 'ผ่านประเมินราคา', value: 85, fill: '#4a72c0' },
  { name: 'ได้รับอนุมัติ', value: 72, fill: '#5989d8' },
  { name: 'ชำระมัดจำ', value: 65, fill: '#22c55e' },
  { name: 'ทำสัญญา', value: 58, fill: '#16a34a' },
];

const SLA_DATA = [
  { dept: 'เจ้าหน้าที่พื้นที่', onTime: 85, overSLA: 15 },
  { dept: 'ตรวจพื้นที่', onTime: 78, overSLA: 22 },
  { dept: 'ประเมินราคา', onTime: 90, overSLA: 10 },
  { dept: 'อนุมัติ', onTime: 70, overSLA: 30 },
];

const REJECTED_REASONS = [
  { reason: 'เอกสารไม่ครบถ้วน', count: 18, pct: 35 },
  { reason: 'พื้นที่ไม่ว่าง/มีข้อจำกัด', count: 12, pct: 23 },
  { reason: 'ไม่ผ่านกฎหมาย', count: 9, pct: 17 },
  { reason: 'ราคาเสนอต่ำกว่าขั้นต่ำ', count: 8, pct: 16 },
  { reason: 'ผู้ขอเช่ามีประวัติค้างชำระ', count: 5, pct: 9 },
];

export default function ReportsPage() {
  const stats = mockDashboardStats;

  return (
    <div className="space-y-6">
      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Conversion Rate', value: `${stats.conversionRate}%`, icon: TrendingUp, color: 'text-green-600', sub: 'คำขอ → สัญญา' },
          { label: 'เกิน SLA เฉลี่ย', value: '18%', icon: TrendingDown, color: 'text-red-600', sub: 'ของคำขอทั้งหมด' },
          { label: 'รายได้คาดการณ์', value: '฿1.85M', icon: BarChart3, color: 'text-srt-navy', sub: 'ต่อเดือน' },
          { label: 'Average Lead Time', value: '12.4 วัน', icon: BarChart3, color: 'text-purple-600', sub: 'ยื่น → อนุมัติ' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>
                </div>
                <Icon size={20} className={`${s.color} opacity-30`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Export buttons */}
      <div className="flex gap-2 flex-wrap">
        {REPORTS.map(r => (
          <button key={r.id} className="flex items-center gap-2 bg-white border border-gray-200 hover:border-srt-navy hover:text-srt-navy text-gray-600 rounded-lg px-3 py-2 text-xs transition-colors">
            <Download size={12} />
            {r.label}
          </button>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly trend */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-srt-navy-dark mb-4">แนวโน้มคำขอรายเดือน</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={stats.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="submitted" name="ยื่นคำขอ" stroke="#1a2d5a" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="approved" name="อนุมัติ" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="rejected" name="ปฏิเสธ" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Workload */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-srt-navy-dark mb-4">ภาระงานตามฝ่าย</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={WORKLOAD_DATA} layout="vertical" barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="completed" name="เสร็จแล้ว" fill="#22c55e" stackId="a" />
              <Bar dataKey="pending" name="ค้าง" fill="#f59e0b" stackId="a" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Conversion funnel */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-srt-navy-dark mb-4">Conversion Funnel — คำขอ → สัญญา</h3>
          <div className="space-y-2">
            {CONVERSION_FUNNEL.map((step, i) => {
              const pct = Math.round((step.value / CONVERSION_FUNNEL[0].value) * 100);
              const dropOff = i > 0 ? CONVERSION_FUNNEL[i-1].value - step.value : 0;
              return (
                <div key={step.name} className="flex items-center gap-3">
                  <div className="w-28 text-xs text-gray-600 truncate">{step.name}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                    <div
                      className="h-full rounded-full flex items-center justify-end pr-2 transition-all"
                      style={{ width: `${pct}%`, backgroundColor: step.fill }}
                    >
                      <span className="text-white text-xs font-medium">{step.value}</span>
                    </div>
                  </div>
                  {dropOff > 0 && (
                    <div className="text-xs text-red-500 w-12 text-right">-{dropOff}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SLA compliance */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-srt-navy-dark mb-4">SLA Compliance ตามฝ่าย</h3>
          <div className="space-y-3">
            {SLA_DATA.map(d => (
              <div key={d.dept}>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>{d.dept}</span>
                  <span className={d.overSLA > 20 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>{d.onTime}% ทันเวลา</span>
                </div>
                <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex">
                  <div className="bg-green-500 h-full transition-all" style={{ width: `${d.onTime}%` }}></div>
                  <div className="bg-red-400 h-full flex-1"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rejection reasons */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-srt-navy-dark mb-4">สาเหตุการปฏิเสธคำขอ</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            {REJECTED_REASONS.map((r, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-srt-red text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm text-gray-700 mb-1">
                    <span>{r.reason}</span>
                    <span className="text-gray-500 text-xs">{r.count} ครั้ง ({r.pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-srt-red rounded-full" style={{ width: `${r.pct}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={REJECTED_REASONS} dataKey="pct" nameKey="reason" cx="50%" cy="50%" outerRadius={80}>
                {REJECTED_REASONS.map((_, i) => (
                  <Cell key={i} fill={['#c0272d', '#e03040', '#d4a017', '#1a2d5a', '#2a4080'][i]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top locations revenue */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-srt-navy-dark mb-4">Revenue Pipeline ตามสถานที่</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={stats.topLocations}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `฿${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => `฿${v.toLocaleString()}`} />
            <Bar dataKey="revenue" name="รายได้คาดการณ์" fill="#1a2d5a" radius={[6,6,0,0]}>
              {stats.topLocations.map((_, i) => (
                <Cell key={i} fill={i === 0 ? '#1a2d5a' : i === 1 ? '#2a4080' : '#3b5ba0'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
