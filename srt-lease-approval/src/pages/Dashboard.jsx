import { mockDashboardStats, mockRequests, STATUS_CONFIG } from '../data/mockData';
import StatusBadge from '../components/StatusBadge';
import SLABar from '../components/SLABar';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { AlertCircle, TrendingUp, Clock, CheckCircle, XCircle, CreditCard, FileText, Building2 } from 'lucide-react';

const KPI_CARDS = [
  { label: 'คำขอทั้งหมด', value: 142, sub: 'รายการในระบบ', icon: FileText, color: 'bg-srt-navy', iconBg: 'bg-white/20' },
  { label: 'รออนุมัติ', value: 38, sub: 'รายการค้างดำเนินการ', icon: Clock, color: 'bg-amber-500', iconBg: 'bg-white/20' },
  { label: 'อนุมัติเดือนนี้', value: 24, sub: '+4 จากเดือนที่แล้ว', icon: CheckCircle, color: 'bg-green-600', iconBg: 'bg-white/20' },
  { label: 'เกิน SLA', value: 7, sub: 'ต้องดำเนินการด่วน', icon: AlertCircle, color: 'bg-srt-red', iconBg: 'bg-white/20' },
  { label: 'รอชำระมัดจำ', value: 12, sub: 'รายการ', icon: CreditCard, color: 'bg-purple-600', iconBg: 'bg-white/20' },
  { label: 'รายได้คาดการณ์', value: '1.85M', sub: 'บาท/เดือน', icon: TrendingUp, color: 'bg-teal-600', iconBg: 'bg-white/20' },
];

export default function Dashboard({ navigate }) {
  const overSLARequests = mockRequests.filter(r => r.isOverSLA);
  const pendingApproval = mockRequests.filter(r => r.status === 'Waiting for Approval');
  const stats = mockDashboardStats;

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {KPI_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`${card.color} rounded-xl p-4 text-white`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`${card.iconBg} rounded-lg p-2`}>
                  <Icon size={18} />
                </div>
              </div>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="text-xs text-white/80 mt-0.5">{card.label}</div>
              <div className="text-xs text-white/60 mt-1">{card.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend */}
        <div className="lg:col-span-2 card p-5">
          <h2 className="text-sm font-semibold text-srt-navy-dark mb-4">แนวโน้มคำขอเช่า 6 เดือนล่าสุด</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.monthlyTrend} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="submitted" name="ยื่นคำขอ" fill="#1a2d5a" radius={[4,4,0,0]} />
              <Bar dataKey="approved" name="อนุมัติ" fill="#22c55e" radius={[4,4,0,0]} />
              <Bar dataKey="rejected" name="ปฏิเสธ" fill="#ef4444" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Asset Utilization Pie */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-srt-navy-dark mb-4">สัดส่วนการใช้ทรัพย์สิน</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={stats.assetUtilization}
                cx="50%" cy="45%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name} ${value}%`}
                labelLine={false}
              >
                {stats.assetUtilization.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pipeline & Top Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-srt-navy-dark mb-4">Pipeline คำขอตามสถานะ</h2>
          <div className="space-y-2.5">
            {stats.pipelineByStatus.map(item => {
              const pct = Math.round((item.count / 54) * 100);
              return (
                <div key={item.status} className="flex items-center gap-3">
                  <div className="w-32 text-xs text-gray-600 truncate">{item.label}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                    <div
                      className="h-full bg-srt-navy rounded-full flex items-center justify-end pr-2 transition-all"
                      style={{ width: `${Math.max(pct, 8)}%` }}
                    >
                      <span className="text-white text-xs font-medium">{item.count}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Locations */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-srt-navy-dark mb-4">Top 5 สถานีตามคำขอ</h2>
          <div className="space-y-3">
            {stats.topLocations.map((loc, i) => (
              <div key={loc.name} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-srt-navy text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-gray-800">{loc.name}</span>
                    <span className="text-xs text-gray-400">{loc.count} คำขอ</span>
                  </div>
                  <div className="text-xs text-green-600 font-medium">฿{loc.revenue.toLocaleString()}/เดือน</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts & Pending */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SLA Alerts */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-srt-navy-dark flex items-center gap-2">
              <AlertCircle size={16} className="text-srt-red" />
              คำขอที่เกิน SLA ({overSLARequests.length})
            </h2>
            <button onClick={() => navigate('requests')} className="text-xs text-srt-navy hover:underline">ดูทั้งหมด</button>
          </div>
          <div className="space-y-3">
            {overSLARequests.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">ไม่มีคำขอเกิน SLA</p>
            ) : overSLARequests.map(req => (
              <button
                key={req.id}
                onClick={() => navigate('request_detail', { requestId: req.id })}
                className="w-full text-left p-3 rounded-lg border border-red-100 bg-red-50 hover:bg-red-100 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs font-medium text-srt-red">{req.id}</div>
                    <div className="text-sm text-gray-800 mt-0.5">{req.assetName}</div>
                    <div className="text-xs text-gray-500">{req.applicantName}</div>
                  </div>
                  <StatusBadge status={req.status} />
                </div>
                <div className="mt-2">
                  <SLABar slaHours={req.slaHours} slaUsed={req.slaUsed} isOverSLA={req.isOverSLA} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Pending Approval */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-srt-navy-dark">รออนุมัติ ({pendingApproval.length})</h2>
            <button onClick={() => navigate('approval')} className="text-xs text-srt-navy hover:underline">ดูทั้งหมด</button>
          </div>
          <div className="space-y-3">
            {pendingApproval.map(req => (
              <button
                key={req.id}
                onClick={() => navigate('request_detail', { requestId: req.id })}
                className="w-full text-left p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs font-medium text-srt-navy">{req.id}</div>
                    <div className="text-sm text-gray-800 mt-0.5">{req.assetName}</div>
                    <div className="text-xs text-gray-500">{req.applicantName}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400">{req.submittedDate}</div>
                    {req.estimatedRent && (
                      <div className="text-xs font-medium text-green-600 mt-0.5">
                        ฿{req.estimatedRent.toLocaleString()}/เดือน
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-2">
                  <SLABar slaHours={req.slaHours} slaUsed={req.slaUsed} isOverSLA={req.isOverSLA} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
