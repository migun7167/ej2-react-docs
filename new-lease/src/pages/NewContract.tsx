import React, { useState } from 'react';
import { FileText, ChevronRight, ChevronLeft, CheckCircle, AlertTriangle, Save, Send } from 'lucide-react';

const steps = [
  'รับข้อมูลคำขอ', 'ข้อมูลสัญญา', 'เลือก Template', 'เงื่อนไขสัญญา',
  'ตรวจสอบเอกสาร', 'ตรวจสอบการเงิน', 'ตรวจสอบทรัพย์สิน', 'ส่งอนุมัติ'
];

const contractTypes = ['ร้านค้า', 'พื้นที่พาณิชย์', 'ที่ดิน', 'อาคาร', 'ป้ายโฆษณา', 'ลานจอดรถ', 'ห้องพัก'];
const stations = ['สถานีกรุงเทพ', 'สถานีหัวลำโพง', 'สถานีเชียงใหม่', 'สถานีโคราช', 'สถานีอยุธยา', 'สถานีลาดกระบัง', 'สถานีบ้านภาชี', 'สถานีพระนครศรีอยุธยา'];

const clauses = [
  { id: 'C1', name: 'ข้อ 1 - วัตถุประสงค์การเช่า', text: 'ผู้เช่าตกลงเช่าและผู้ให้เช่าตกลงให้เช่าพื้นที่ตามที่ระบุในสัญญานี้เพื่อวัตถุประสงค์...', required: true, approved: true },
  { id: 'C2', name: 'ข้อ 2 - ระยะเวลาการเช่า', text: 'ระยะเวลาการเช่ามีกำหนด... ปี นับแต่วันที่...', required: true, approved: true },
  { id: 'C3', name: 'ข้อ 3 - ค่าเช่าและการชำระเงิน', text: 'ผู้เช่าตกลงชำระค่าเช่าเดือนละ... บาท ภายในวันที่ 5 ของทุกเดือน...', required: true, approved: true },
  { id: 'C4', name: 'ข้อ 4 - เงินประกัน', text: 'ผู้เช่าตกลงวางเงินประกันจำนวน... บาท ก่อนวันเริ่มสัญญา...', required: true, approved: true },
  { id: 'C5', name: 'ข้อ 5 - การใช้ทรัพย์สิน', text: 'ผู้เช่าจะต้องใช้ทรัพย์สินตามวัตถุประสงค์ที่ระบุในสัญญาเท่านั้น...', required: true, approved: true },
  { id: 'C6', name: 'ข้อ 6 - การซ่อมแซมและบำรุงรักษา', text: 'ผู้เช่ารับผิดชอบการซ่อมแซมเล็กน้อยภายในทรัพย์สิน...', required: false, approved: true },
  { id: 'C7', name: 'ข้อ 7 - การต่ออายุสัญญา', text: 'สัญญาอาจต่ออายุได้โดยการตกลงร่วมกันล่วงหน้าไม่น้อยกว่า 90 วัน...', required: false, approved: true },
  { id: 'C8', name: 'ข้อ 8 - การบอกเลิกสัญญา', text: 'ฝ่ายใดฝ่ายหนึ่งสามารถบอกเลิกสัญญาโดยแจ้งล่วงหน้าไม่น้อยกว่า 30 วัน...', required: true, approved: true },
  { id: 'C9', name: 'ข้อ 9 - ค่าปรับผิดนัดชำระ', text: 'กรณีผู้เช่าชำระค่าเช่าล่าช้า จะถูกปรับในอัตรา 1.5% ต่อเดือน...', required: false, approved: true },
  { id: 'C10', name: 'ข้อ 10 - การส่งคืนทรัพย์สิน', text: 'เมื่อสิ้นสุดสัญญา ผู้เช่าต้องส่งคืนทรัพย์สินในสภาพที่ดีและสะอาดเรียบร้อย...', required: true, approved: true },
];

