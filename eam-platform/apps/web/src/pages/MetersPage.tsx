import { useEffect, useState } from 'react';
import { api, ApiClientError } from '../api';

export default function MetersPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [entryFor, setEntryFor] = useState<any>(null);

  const load = () => api('/api/v1/meters').then((r) => setRows(r.data)).catch(console.error);
  useEffect(() => { load(); }, []);

  return (
    <>
      <h1>มิเตอร์</h1>
      <table className="list">
        <thead>
          <tr><th>รหัส</th><th>ชื่อ</th><th>ประเภท</th><th>ค่าล่าสุด</th><th>อ่านเมื่อ</th><th></th></tr>
        </thead>
        <tbody>
          {rows.map((m) => (
            <tr key={m.id}>
              <td>{m.code}</td>
              <td>{m.name}</td>
              <td>
                <span className="badge" style={{ background: m.type_color ?? '#6b7280' }}>{m.type_name ?? m.meter_type_code}</span>
              </td>
              <td>{m.last_reading ?? '-'} {m.unit}</td>
              <td>{m.last_reading_at ? new Date(m.last_reading_at).toLocaleDateString('th-TH') : '-'}</td>
              <td><button className="btn secondary" onClick={() => setEntryFor(m)}>บันทึกค่า</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {entryFor && <ReadingModal meter={entryFor} onClose={() => { setEntryFor(null); load(); }} />}
    </>
  );
}

/** ฟอร์มอ่านมิเตอร์ — โชว์ validation จริงจาก API (ถอยหลัง/กระโดด/rollover) */
function ReadingModal({ meter, onClose }: { meter: any; onClose: () => void }) {
  const [value, setValue] = useState('');
  const [note, setNote] = useState('');
  const [err, setErr] = useState('');
  const [needsForce, setNeedsForce] = useState(false);
  const [isRollover, setIsRollover] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    api(`/api/v1/meters/${meter.id}/readings?limit=5`).then((r) => setHistory(r.data));
  }, [meter.id]);

  const save = async (force = false) => {
    setErr('');
    try {
      await api(`/api/v1/meters/${meter.id}/readings`, {
        method: 'POST',
        body: { value: Number(value), note: note || undefined, force, is_rollover: isRollover },
        idempotencyKey: crypto.randomUUID(),
      });
      onClose();
    } catch (e) {
      if (e instanceof ApiClientError) {
        setErr(e.message);
        if (e.code === 'METER_READING_BACKWARD' || e.code === 'METER_READING_JUMP') setNeedsForce(true);
      } else setErr(String(e));
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>บันทึกค่าอ่าน — {meter.code}</h2>
        <div className="hint">ค่าล่าสุด: {meter.last_reading ?? '-'} {meter.unit}</div>
        <label>ค่าที่อ่านได้ ({meter.unit}) *</label>
        <input type="number" value={value} onChange={(e) => setValue(e.target.value)} autoFocus />
        <label>
          <input type="checkbox" style={{ width: 'auto', marginRight: 6 }}
            checked={isRollover} onChange={(e) => setIsRollover(e.target.checked)} />
          มิเตอร์วนรอบกลับศูนย์ (rollover)
        </label>
        <label>หมายเหตุ{needsForce ? ' * (จำเป็นเมื่อยืนยันค่าผิดปกติ)' : ''}</label>
        <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
        {err && <div className="error-text">{err}</div>}
        <div className="actions">
          <button className="btn secondary" onClick={onClose}>ยกเลิก</button>
          {needsForce && (
            <button className="btn" disabled={!note} onClick={() => save(true)}>ยืนยันค่าผิดปกติ</button>
          )}
          <button className="btn" disabled={!value} onClick={() => save(false)}>บันทึก</button>
        </div>
        <h2 style={{ marginTop: 18 }}>ประวัติ 5 งวดล่าสุด</h2>
        <table className="list">
          <tbody>
            {history.map((h) => (
              <tr key={h.id}>
                <td>{new Date(h.reading_at).toLocaleDateString('th-TH')}</td>
                <td>{h.value}</td>
                <td className="hint">{h.delta != null ? `+${h.delta}` : ''} {h.is_rollover ? '(rollover)' : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
