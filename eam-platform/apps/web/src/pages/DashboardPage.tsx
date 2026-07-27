import { useEffect, useState } from 'react';
import { api } from '../api';

export default function DashboardPage() {
  const [s, setS] = useState<any>();
  useEffect(() => {
    api('/api/v1/dashboard/summary').then(setS).catch(console.error);
  }, []);
  if (!s) return <p>กำลังโหลด…</p>;
  return (
    <>
      <h1>ภาพรวม</h1>
      <div className="cards">
        <div className="card">
          <div className="num">{s.work_orders.open}</div>
          <div className="label">งานค้าง</div>
        </div>
        <div className={'card' + (s.work_orders.overdue ? ' warn' : '')}>
          <div className="num">{s.work_orders.overdue}</div>
          <div className="label">งานเกินกำหนด</div>
        </div>
        <div className="card">
          <div className="num">{s.work_orders.closed_this_month}</div>
          <div className="label">ปิดงานเดือนนี้</div>
        </div>
        <div className="card">
          <div className="num">{s.assets.total}</div>
          <div className="label">สินทรัพย์ทั้งหมด</div>
        </div>
        <div className={'card' + (s.assets.awaiting_repair ? ' warn' : '')}>
          <div className="num">{s.assets.awaiting_repair}</div>
          <div className="label">รอซ่อม</div>
        </div>
        <div className="card">
          <div className="num">{s.readings.this_month}</div>
          <div className="label">ค่าอ่านเดือนนี้</div>
        </div>
        <div className="card">
          <div className="num">{s.pm.due_7d}</div>
          <div className="label">PM ถึงกำหนดใน 7 วัน</div>
        </div>
      </div>
    </>
  );
}