const docChecklist = [
  { id: 'D1', name: 'สำเนาบัตรประชาชน/หนังสือจดทะเบียน', required: true, uploaded: true },
  { id: 'D2', name: 'หนังสือมอบอำนาจ (ถ้ามี)', required: false, uploaded: false },
  { id: 'D3', name: 'หลักฐานชำระเงินมัดจำ', required: true, uploaded: true },
  { id: 'D4', name: 'แผนผังที่ตั้งทรัพย์สิน', required: true, uploaded: true },
  { id: 'D5', name: 'ภาพถ่ายทรัพย์สิน', required: true, uploaded: false },
  { id: 'D6', name: 'หนังสือรับรองบริษัท (นิติบุคคล)', required: false, uploaded: false },
  { id: 'D7', name: 'บัญชีผู้ถือหุ้น (นิติบุคคล)', required: false, uploaded: false },
];

export default function NewContract() {
  const [step, setStep] = useState(0);
  const [selectedClauses, setSelectedClauses] = useState<string[]>(['C1', 'C2', 'C3', 'C4', 'C5', 'C8', 'C10']);
  const [form, setForm] = useState({
    leaseRequestId: 'LR-2567-0892',
    tenantName: 'บริษัท ออมสิน มาร์เก็ต จำกัด',
    tenantId: '0105560987654',
    tenantType: 'นิติบุคคล',
    phone: '02-345-6789',
    email: 'contact@osm-market.com',
    type: 'ร้านค้า',
    assetCode: 'BKK-B2-012',
    assetName: 'ร้านค้าชั้น 1 อาคาร B ห้องที่ 12',
    station: 'สถานีกรุงเทพ',
    area: '35',
    monthlyRent: '22000',
    deposit: '66000',
    startDate: '2567-08-01',
    endDate: '2569-07-31',
    purpose: 'จำหน่ายอาหารและเครื่องดื่ม',
    specialConditions: '',
    templateId: 'TPL001',
    officer: 'นางสาวมาลี รักไทย',
  });

  const toggleClause = (id: string) => {
    setSelectedClauses(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const StepContent = () => {
    switch (step) {
      case 0:
        return (
          <div>
            <div className="alert alert-info"><CheckCircle size={14} /> รับข้อมูลจากระบบ Lease Request & Approval</div>
            <div className="grid grid-2" style={{ gap: 12 }}>
              <div className="form-group">
                <label className="form-label">เลขที่คำขอเช่า <span className="required">*</span></label>
                <input className="form-control" value={form.leaseRequestId} readOnly style={{ background: '#f8fafc' }} />
              </div>
              <div className="form-group">
                <label className="form-label">สถานะการอนุมัติ</label>
                <input className="form-control" value="อนุมัติแล้ว" readOnly style={{ background: '#f0fdf4', color: 'var(--srt-green)', fontWeight: 600 }} />
              </div>
              <div className="form-group">
                <label className="form-label">ชื่อผู้เช่า <span className="required">*</span></label>
                <input className="form-control" value={form.tenantName} onChange={e => setForm({...form, tenantName: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">ประเภทผู้เช่า</label>
                <select className="form-control" value={form.tenantType} onChange={e => setForm({...form, tenantType: e.target.value})}>
                  <option>บุคคลธรรมดา</option>
                  <option>นิติบุคคล</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">เลขบัตร/ทะเบียนนิติบุคคล <span className="required">*</span></label>
                <input className="form-control" value={form.tenantId} onChange={e => setForm({...form, tenantId: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">เบอร์โทรศัพท์</label>
                <input className="form-control" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">อีเมล</label>
                <input className="form-control" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div>
            <div className="grid grid-2" style={{ gap: 12 }}>
              <div className="form-group">
                <label className="form-label">ประเภทสัญญา <span className="required">*</span></label>
                <select className="form-control" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  {contractTypes.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">รหัสทรัพย์สิน <span className="required">*</span></label>
                <input className="form-control" value={form.assetCode} onChange={e => setForm({...form, assetCode: e.target.value})} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">ชื่อทรัพย์สิน <span className="required">*</span></label>
                <input className="form-control" value={form.assetName} onChange={e => setForm({...form, assetName: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">สถานี <span className="required">*</span></label>
                <select className="form-control" value={form.station} onChange={e => setForm({...form, station: e.target.value})}>
                  {stations.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">พื้นที่ (ตร.ม.)</label>
                <input className="form-control" type="number" value={form.area} onChange={e => setForm({...form, area: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">ค่าเช่า/เดือน (บาท) <span className="required">*</span></label>
                <input className="form-control" type="number" value={form.monthlyRent} onChange={e => setForm({...form, monthlyRent: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">เงินประกัน (บาท) <span className="required">*</span></label>
                <input className="form-control" type="number" value={form.deposit} onChange={e => setForm({...form, deposit: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">วันเริ่มสัญญา <span className="required">*</span></label>
                <input className="form-control" type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">วันสิ้นสุดสัญญา <span className="required">*</span></label>
                <input className="form-control" type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">วัตถุประสงค์การเช่า</label>
                <textarea className="form-control" value={form.purpose} onChange={e => setForm({...form, purpose: e.target.value})} rows={3} />
              </div>
              <div className="form-group">
                <label className="form-label">เจ้าหน้าที่สัญญา <span className="required">*</span></label>
                <input className="form-control" value={form.officer} onChange={e => setForm({...form, officer: e.target.value})} />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <div className="alert alert-info"><FileText size={14} /> เลือก Template สัญญาที่เหมาะสมกับประเภทสัญญา</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { id: 'TPL001', name: 'สัญญาเช่าพื้นที่ร้านค้าในสถานี v3.2', type: 'ร้านค้า', clauses: 24, approved: true },
                { id: 'TPL006', name: 'สัญญาเช่าพื้นที่พาณิชยกรรม v3.1', type: 'พื้นที่พาณิชย์', clauses: 26, approved: true },
              ].map(t => (
                <div key={t.id} onClick={() => setForm({...form, templateId: t.id})} style={{ cursor: 'pointer', border: `2px solid ${form.templateId === t.id ? 'var(--srt-navy)' : 'var(--srt-gray-200)'}`, borderRadius: 10, padding: 16, background: form.templateId === t.id ? '#f0f4ff' : '#fff', transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, background: form.templateId === t.id ? 'var(--srt-navy)' : 'var(--srt-gray-100)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={18} color={form.templateId === t.id ? '#fff' : 'var(--srt-gray-400)'} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{t.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--srt-gray-500)' }}>{t.type} · {t.clauses} ข้อ</div>
                    </div>
                    {t.approved && <span className="badge badge-active">อนุมัติแล้ว</span>}
                    {form.templateId === t.id && <CheckCircle size={20} color="var(--srt-navy)" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <div className="alert alert-info"><FileText size={14} /> เลือกข้อเงื่อนไขที่ต้องการใส่ในสัญญา (สีเขียว = ข้อบังคับ)</div>
            {clauses.map(c => (
              <div key={c.id} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--srt-gray-100)', alignItems: 'flex-start' }}>
                <input type="checkbox" checked={selectedClauses.includes(c.id)} onChange={() => !c.required && toggleClause(c.id)} disabled={c.required} style={{ marginTop: 3, cursor: c.required ? 'not-allowed' : 'pointer', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</span>
                    {c.required && <span className="badge" style={{ background: '#fee2e2', color: '#b91c1c' }}>บังคับ</span>}
                    {c.approved && <span className="badge badge-active">ผ่านกฎหมาย</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--srt-gray-500)', marginTop: 4 }}>{c.text}</div>
                </div>
              </div>
            ))}
            <div style={{ marginTop: 16, padding: 12, background: 'var(--srt-gray-50)', borderRadius: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>เลือก {selectedClauses.length} จาก {clauses.length} ข้อ</span>
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            <div className="alert alert-warning"><AlertTriangle size={14} /> กรุณาตรวจสอบและอัปโหลดเอกสารให้ครบก่อนดำเนินการ</div>
            {docChecklist.map(d => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--srt-gray-100)' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: d.uploaded ? 'var(--srt-green)' : 'var(--srt-gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle size={14} color={d.uploaded ? '#fff' : 'var(--srt-gray-400)'} />
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{d.name}</span>
                  {d.required && <span className="badge badge-high" style={{ marginLeft: 8 }}>จำเป็น</span>}
                </div>
                {d.uploaded ? (
                  <span className="badge badge-active">อัปโหลดแล้ว</span>
                ) : (
                  <button className="btn btn-outline btn-sm">อัปโหลด</button>
                )}
              </div>
            ))}
            <div style={{ marginTop: 16, padding: 12, background: 'var(--srt-gray-50)', borderRadius: 8 }}>
              <span style={{ fontSize: 13 }}>อัปโหลดแล้ว: <strong>{docChecklist.filter(d => d.uploaded).length}</strong> / {docChecklist.length} รายการ
              <span style={{ color: 'var(--srt-orange)', marginLeft: 8 }}>⚠ ขาดเอกสารจำเป็น {docChecklist.filter(d => d.required && !d.uploaded).length} รายการ</span></span>
            </div>
          </div>
        );
      case 5:
        return (
          <div>
            <div className="grid grid-3 mb-4" style={{ gap: 12 }}>
              {[
                { label: 'ค่าเช่า/เดือน', value: `฿${parseInt(form.monthlyRent).toLocaleString()}`, ok: true },
                { label: 'เงินประกัน', value: `฿${parseInt(form.deposit).toLocaleString()}`, ok: true },
                { label: 'ราคาต่อ ตร.ม.', value: `฿${Math.round(parseInt(form.monthlyRent) / parseInt(form.area || '1')).toLocaleString()}/ตร.ม.`, ok: true },
                { label: 'หนี้ค้างชำระ', value: 'ไม่มี', ok: true },
                { label: 'เงินมัดจำรับแล้ว', value: '฿22,000', ok: true },
                { label: 'ราคาตลาด', value: '฿20,000 - ฿25,000', ok: true },
              ].map((item, i) => (
                <div key={i} className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckCircle size={16} color={item.ok ? 'var(--srt-green)' : 'var(--srt-red)'} />
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--srt-gray-500)' }}>{item.label}</div>
                    <div style={{ fontWeight: 700 }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="alert alert-success"><CheckCircle size={14} /> การตรวจสอบการเงินผ่าน - ไม่พบหนี้ค้าง เงินมัดจำรับครบ ราคาค่าเช่าอยู่ในเกณฑ์ที่กำหนด</div>
          </div>
        );
      case 6:
        return (
          <div>
            <div className="alert alert-success"><CheckCircle size={14} /> ทรัพย์สินพร้อมให้เช่า ไม่มีสัญญาทับซ้อน</div>
            <div className="grid grid-2" style={{ gap: 12 }}>
              <div className="card" style={{ padding: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 12 }}>ข้อมูลทรัพย์สิน</div>
                {[['รหัส', form.assetCode], ['ชื่อ', form.assetName], ['สถานี', form.station], ['พื้นที่', form.area + ' ตร.ม.'], ['สถานะ', 'ว่างพร้อมให้เช่า']].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: '1px solid var(--srt-gray-100)' }}>
                    <span style={{ color: 'var(--srt-gray-500)' }}>{k}</span>
                    <span style={{ fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>
              <div className="map-placeholder">
                🗺️ แผนที่ตำแหน่งทรัพย์สิน<br />
                <span style={{ fontSize: 11 }}>สถานีกรุงเทพ - อาคาร B ชั้น 1</span>
              </div>
            </div>
          </div>
        );
      case 7:
        return (
          <div>
            <div className="alert alert-warning"><AlertTriangle size={14} /> กรุณาตรวจสอบสรุปข้อมูลทั้งหมดก่อนส่งอนุมัติ</div>
            <div className="card" style={{ padding: 16, marginBottom: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 15 }}>สรุปสัญญาที่จะสร้าง</div>
              <div className="grid grid-2" style={{ gap: 8 }}>
                {[
                  ['ผู้เช่า', form.tenantName], ['ประเภทสัญญา', form.type],
                  ['ทรัพย์สิน', form.assetName], ['สถานี', form.station],
                  ['ค่าเช่า/เดือน', '฿' + parseInt(form.monthlyRent).toLocaleString()],
                  ['เงินประกัน', '฿' + parseInt(form.deposit).toLocaleString()],
                  ['วันเริ่มสัญญา', form.startDate], ['วันสิ้นสุด', form.endDate],
                  ['Template', 'สัญญาเช่าพื้นที่ร้านค้า v3.2'], ['จำนวนข้อ', selectedClauses.length + ' ข้อ'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '8px 0', borderBottom: '1px solid var(--srt-gray-100)' }}>
                    <span style={{ color: 'var(--srt-gray-500)' }}>{k}</span>
                    <span style={{ fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 12 }}>ขั้นตอนอนุมัติที่จะเกิดขึ้น</div>
              {[
                { step: 1, name: 'ฝ่ายกฎหมาย', sla: '3 วันทำการ' },
                { step: 2, name: 'ฝ่ายการเงิน', sla: '2 วันทำการ' },
                { step: 3, name: 'ผู้อำนวยการฝ่ายทรัพย์สิน', sla: '3 วันทำการ' },
              ].map(a => (
                <div key={a.step} className="approval-step">
                  <div className="approval-step-num">{a.step}</div>
                  <div className="approval-step-info">
                    <div className="approval-step-name">{a.name}</div>
                    <div className="approval-step-role">SLA: {a.sla}</div>
                  </div>
                  <span className="badge badge-pending">รอดำเนินการ</span>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-title"><FileText size={22} /> สร้างสัญญาใหม่</div>
        <div className="page-header-sub">กระบวนการสร้างสัญญาแบบ Step-by-Step พร้อมตรวจสอบอัตโนมัติ</div>
      </div>

      {/* Step Bar */}
      <div className="card mb-4">
        <div className="card-body" style={{ padding: '20px 24px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            {steps.map((s, i) => (
              <React.Fragment key={i}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: i < steps.length - 1 ? 'none' : undefined }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, background: i < step ? 'var(--srt-green)' : i === step ? 'var(--srt-navy)' : 'var(--srt-gray-200)', color: i <= step ? '#fff' : 'var(--srt-gray-500)' }}>
                    {i < step ? <CheckCircle size={14} color="#fff" /> : i + 1}
                  </div>
                  <div style={{ fontSize: 10, marginTop: 6, color: i === step ? 'var(--srt-navy)' : 'var(--srt-gray-400)', fontWeight: i === step ? 600 : 400, textAlign: 'center', width: 70 }}>{s}</div>
                </div>
                {i < steps.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: i < step ? 'var(--srt-green)' : 'var(--srt-gray-200)', margin: '0 4px', marginBottom: 20 }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="card mb-4">
        <div className="card-header">
          <span className="card-title">ขั้นตอนที่ {step + 1}: {steps[step]}</span>
          <span style={{ fontSize: 12, color: 'var(--srt-gray-400)' }}>{step + 1} / {steps.length}</span>
        </div>
        <div className="card-body">
          <StepContent />
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn btn-ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
          <ChevronLeft size={14} /> ย้อนกลับ
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost"><Save size={14} /> บันทึกร่าง</button>
          {step < steps.length - 1 ? (
            <button className="btn btn-primary" onClick={() => setStep(step + 1)}>
              ถัดไป <ChevronRight size={14} />
            </button>
          ) : (
            <button className="btn btn-success">
              <Send size={14} /> ส่งอนุมัติ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
