import { TrendingUp, Clock, CheckCircle, XCircle, AlertTriangle, CreditCard, DollarSign, Percent } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import { mockDashboardStats, mockRequests } from '../data/mockData';
import StatusBadge from '../components/StatusBadge';
import SLABar from '../components/SLABar';

const s = mockDashboardStats;

function KPICard({ label, value, sub, icon: Icon, color, bg }) {
  return (
    <div className={`card-p flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${bg}`}>
        <Icon size={22} className={color} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-400 font-medium">{label}</div>
        <div className="text-2xl font-extrabold text-srt-navy mt-0.5">{value}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

const COLORS = ['#1B2F5E', '#22c55e', '#D4A017', '#9ca3af'];

export default function Dashboard({ navigate }) {
  const overSLARequests = mockRequests.filter(r => r.isOverSLA);

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard label="คำขอทั้งหมด" value={s.totalRequests} sub="ทุกสถานะ" icon={TrendingUp} color="text-srt-navy" bg="bg-blue-50" />
        <KPICard label="รออนุมัติ" value={s.pendingRequests} sub="ค้างดำเนินการ" icon={Clock} color="text-amber-600" bg="bg-amber-50" />
        <KPICard label="อนุมัติเดือนนี้" value={s.approvedThisMonth} sub="เมษายน 2567" icon={CheckCircle} color="text-green-600" bg="bg-green-50" />
        <KPICard label="เกิน SLA" value={s.overSLA} sub="ต้องดำเนินการด่วน" icon={AlertTriangle} color="text-red-500" bg="bg-red-50" />
        <KPICard label="รอชำระมัดจำ" value={s.pendingDeposit} sub="รอการยืนยัน" icon={CreditCard} color="text-pink-600" bg="bg-pink-50" />
        <KPICard
          label="รายได้คาดการณ์"
          value={`฿${(s.estimatedMonthlyRevenue / 1000000).toFixed(2)}M`}
          sub="ต่อเดือน"
          icon={DollarSign}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Monthly Trend */}
        <div className="card-p lg:col-span-2">
          <h3 className="font-bold text-srt-navy mb-4">แนวโน้มรายเดือน (6 เดือนล่าสุด)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={s.monthlyTrend} barSize={14} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="submitted" name="ยื่นคำขอ" fill="#1B2F5E" radius={[3,3,0,0]} />
              <Bar dataKey="approved" name="อนุมัติ" fill="#22c55e" radius={[3,3,0,0]} />
              <Bar dataKey="rejected" name="ไม่อนุมัติ" fill="#C0272D" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Asset Utilization Pie */}
        <div className="card-p">
          <h3 className="font-bold text-srt-navy mb-4">การใช้ประโยชน์ทรัพย์สิน</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={s.assetUtilization} cx="50%" cy="50%" outerRadius={65} dataKey="value" label={({ name, percent }) => `${Math.round(percent * 100)}%`} labelLine={false} fontSize={10}>
                {s.assetUtilization.map((entry, idx) => (
                  <Cell key={idx} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2">
            {s.assetUtilization.map(item => (
              <div key={item.name} className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: item.fill }} />
                <span className="text-xs text-gray-500">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pipeline + Top Stations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Pipeline */}
        <div className="card-p">
          <h3 className="font-bold text-srt-navy mb-4">Pipeline คำขอตามสถานะ</h3>
          <div className="space-y-2">
            {s.pipelineData.map(item => {
              const pct = Math.round((item.count / 38) * 100);
              return (
                <div key={item.status} className="flex items-center gap-3">
                  <div className="text-xs text-gray-500 w-28 flex-shrink-0">{item.label}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                    <div
                      className="h-full bg-srt-navy rounded-full flex items-center pl-2 transition-all"
                      style={{ width: `${Math.max(pct, 8)}%` }}
                    >
                      <span className="text-[10px] text-white font-bold">{item.count}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Stations */}
        <div className="card-p">
          <h3 className="font-bold text-srt-navy mb-4">Top 5 สถานีที่มีคำขอมากสุด</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="th pl-0">สถานี</th>
                <th className="th text-center">คำขอ</th>
                <th className="th text-right">รายได้คาดการณ์</th>
              </tr>
            </thead>
            <tbody>
              {s.topStations.map((st, i) => (
                <tr key={st.name} className="border-b border-gray-50">
                  <td className="td pl-0">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-srt-navy/10 text-srt-navy text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                      <span className="text-sm font-medium text-gray-700">{st.name}</span>
                    </div>
                  </td>
                  <td className="td text-center">
                    <span className="badge bg-blue-50 text-srt-navy font-bold">{st.requests}</span>
                  </td>
                  <td className="td text-right text-sm text-emerald-700 font-semibold">
                    ฿{st.revenue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SLA Alerts + Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* SLA Alerts */}
        <div className="card border-red-200">
          <div className="px-5 py-4 border-b border-red-100 bg-red-50 rounded-t-2xl flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-500" />
            <h3 className="font-bold text-red-700">รายการเกิน SLA ({overSLARequests.length} รายการ)</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {overSLARequests.length === 0 && (
              <div className="p-5 text-center text-gray-400 text-sm">ไม่มีรายการเกิน SLA</div>
            )}
            {overSLARequests.map(r => (
              <div key={r.id} className="px-5 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-800">{r.id}</div>
                  <div className="text-xs text-gray-400">{r.applicantName} · {r.assetName}</div>
                </div>
                <div className="w-28">
                  <SLABar used={r.slaUsed} total={r.slaHours} />
                </div>
                <StatusBadge status={r.status} size="sm" />
              </div>
            ))}
          </div>
        </div>

        {/* SLA Compliance */}
        <div className="card-p">
          <h3 className="font-bold text-srt-navy mb-4">SLA Compliance (%)</h3>
          <div className="space-y-3">
            {s.slaCompliance.map(item => (
              <div key={item.dept} className="flex items-center gap-3">
                <div className="text-xs text-gray-600 w-28 flex-shrink-0">{item.dept}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${item.compliant >= 85 ? 'bg-green-500' : item.compliant >= 75 ? 'bg-yellow-400' : 'bg-red-400'}`}
                    style={{ width: `${item.compliant}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-gray-700 w-10 text-right">{item.compliant}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
