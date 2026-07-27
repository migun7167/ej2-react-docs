import { useEffect, useState } from 'react';
import { api, ApiClientError } from '../api';

export default function WorkOrdersPage() {
  const [board, setBoard] = useState<any>();
  const [selected, setSelected] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = () => api('/api/v1/work-orders/views/kanban').then(setBoard).catch(console.error);
  useEffect(() => { load(); }, []);

  return (
    <>
      <h1>ใบสั่งงาน</h1>
      <div className="toolbar">
        <button className="btn" onClick={() => setShowCreate(true)}>+ แจ้งงาน</button>
      </div>
      {!board ? <p>กำลังโหลด…</p> : (
        <div className="kanban">
          {board.columns.map((c: any) => (
            <div className="col" key={c.code}>
              <h3>
                <span style={{ color: c.color }}>{c.name_th}</span>
                <span>{c.items.length}</span>
              </h3>
              {c.items.map((w: any) => (
                <div className="item" key={w.id} onClick={() => setSelected(w.id)}>
                  <div className="code">{w.code} {w.asset_code ? `· ${w.asset_code}` : ''}</div>
                  <div>{w.title}</div>
                  <div className="code">
                    <span className="badge" style={{ background: w.priority_color ?? '#6b7280' }}>{w.priority_name ?? w.priority_code}</span>{' '}
                    {w.assigned_name ?? 'ยังไม่มอบหมาย'}
                    {w.due_date ? ` · กำหนด ${new Date(w.due_date).toLocaleDateString('th-TH')}` : ''}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      {selected && <WoDetailModal id={selected} onClose={() => { setSelected(null); load(); }} />}
      {showCreate && <CreateWoModal onClose={() => { setShowCreate(false); load(); }} />}
    </>
  );
}

function WoDetailModal({ id, onClose }: { id: string; onClose: () => void }) {
  const [wo, setWo] = useState<any>();
  const [err, setErr] = useState('');

  const load = () => api(`/api/v1/work-orders/${id}`).then(setWo).catch(console.error);
  useEffect(() => { load(); }, [id]);

  const doTransition = async (to: string) => {
    setErr('');
    try {
      await api(`/api/v1/work-orders/${id}/transitions`, { method: 'POST', body: { to } });
      load();
    } catch (e) {
      setErr(e instanceof ApiClientError ? e.message : String(e));
    }
  };

  const toggleTask = async (t: any) => {
    await api(`/api/v1/work-orders/${id}/tasks/${t.id}`, { method: 'PATCH', body: { is_done: !t.is_done } });
    load();
  };

  if (!wo) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{wo.code} — {wo.title}</h2>
        <div className="hint">
          สถานะ: <b>{wo.status_code}</b> · {wo.asset_name ?? '-'} · ผู้รับผิดชอบ: {wo.assigned_name ?? '-'}
        </div>
        {wo.description && <p>{wo.description}</p>}

        {wo.tasks.length > 0 && (
          <>
            <h2>งานย่อย</h2>
            {wo.tasks.map((t: any) => (
              <label key={t.id} style={{ fontWeight: 'normal' }}>
                <input type="checkbox" style={{ width: 'auto', marginRight: 6 }}
                  checked={t.is_done} onChange={() => toggleTask(t)} />
                {t.name}
              </label>
            ))}
          </>
        )}

        <h2 style={{ marginTop: 14 }}>เปลี่ยนสถานะ</h2>
        <div className="toolbar">
          {wo.transitions.length === 0 && <span className="hint">งานอยู่สถานะสุดท้ายแล้ว</span>}
          {wo.transitions.map((t: any) => (
            <button key={t.to} className="btn secondary" onClick={() => doTransition(t.to)}>
              {t.name_th}{t.required_role ? ` (${t.required_role})` : ''}
            </button>
          ))}
        </div>
        {err && <div className="error-text">{err}</div>}

        <h2 style={{ marginTop: 14 }}>บันทึกการทำงาน</h2>
        {wo.logs.map((l: any, i: number) => (
          <div key={i} className="timeline-item">
            <div className="when">{new Date(l.created_at).toLocaleString('th-TH')} · {l.by_name ?? 'system'}</div>
            <div>{l.action}{l.detail?.from ? `: ${l.detail.from} → ${l.detail.to}` : ''} {l.note ?? ''}</div>
          </div>
        ))}
        <div className="actions">
          <button className="btn secondary" onClick={onClose}>ปิด</button>
        </div>
      </div>
    </div>
  );
}

function CreateWoModal({ onClose }: { onClose: () => void }) {
  const [assets, setAssets] = useState<any[]>([]);
  const [priorities, setPriorities] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ title: '', description: '', asset_id: '', priority_code: 'normal' });
  const [err, setErr] = useState('');

  useEffect(() => {
    api('/api/v1/assets?limit=200').then((r) => setAssets(r.data));
    api('/api/v1/admin/lookups?type=wo_priority').then((r) => setPriorities(r.data));
  }, []);

  const save = async () => {
    setErr('');
    try {
      await api('/api/v1/work-orders', {
        method: 'POST',
        body: { ...form, asset_id: form.asset_id || undefined },
      });
      onClose();
    } catch (e) {
      setErr(e instanceof ApiClientError ? e.message : String(e));
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>แจ้งงาน / แจ้งซ่อม</h2>
        <label>เรื่อง *</label>
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus />
        <label>รายละเอียด</label>
        <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <label>สินทรัพย์</label>
        <select value={form.asset_id} onChange={(e) => setForm({ ...form, asset_id: e.target.value })}>
          <option value="">— ไม่ระบุ —</option>
          {assets.map((a) => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
        </select>
        <label>ความเร่งด่วน</label>
        <select value={form.priority_code} onChange={(e) => setForm({ ...form, priority_code: e.target.value })}>
          {priorities.map((p) => <option key={p.code} value={p.code}>{p.name_th}</option>)}
        </select>
        {err && <div className="error-text">{err}</div>}
        <div className="actions">
          <button className="btn secondary" onClick={onClose}>ยกเลิก</button>
          <button className="btn" disabled={!form.title} onClick={save}>ส่ง</button>
        </div>
      </div>
    </div>
  );
}
