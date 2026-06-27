import React, { useState } from 'react';
import { BarChart2, Download, TrendingUp, AlertTriangle, FileText, RefreshCw } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend
} from 'recharts';
import { monthlyRevenue, contractsByType, stationData, kpiData, formatCurrency } from '../data/mockData';

const COLORS = contractsByType.map(d => d.color);

const slaData = [
  { stage: 'รับข้อมูล', target: 1, actual: 0.5 },
  { stage: 'ร่างสัญญา', target: 2, actual: 1.8 },
  { stage: 'ตรวจกฎหมาย', target: 3, actual: 3.2 },
  { stage: 'อนุมัติ', target: 3, actual: 4.1 },
  { stage: 'ลงนาม', target: 2, actual: 1.2 },
];

const riskData = [
  { name: 'ใกล้หมดอายุ', count: 67, revenue: 4200000, color: '#ea580c' },
  { name: 'มีหนี้ค้าง', count: 23, revenue: 1800000, color: '#c0392b' },
  { name: 'ราคาต่ำกว่าตลาด', count: 41, revenue: 2900000, color: '#a16207' },
  { name: 'เอกสารขาด', count: 15, revenue: 980000, color: '#7c3aed' },
];

export default function Reports() {
  const [tab, setTab] = useState('overview');
  const [dateRange, setDateRange] = useState('2567');

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-title"><BarChart2 size={22} /> รายงานและวิเคราะห์สัญญา</div>
        <div className="page-header-sub">BI Dashboard สำหรับผู้บริหารและเจ้าหน้าที่ - ข้อมูลแบบ Real-time</div>
      </div>

      {/* Filter bar */}
      <div className="card mb-4">
        <div className="card-body" style={{ padding: '12px 20px' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <select className="form-control" style={{ width: 140 }} value={dateRange} onChange={e => setDateRange(e.target.value)}>
              <option value="2567">ปี 2567</option>
              <option value="2566">ปี 2566</option>
              <option value="q2">ไตรมาส 2/2567</option>
            </select>
            <select className="form-control" style={{ width: 160 }}>
              <option>ทุกสถานี</option>
              <option>สถานีกรุงเทพ</option>
              <option>สถานีเชียงใหม่</option>
            </select>
            <select className="form-control" style={{ width: 160 }}>
              <option>ทุกประเภทสัญญา</option>
              <option>ร้านค้า</option>
              <option>ป้ายโฆษณา</option>
            </select>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-sm"><Download size={13} /> Export PDF</button>
              <button className="btn btn-ghost btn-sm"><Download size={13} /> Export Excel</button>
            </div>
          </div>
        </div>
      </div>

      <div className="tab-nav">
        {['overview', 'revenue', 'risk', 'sla', 'expiry', 'station'].map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'overview' ? 'ภาพรวม Executive' : t === 'revenue' ? 'รายได้' : t === 'risk' ? 'ความเสี่ยง' : t === 'sla' ? 'SLA' : t === 'expiry' ? 'สัญญาหมดอายุ' : 'ตามสถานี'}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div>
          <div className="grid grid-4 mb-4">
            {[
              { label: 'สัญญามีผล', value: kpiData.activeContracts, unit: 'ฉบับ', color: '#16a34a' },
              { label: 'รายได้ปีนี้', value: '฿218.7M', unit: '', color: '#0a1f44' },
              { label: 'อัตราต่ออายุ', value: '87.3%', unit: '', color: '#7c3aed' },
              { label: 'Revenue at Risk', value: '฿9.88M', unit: '', color: '#c0392b' },
            ].map(k => (
              <div key={k.label} className="stat-card">
                <div style={{ width: 48, height: 48, borderRadius: 10, background: k.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={22} color={k.color} />
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: k.color }}>{k.value}</div>
                  <div style={{ fontSize: 12, color: 'var(--srt-gray-500)' }}>{k.label} {k.unit}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-2 mb-4" style={{ gridTemplateColumns: '2fr 1fr' }}>
            <div className="card">
              <div className="card-header"><span className="card-title">รายได้รายเดือน 2567</span></div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={monthlyRevenue}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0a1f44" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#0a1f44" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={v => `${(v/1000000).toFixed(0)}M`} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: unknown) => `฿${((v as number)/1000000).toFixed(2)}M`} />
                    <Area type="monotone" dataKey="revenue" stroke="#0a1f44" fill="url(#colorRevenue)" name="รายได้" strokeWidth={2} />
                    <Area type="monotone" dataKey="target" stroke="#c0392b" fill="none" name="เป้าหมาย" strokeDasharray="5 5" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card">
              <div className="card-header"><span className="card-title">สัญญาตามประเภท</span></div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={contractsByType} dataKey="value" cx="50%" cy="50%" outerRadius={75} innerRadius={40}>
                      {contractsByType.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip formatter={(v: unknown) => String(v) + ' ฉบับ'} />
                  </PieChart>
                </ResponsiveContainer>
                {contractsByType.slice(0, 4).map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, fontSize: 11 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
                    <span style={{ color: 'var(--srt-gray-600)' }}>{d.name}</span>
                    <span style={{ marginLeft: 'auto', fontWeight: 600 }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'revenue' && (
        <div>
          <div className="grid grid-2 mb-4">
            <div className="card">
              <div className="card-header"><span className="card-title">รายได้ vs เป้าหมาย</span></div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={v => `${(v/1000000).toFixed(0)}M`} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: unknown) => `฿${((v as number)/1000000).toFixed(2)}M`} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#0a1f44" radius={[4,4,0,0]} name="รายได้จริง" />
                    <Bar dataKey="target" fill="#e2e8f0" radius={[4,4,0,0]} name="เป้าหมาย" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card">
              <div className="card-header"><span className="card-title">รายได้ตามสถานี</span></div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={stationData} layout="vertical">
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
          <div className="card">
            <div className="card-header"><span className="card-title">Revenue Forecast (6 เดือนข้างหน้า)</span></div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={[
                  ...monthlyRevenue,
                  { month: 'ก.ค.', revenue: 19100000, target: 18500000 },
                  { month: 'ส.ค.', revenue: 19500000, target: 19000000 },
                  { month: 'ก.ย.', revenue: 20000000, target: 19500000 },
                  { month: 'ต.ค.', revenue: 20200000, target: 20000000 },
                  { month: 'พ.ย.', revenue: 19800000, target: 20000000 },
                  { month: 'ธ.ค.', revenue: 21000000, target: 20500000 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={v => `${(v/1000000).toFixed(0)}M`} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: unknown) => `฿${((v as number)/1000000).toFixed(2)}M`} />
                  <Line type="monotone" dataKey="revenue" stroke="#0a1f44" strokeWidth={2} name="คาดการณ์" strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {tab === 'risk' && (
        <div>
          <div className="alert alert-danger mb-4"><AlertTriangle size={14} /> Revenue at Risk รวม: <strong>฿{(riskData.reduce((a, b) => a + b.revenue, 0) / 1000000).toFixed(2)}M</strong> จากสัญญา {riskData.reduce((a, b) => a + b.count, 0)} ฉบับ</div>
          <div className="grid grid-2 mb-4">
            <div className="card">
              <div className="card-header"><span className="card-title">ประเภทความเสี่ยง</span></div>
              <div className="card-body">
                {riskData.map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: r.color, flexShrink: 0 }} />
                    <div style={{ flex: 1, fontSize: 13 }}>{r.name}</div>
                    <span className="badge" style={{ background: r.color + '22', color: r.color }}>{r.count} ฉบับ</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: r.color, minWidth: 80, textAlign: 'right' }}>฿{(r.revenue / 1000000).toFixed(2)}M</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="card-header"><span className="card-title">Revenue at Risk</span></div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={riskData} dataKey="revenue" cx="50%" cy="50%" outerRadius={80}>
                      {riskData.map((r, i) => <Cell key={i} fill={r.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: unknown) => `฿${((v as number)/1000000).toFixed(2)}M`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'sla' && (
        <div>
          <div className="card mb-4">
            <div className="card-header"><span className="card-title">SLA Performance ตามขั้นตอน</span></div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={slaData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} label={{ value: 'วัน', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(v: unknown) => String(v) + ' วัน'} />
                  <Bar dataKey="target" fill="#e2e8f0" radius={[4,4,0,0]} name="เป้าหมาย" />
                  <Bar dataKey="actual" fill="#0a1f44" radius={[4,4,0,0]} name="จริง" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {tab === 'expiry' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">รายงานสัญญาหมดอายุ</span>
            <button className="btn btn-ghost btn-sm"><Download size={13} /> Export</button>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>เลขสัญญา</th><th>ผู้เช่า</th><th>ประเภท</th><th>สถานี</th><th>วันหมดอายุ</th><th>เหลือ (วัน)</th><th>ค่าเช่า/เดือน</th><th>สถานะ</th></tr></thead>
              <tbody>
                {[{ days: '≤30', contracts: 67 }, { days: '31-60', contracts: 42 }, { days: '61-90', contracts: 31 }].map((row, i) => (
                  <tr key={i}>
                    <td colSpan={8} style={{ background: 'var(--srt-gray-50)', fontWeight: 600, color: 'var(--srt-gray-500)', fontSize: 11 }}>
                      เหลือ {row.days} วัน ({row.contracts} สัญญา)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'station' && (
        <div className="card">
          <div className="card-header"><span className="card-title">สรุปตามสถานี</span></div>
          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>สถานี</th><th>จำนวนสัญญา</th><th>รายได้/เดือน</th><th>ใกล้หมดอายุ</th><th>หนี้ค้าง</th><th>อัตราต่ออายุ</th></tr></thead>
              <tbody>
                {stationData.map((s, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{s.station}</td>
                    <td>{s.contracts} ฉบับ</td>
                    <td style={{ fontWeight: 600 }}>฿{(s.revenue / 1000000).toFixed(2)}M</td>
                    <td><span className="badge badge-expiring">{Math.floor(s.contracts * 0.08)} ฉบับ</span></td>
                    <td style={{ color: 'var(--srt-red)' }}>฿{(Math.random() * 500000).toFixed(0)}</td>
                    <td><span className="badge badge-active">{(85 + Math.random() * 10).toFixed(1)}%</span></td>
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
