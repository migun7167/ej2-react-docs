import React from 'react';
import {
  FileText, AlertTriangle, Clock, CheckCircle, TrendingUp, DollarSign,
  RefreshCw, PenTool, BarChart2, Activity, AlertCircle, Users, Building
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area
} from 'recharts';
import {
  kpiData, monthlyRevenue, contractsByType, statusDistribution,
  stationData, contracts, notifications, formatCurrency
} from '../data/mockData';

function StatCard({ icon, label, value, sub, color, trend }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; color: string; trend?: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: color + '18' }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="stat-info">
        <h3>{value}</h3>
        <p>{label}</p>
        {trend && <div className={`stat-trend ${trend.startsWith('+') ? 'trend-up' : 'trend-down'}`}>{trend}</div>}
        {sub && <div style={{ fontSize: 11, color: 'var(--srt-gray-400)' }}>{sub}</div>}
      </div>
    </div>
  );
}

const COLORS = contractsByType.map(d => d.color);

export default function Dashboard() {
  const expiringContracts = contracts.filter(c => c.daysToExpiry > 0 && c.daysToExpiry <= 60);
  const debtContracts = contracts.filter(c => c.hasDebt);

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-title">
          <BarChart2 size={22} />
          Dashboard ภาพรวมระบบสัญญา
        </div>
        <div className="page-header-sub">
          การรถไฟแห่งประเทศไทย · ข้อมูล ณ วันที่ 27 มิถุนายน 2567 · ผู้ใช้งาน: นายวิชัย การรถไฟ
        </div>
      </div>

      {/* Alert Bar */}
      <div className="alert alert-warning" style={{ marginBottom: 20 }}>
        <AlertCircle size={16} />
        <span>
          <strong>แจ้งเตือนเร่งด่วน:</strong> มีสัญญา 3 ฉบับที่จะหมดอายุภายใน 30 วัน และมีสัญญา 4 ฉบับที่รอการอนุมัติเกิน SLA กรุณาดำเนินการ
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-4 mb-6">
        <StatCard icon={<FileText size={20} />} label="สัญญาทั้งหมด" value={kpiData.totalContracts.toLocaleString()} sub={`${kpiData.activeContracts.toLocaleString()} ฉบับ มีผล`} color="#0a1f44" trend="+42 เดือนนี้" />
        <StatCard icon={<AlertTriangle size={20} />} label="ใกล้หมดอายุ (30 วัน)" value={kpiData.expiringIn30Days.toString()} sub="ต้องดำเนินการด่วน" color="#ea580c" trend="+12 จากเดือนที่แล้ว" />
        <StatCard icon={<Clock size={20} />} label="รออนุมัติ" value={kpiData.pendingApproval.toString()} sub={`${kpiData.pendingSignature} รอลงนาม`} color="#a16207" />
        <StatCard icon={<DollarSign size={20} />} label="รายได้เดือนนี้" value={'฿' + (kpiData.monthlyRevenue / 1000000).toFixed(1) + 'M'} sub="เป้า ฿18.0M" color="#16a34a" trend="+4.2% จากเดือนที่แล้ว" />
      </div>

      <div className="grid grid-4 mb-6">
        <StatCard icon={<TrendingUp size={20} />} label="อัตราต่ออายุ" value={kpiData.renewalRate + '%'} sub="เป้า 90%" color="#7c3aed" trend="-2.7% จากปีก่อน" />
        <StatCard icon={<AlertCircle size={20} />} label="หนี้ค้างรวม" value={'฿' + (kpiData.totalDebt / 1000000).toFixed(1) + 'M'} sub="3 สัญญา" color="#c0392b" />
        <StatCard icon={<Activity size={20} />} label="เฉลี่ยวันดำเนินการ" value={kpiData.avgProcessingDays + ' วัน'} sub="เป้า 7 วัน" color="#0d9488" />
        <StatCard icon={<CheckCircle size={20} />} label="สัญญาใหม่เดือนนี้" value={kpiData.contractsThisMonth.toString()} sub="ออกสัญญาสำเร็จ" color="#f39c12" trend="+8 จากเดือนที่แล้ว" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-2 mb-6" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">รายได้รายเดือน vs เป้าหมาย</span>
            <span style={{ fontSize: 12, color: 'var(--srt-gray-500)' }}>ม.ค. - มิ.ย. 2567</span>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyRevenue} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={v => `${(v/1000000).toFixed(0)}M`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: unknown) => `฿${((v as number)/1000000).toFixed(2)}M`} />
                <Bar dataKey="revenue" fill="#0a1f44" radius={[4,4,0,0]} name="รายได้จริง" />
                <Bar dataKey="target" fill="#e2e8f0" radius={[4,4,0,0]} name="เป้าหมาย" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">สัญญาตามประเภท</span>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={contractsByType} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={35}>
                  {contractsByType.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: unknown) => String(v) + ' ฉบับ'} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
              {contractsByType.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
                  <span style={{ color: 'var(--srt-gray-600)' }}>{d.name} ({d.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-2 mb-6">
        <div className="card">
          <div className="card-header">
            <span className="card-title">สถานะสัญญา</span>
          </div>
          <div className="card-body">
            {statusDistribution.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div style={{ width: 100, fontSize: 12, color: 'var(--srt-gray-600)', flexShrink: 0 }}>{item.status}</div>
                <div style={{ flex: 1 }}>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(item.count / 892) * 100}%`, background: item.color }} />
                  </div>
                </div>
                <div style={{ width: 40, fontSize: 12, fontWeight: 600, textAlign: 'right', color: 'var(--srt-gray-700)' }}>{item.count}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">รายได้ตามสถานี (Top 7)</span>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stationData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tickFormatter={v => `${(v/1000000).toFixed(1)}M`} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="station" tick={{ fontSize: 10 }} width={100} />
                <Tooltip formatter={(v: unknown) => `฿${((v as number)/1000000).toFixed(2)}M`} />
                <Bar dataKey="revenue" fill="#c0392b" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-2 mb-6">
        {/* Expiring Contracts */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">⚠️ สัญญาใกล้หมดอายุ</span>
            <button className="btn btn-ghost btn-sm">ดูทั้งหมด</button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>เลขสัญญา</th>
                  <th>ผู้เช่า</th>
                  <th>วันหมดอายุ</th>
                  <th>เหลือ</th>
                </tr>
              </thead>
              <tbody>
                {expiringContracts.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600, fontSize: 12, color: 'var(--srt-navy)' }}>{c.contractNo}</td>
                    <td style={{ fontSize: 12 }}>{c.tenantName}</td>
                    <td style={{ fontSize: 12 }}>{c.endDate}</td>
                    <td>
                      <span className="badge badge-expiring">{c.daysToExpiry} วัน</span>
                    </td>
                  </tr>
                ))}
                {expiringContracts.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--srt-gray-400)', padding: 24 }}>ไม่มีสัญญาใกล้หมดอายุ</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">การแจ้งเตือนล่าสุด</span>
            <button className="btn btn-ghost btn-sm">ดูทั้งหมด</button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {notifications.slice(0, 5).map(n => (
              <div key={n.id} style={{ display: 'flex', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--srt-gray-100)', background: n.read ? '#fff' : '#fafbff' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: n.type === 'expiry' ? '#fed7aa' : n.type === 'debt' ? '#fee2e2' : n.type === 'approval' ? '#dbeafe' : '#fae8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {n.type === 'expiry' ? <AlertTriangle size={14} color="#c2410c" /> :
                   n.type === 'debt' ? <DollarSign size={14} color="#b91c1c" /> :
                   n.type === 'approval' ? <CheckCircle size={14} color="#1d4ed8" /> :
                   <RefreshCw size={14} color="#7e22ce" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--srt-gray-800)' }}>{n.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--srt-gray-500)', marginTop: 2 }}>{n.message}</div>
                  <div style={{ fontSize: 11, color: 'var(--srt-gray-400)', marginTop: 4 }}>{n.date}</div>
                </div>
                {!n.read && <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--srt-red)', flexShrink: 0, marginTop: 6 }} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Debt Contracts */}
      {debtContracts.length > 0 && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">🔴 สัญญาที่มีหนี้ค้าง</span>
            <span className="badge badge-high">ต้องดำเนินการด่วน</span>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>เลขสัญญา</th>
                  <th>ผู้เช่า</th>
                  <th>ทรัพย์สิน</th>
                  <th>ค่าเช่า/เดือน</th>
                  <th>หนี้ค้าง</th>
                  <th>ความเสี่ยง</th>
                  <th>การดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {debtContracts.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600, color: 'var(--srt-navy)', fontSize: 12 }}>{c.contractNo}</td>
                    <td style={{ fontSize: 12 }}>{c.tenantName}</td>
                    <td style={{ fontSize: 12 }}>{c.assetName}</td>
                    <td style={{ fontSize: 12 }}>{formatCurrency(c.monthlyRent)}</td>
                    <td><span style={{ color: 'var(--srt-red)', fontWeight: 700 }}>{formatCurrency(c.debtAmount)}</span></td>
                    <td><span className={`badge badge-${c.riskLevel === 'สูง' ? 'high' : c.riskLevel === 'ปานกลาง' ? 'medium' : 'low'}`}>{c.riskLevel}</span></td>
                    <td>
                      <button className="btn btn-danger btn-sm">แจ้งหนี้</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
