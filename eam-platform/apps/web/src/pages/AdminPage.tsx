import { useEffect, useState } from 'react';
import { api, ApiClientError } from '../api';

/** ตั้งค่า: lookup + custom field — "config ก่อน code" (EAM-PRN-003) */
export default function AdminPage() {
  const [tab, setTab] = useState<'lookups' | 'fields' | 'workflow'>('lookups');
  return (
    <>
      <h1>ตั้งค่าระบบ</h1>
      <div className="toolbar">
        <button className={'btn' + (tab !== 'lookups' ? ' secondary' : '')} onClick={() => setTab('lookups')}>Lookup / Master data</button>
        <button className={'btn' + (tab !== 'fields' ? ' secondary' : '')} onClick={() => setTab('fields')}>Custom fields</button>
        <button className={'btn' + (tab !== 'workflow' ? ' secondary' : '')} onClick={() => setTab('workflow')}>Workflow</button>
      </div>
      {tab === 'lookups' && <LookupsTab />}
      {tab === 'fields' && <FieldsTab />}
      {tab === 'workflow' && <WorkflowTab />}
    </>
  );
}

function LookupsTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ type_code: '', code: '', name_th: '', name_en: '', color: '' });
  const [err, setErr] = useState('');
  const load = () => api('/api/v1/admin/lookups').then((r) => setRows(r.data));
  useEffect(() => { load(); }, []);

  const save = async () => {
    setErr('');
    try {
      await api('/api/v1/admin/lookups', { method: 'POST', body: { ...form, color: form.color || undefined } });
      setForm({ type_code: form.type_code, code: '', name_th: '', name_en: '', color: '' });
      load();
    } catch (e) {
      setErr(e instanceof ApiClientError ? e.message : String(e));
    }
  };

  return (
    <div className="detail-grid">
      <table className="list">
        <thead><tr><th>type</th><th>code</th><th>ชื่อ (ไทย)</th><th>สี</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.type_code}</td><td>{r.code}</td><td>{r.name_th}</td>
              <td>{r.color && <span className="badge" style={{ background: r.color }}>{r.color}</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="panel">
        <h2>เพิ่ม/แก้ค่า (upsert ตาม type+code)</h2>
        <label>type_code *</label>
        <input value={form.type_code} onChange={(e) => setForm({ ...form, type_code: e.target.value })}
          placeholder="เช่น meter_type" />
        <label>code *</label>
        <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
        <label>ชื่อ (ไทย) *</label>
        <input value={form.name_th} onChange={(e) => setForm({ ...form, name_th: e.target.value })} />
        <label>ชื่อ (อังกฤษ) *</label>
        <input value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} />
        <label>สี (hex — ใช้เป็นสีหมุดบนแผนที่)</label>
        <input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="#0ea5e9" />
        {err && <div className="error-text">{err}</div>}
        <div className="actions"><button className="btn" onClick={save}>บันทึก</button></div>
      </div>
    </div>
  );
}

function FieldsTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ entity: 'asset', field_key: '', label_th: '', label_en: '', field_type: 'text', required: false });
  const [err, setErr] = useState('');
  const load = () => api('/api/v1/admin/custom-fields').then((r) => setRows(r.data));
  useEffect(() => { load(); }, []);

  const save = async () => {
    setErr('');
    try {
      await api('/api/v1/admin/custom-fields', { method: 'POST', body: form });
      load();
    } catch (e) {
      setErr(e instanceof ApiClientError ? e.message : String(e));
    }
  };

  return (
    <div className="detail-grid">
      <table className="list">
        <thead><tr><th>entity</th><th>key</th><th>ชื่อ</th><th>ชนิด</th><th>จำกัดประเภท</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.entity}</td><td>{r.field_key}</td><td>{r.label_th}</td>
              <td>{r.field_type}{r.required ? ' *' : ''}</td><td>{r.asset_type_code ?? 'ทุกประเภท'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="panel">
        <h2>เพิ่ม field ใหม่ — มีผลทันที ไม่ต้อง deploy</h2>
        <label>entity</label>
        <select value={form.entity} onChange={(e) => setForm({ ...form, entity: e.target.value })}>
          {['asset', 'work_order', 'meter', 'location'].map((x) => <option key={x}>{x}</option>)}
        </select>
        <label>field_key *</label>
        <input value={form.field_key} onChange={(e) => setForm({ ...form, field_key: e.target.value })} />
        <label>ป้ายชื่อ (ไทย) *</label>
        <input value={form.label_th} onChange={(e) => setForm({ ...form, label_th: e.target.value })} />
        <label>ป้ายชื่อ (อังกฤษ) *</label>
        <input value={form.label_en} onChange={(e) => setForm({ ...form, label_en: e.target.value })} />
        <label>ชนิด</label>
        <select value={form.field_type} onChange={(e) => setForm({ ...form, field_type: e.target.value })}>
          {['text', 'number', 'date', 'dropdown', 'checkbox', 'file'].map((x) => <option key={x}>{x}</option>)}
        </select>
        <label>
          <input type="checkbox" style={{ width: 'auto', marginRight: 6 }}
            checked={form.required} onChange={(e) => setForm({ ...form, required: e.target.checked })} />
          จำเป็นต้องกรอก
        </label>
        {err && <div className="error-text">{err}</div>}
        <div className="actions"><button className="btn" onClick={save}>บันทึก</button></div>
      </div>
    </div>
  );
}

function WorkflowTab() {
  const [defs, setDefs] = useState<any[]>([]);
  useEffect(() => {
    api('/api/v1/admin/workflows').then((r) => setDefs(r.data));
  }, []);
  return (
    <>
      {defs.map((d) => (
        <div className="panel" key={d.id}>
          <h2>{d.name} ({d.entity})</h2>
          <div className="toolbar">
            {d.states.map((s: any) => (
              <span key={s.code} className="badge" style={{ background: s.color ?? '#6b7280' }}>
                {s.name_th}{s.is_initial ? ' ▶' : ''}{s.is_terminal ? ' ■' : ''}
              </span>
            ))}
          </div>
          <table className="list">
            <thead><tr><th>จาก</th><th>ไป</th><th>ชื่อปุ่ม</th><th>ต้องเป็น role</th></tr></thead>
            <tbody>
              {d.transitions.map((t: any, i: number) => (
                <tr key={i}><td>{t.from}</td><td>{t.to}</td><td>{t.name_th}</td><td>{t.required_role ?? 'ทุกคน'}</td></tr>
              ))}
            </tbody>
          </table>
          <div className="hint">state machine เก็บเป็นข้อมูลใน ext.wf_* — แก้ผ่าน SQL/API ได้โดยไม่ deploy (UI แก้ไข: Phase 2)</div>
        </div>
      ))}
    </>
  );
}
