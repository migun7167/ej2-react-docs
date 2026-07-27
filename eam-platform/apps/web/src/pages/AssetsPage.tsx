import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiClientError } from '../api';
import { GpsCapture, GpsFix } from '../components/GpsCapture';

export default function AssetsPage() {
  const nav = useNavigate();
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [statuses, setStatuses] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);

  const load = () => {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (status) p.set('filter[status]', status);
    api(`/api/v1/assets?${p}`).then((r) => setRows(r.data)).catch(console.error);
  };
  useEffect(load, [q, status]);
  useEffect(() => {
    api(`/api/v1/admin/lookups?type=asset_status`).then((r) => setStatuses(r.data));
  }, []);

  const statusOf = (code: string) => statuses.find((s) => s.code === code);

  return (
    <>
      <h1>สินทรัพย์</h1>
      <div className="toolbar">
        <input placeholder="ค้นหา รหัส/ชื่อ…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">ทุกสถานะ</option>
          {statuses.map((s) => (
            <option key={s.code} value={s.code}>{s.name_th}</option>
          ))}
        </select>
        <button className="btn" onClick={() => setShowCreate(true)}>+ เพิ่มสินทรัพย์</button>
      </div>
      <table className="list">
        <thead>
          <tr><th>รหัส</th><th>ชื่อ</th><th>ประเภท</th><th>สถานที่</th><th>สถานะ</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} onClick={() => nav(`/assets/${r.id}`)}>
              <td>{r.code}</td>
              <td>{r.name}</td>
              <td>{r.type_name ?? '-'}</td>
              <td>{r.location_name ?? '-'}</td>
              <td>
                <span className="badge" style={{ background: statusOf(r.status_code)?.color ?? '#6b7280' }}>
                  {statusOf(r.status_code)?.name_th ?? r.status_code}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showCreate && <CreateAssetModal onClose={() => { setShowCreate(false); load(); }} />}
    </>
  );
}

function CreateAssetModal({ onClose }: { onClose: () => void }) {
  const [types, setTypes] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [fieldDefs, setFieldDefs] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ code: '', name: '', type_code: '', location_id: '' });
  const [cf, setCf] = useState<Record<string, any>>({});
  const [gps, setGps] = useState<GpsFix | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    api('/api/v1/asset-types').then((r) => setTypes(r.data));
    api('/api/v1/locations').then((r) => setLocations(r.data));
  }, []);
  useEffect(() => {
    // custom field ตามประเภท (EAM-EXT-002)
    const t = types.find((x) => x.code === form.type_code);
    api(`/api/v1/admin/custom-fields?entity=asset`).then((r) =>
      setFieldDefs(r.data.filter((d: any) => !d.asset_type_id || d.asset_type_id === t?.id)),
    );
  }, [form.type_code, types]);

  const save = async () => {
    setErr('');
    try {
      await api('/api/v1/assets', {
        method: 'POST',
        body: {
          ...form,
          location_id: form.location_id || undefined,
          type_code: form.type_code || undefined,
          custom_fields: cf,
          geo: gps ?? undefined,
        },
      });
      onClose();
    } catch (e) {
      setErr(e instanceof ApiClientError ? e.message : String(e));
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>เพิ่มสินทรัพย์ (พร้อมพิกัดหน้างานในขั้นตอนเดียว)</h2>
        <label>รหัส *</label>
        <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
        <label>ชื่อ *</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <label>ประเภท</label>
        <select value={form.type_code} onChange={(e) => setForm({ ...form, type_code: e.target.value })}>
          <option value="">— ไม่ระบุ —</option>
          {types.map((t) => <option key={t.code} value={t.code}>{t.name_th}</option>)}
        </select>
        <label>สถานที่</label>
        <select value={form.location_id} onChange={(e) => setForm({ ...form, location_id: e.target.value })}>
          <option value="">— ไม่ระบุ —</option>
          {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
        {fieldDefs.map((d) => (
          <div key={d.field_key}>
            <label>{d.label_th}{d.required ? ' *' : ''}</label>
            {d.field_type === 'dropdown' ? (
              <select value={cf[d.field_key] ?? ''} onChange={(e) => setCf({ ...cf, [d.field_key]: e.target.value })}>
                <option value="">—</option>
                {d.options.map((o: string) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input
                type={d.field_type === 'number' ? 'number' : d.field_type === 'date' ? 'date' : 'text'}
                value={cf[d.field_key] ?? ''}
                onChange={(e) =>
                  setCf({ ...cf, [d.field_key]: d.field_type === 'number' ? Number(e.target.value) : e.target.value })}
              />
            )}
          </div>
        ))}
        <GpsCapture onFix={setGps} />
        {err && <div className="error-text">{err}</div>}
        <div className="actions">
          <button className="btn secondary" onClick={onClose}>ยกเลิก</button>
          <button className="btn" onClick={save}>บันทึก</button>
        </div>
      </div>
    </div>
  );
}
