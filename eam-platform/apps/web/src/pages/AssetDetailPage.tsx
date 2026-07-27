import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';

export default function AssetDetailPage() {
  const { id } = useParams();
  const [asset, setAsset] = useState<any>();
  const [timeline, setTimeline] = useState<any[]>([]);

  useEffect(() => {
    api(`/api/v1/assets/${id}`).then(setAsset).catch(console.error);
    api(`/api/v1/assets/${id}/timeline`).then((r) => setTimeline(r.data)).catch(console.error);
  }, [id]);

  if (!asset) return <p>กำลังโหลด…</p>;

  const kindLabel: Record<string, string> = {
    work_order: '🛠 ใบสั่งงาน',
    meter_reading: '⏱ ค่าอ่าน',
    audit: '✏️ แก้ไข',
  };

  return (
    <>
      <h1>{asset.code} — {asset.name}</h1>
      <div className="detail-grid">
        <div>
          <div className="panel">
            <h2>ข้อมูลทั่วไป</h2>
            <table className="list">
              <tbody>
                <tr><td>ประเภท</td><td>{asset.type_name ?? '-'}</td></tr>
                <tr><td>สถานที่</td><td>{asset.location_name ?? '-'}</td></tr>
                <tr><td>สถานะ</td><td>{asset.status_code}</td></tr>
                <tr><td>ความสำคัญ</td><td>{asset.criticality} / 5</td></tr>
                {asset.field_defs?.map((d: any) => (
                  <tr key={d.field_key}>
                    <td>{d.label_th}</td>
                    <td>{String(asset.custom_fields?.[d.field_key] ?? '-')}</td>
                  </tr>
                ))}
                {asset.geo && (
                  <tr>
                    <td>พิกัด</td>
                    <td>
                      {Number(asset.geo.lat).toFixed(6)}, {Number(asset.geo.lng).toFixed(6)}{' '}
                      <span className="hint">(±{asset.geo.accuracy_m ?? '?'} ม. · {asset.geo.source})</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="panel">
            <h2>มิเตอร์</h2>
            <table className="list">
              <thead><tr><th>รหัส</th><th>ชื่อ</th><th>ค่าล่าสุด</th></tr></thead>
              <tbody>
                {asset.meters.map((m: any) => (
                  <tr key={m.id}>
                    <td>{m.code}</td>
                    <td>{m.name}</td>
                    <td>{m.last_reading ?? '-'} {m.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="panel">
          <h2>ประวัติ (timeline)</h2>
          {timeline.map((t, i) => (
            <div key={i} className="timeline-item">
              <div className="when">{new Date(t.at).toLocaleString('th-TH')}</div>
              <div>
                {kindLabel[t.kind] ?? t.kind}{' '}
                {t.kind === 'work_order' && `${t.detail.code}: ${t.detail.title} (${t.detail.status})`}
                {t.kind === 'meter_reading' && `${t.detail.meter} = ${t.detail.value} ${t.detail.unit}`}
                {t.kind === 'audit' && t.detail.action}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
