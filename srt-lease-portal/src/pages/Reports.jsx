import { Download, TrendingUp, Clock, CheckCircle, Percent } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, FunnelChart, Funnel, LabelList,
} from 'recharts';
import { mockDashboardStats } from '../data/mockData';

const s = mockDashboardStats;

const WORKLOAD = [
  { dept:'ตรวจเอกสาร',  pending:12, done:45 },
  { dept:'ตรวจพื้นที่', pending:8,  done:38 },
  { dept:'ประเมินราคา', pending:5,  done:32 },
  { dept:'อนุมัติ L1',  pending:9,  done:28 },
  { dept:'อนุมัติ L2',  pending:5,  done:22 },
];

const FUNNEL_DATA = [
  { name:'ยื่นคำขอ',        value:156, fill:'#1B2F5E' },
  { name:'ผ่านตรวจเอกสาร', value:132, fill:'#2A4080' },
  { name:'ผ่านตรวจพื้นที่', value:118, fill:'#3a5090' },
  { name:'ประเมินราคาแล้ว', value:106, fill:'#D4A017' },
  { name:'อนุมัติแล้ว',     value: 89, fill:'#22c55e' },
  { name:'ส่งต่อสัญญา',     value: 72, fill:'#16a34a' },
];

const LOCATION_REVENUE = [
  { name:'กรุงเทพ',   revenue:920000 },
  { name:'พญาไท',    revenue:840000 },
  { name:'หัวลำโพง', revenue:520000 },
  { name:'มักกะสัน', revenue:380000 },
  { name:'บางซื่อ',  revenue:190000 },
];

function KPICard({ label, value, icon: Icon, color, bg }) {
  return (
    <div className={`card-p flex items-center gap-3 ${bg}`}>
      <Icon size={20} className={color} />
      <div>
        <div className="text-xs text-gray-400">{label}</div>
        <div className={`text-xl font-extrabold ${color}`}>{value}</div>
      </div>
    </div>
  );
}

export default function Reports() {
  return (
    <div className="space-y-5">
      {/* Export Row */}
      <div className="flex flex-wrap gap-2">
        <button className="btn-white btn-sm"><Download size={14} />Export Excel</button>
        <button className="btn-white btn-sm"><Download size={14} />Export PDF</button>
        <button className="btn-white btn-sm"><Download size={14} />Export CSV</button>
        <span className="text-xs text-gray-400 self-center ml-2">ข้อมูล ณ วันที่ 27 เมษายน พ.ศ. 2569</span>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Conversion Rate" value={`${s.conversionRate}%`} icon={Percent} color="text-srt-navy" bg="bg-blue-50" />
        <KPICard label="เฉลี่ยเวลาดำเนินการ" value={`${s.avgProcessDays} วัน`} icon={Clock} color="text-amber-600" bg="bg-amber-50" />
        <KPICard label="SLA Compliance" value="83%" icon={CheckCircle} color="text-green-600" bg="bg-green-50" />
        <KPICard label="รายได้คาดการณ์" value={`฿${(s.estimatedMonthlyRevenue/1000000).toFixed(2)}M`} icon={TrendingUp} color="text-emerald-600" bg="bg-emerald-50" />
      </div>

      {/* Monthly Trend */}
      <div className="card-p">
        <h3 className="font-bold text-srt-navy mb-4">แนวโน้มรายเดือน (ยื่น / อนุมัติ / ไม่อนุมัติ)</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={s.monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="submitted" stroke="#1B2F5E" strokeWidth={2} dot name="ยื่นคำขอ" />
            <Line type="monotone" dataKey="approved"  stroke="#22c55e" strokeWidth={2} dot name="อนุมัติ" />
            <Line type="monotone" dataKey="rejected"  stroke="#C0272D" strokeWidth={2} dot name="ไม่อนุมัติ" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Workload + Conversion Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card-p">
          <h3 className="font-bold text-srt-navy mb-4">ภาระงานตามฝ่าย</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={WORKLOAD} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="dept" type="category" tick={{ fontSize: 11 }} width={80} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="done" name="เสร็จสิ้น" stackId="a" fill="#22c55e" radius={[0,0,0,0]} />
              <Bar dataKey="pending" name="ค้างดำเนินการ" stackId="a" fill="#fbbf24" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card-p">
          <h3 className="font-bold text-srt-navy mb-4">Conversion Funnel</h3>
          <div className="space-y-2">
            {FUNNEL_DATA.map((f, i) => {
              const pct = Math.round((f.value / FUNNEL_DATA[0].value) * 100);
              return (
                <div key={f.name} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-32 flex-shrink-0">{f.name}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                    <div className="h-full rounded-full flex items-center px-2 text-white text-xs font-bold" style={{ width:`${pct}%`, background: f.fill }}>
                      {f.value}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 w-10 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SLA Compliance + Rejection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card-p">
          <h3 className="font-bold text-srt-navy mb-4">SLA Compliance ตามฝ่าย (%)</h3>
          <div className="space-y-3">
            {s.slaCompliance.map(item => (
              <div key={item.dept} className="flex items-center gap-3">
                <span className="text-xs text-gray-600 w-28 flex-shrink-0">{item.dept}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-4 rounded-full transition-all ${item.compliant >= 85 ? 'bg-green-500' : item.compliant >= 75 ? 'bg-yellow-400' : 'bg-red-400'}`}
                    style={{ width:`${item.compliant}%` }}
                  />
                </div>
                <span className="text-xs font-bold w-10 text-right">{item.compliant}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-p">
          <h3 className="font-bold text-srt-navy mb-4">สาเหตุการปฏิเสธ</h3>
          <div className="space-y-3 mb-4">
            {s.rejectionReasons.map(r => (
              <div key={r.reason} className="flex items-center gap-3">
                <span className="text-xs text-gray-600 flex-1">{r.reason}</span>
                <div className="w-24 bg-gray-100 rounded-full h-3">
                  <div className="h-3 bg-srt-red rounded-full" style={{ width:`${(r.count/s.rejectionReasons[0].count)*100}%` }} />
                </div>
                <span className="text-xs font-bold text-srt-red w-6 text-right">{r.count}</span>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={s.rejectionReasons} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="reason" tick={{ fontSize: 9 }} angle={-15} textAnchor="end" height={40} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" name="จำนวน" fill="#C0272D" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Locations Revenue */}
      <div className="card-p">
        <h3 className="font-bold text-srt-navy mb-4">รายได้คาดการณ์ตามสถานที่ (บาท/เดือน)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={LOCATION_REVENUE} barSize={30}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `฿${(v/1000).toFixed(0)}K`} />
            <Tooltip formatter={v => `฿${v.toLocaleString()}`} />
            <Bar dataKey="revenue" name="รายได้" fill="#1B2F5E" radius={[6,6,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
