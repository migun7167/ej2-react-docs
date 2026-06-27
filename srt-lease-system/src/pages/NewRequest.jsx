import { useState } from 'react';
import { ChevronRight, Upload, CheckCircle, Save, Send } from 'lucide-react';

const STEPS = ['ข้อมูลผู้ขอเช่า', 'ข้อมูลทรัพย์สิน', 'รายละเอียดการเช่า', 'เอกสารแนบ', 'ยืนยัน'];

const ASSET_TYPES = ['ที่ดิน', 'อาคาร', 'ห้อง', 'ป้ายโฆษณา', 'พื้นที่เชิงพาณิชย์'];
const APPLICANT_TYPES = ['บุคคลธรรมดา', 'นิติบุคคล'];

const REQUIRED_DOCS = {
  'บุคคลธรรมดา': ['สำเนาบัตรประชาชน', 'สำเนาทะเบียนบ้าน', 'แผนผังที่ตั้งกิจการ', 'รูปถ่ายพื้นที่ที่ต้องการ'],
  'นิติบุคคล': ['สำเนาหนังสือรับรองบริษัท (ไม่เกิน 3 เดือน)', 'สำเนาบัตรประชาชนกรรมการ', 'แผนผังที่ตั้งกิจการ', 'หนังสือมอบอำนาจ (ถ้ามี)', 'รูปถ่ายพื้นที่ที่ต้องการ'],
};

export default function NewRequest({ navigate }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    applicantType: 'นิติบุคคล',
    applicantName: '',
    idNumber: '',
    phone: '',
    email: '',
    address: '',
    assetType: 'พื้นที่เชิงพาณิชย์',
    assetLocation: '',
    assetId: '',
    area: '',
    floor: '',
    purpose: '',
    requestedPeriod: '3',
    startDate: '',
    notes: '',
    uploadedDocs: [],
  });
  const [submitted, setSubmitted] = useState(false);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const docs = REQUIRED_DOCS[form.applicantType] || [];
  const completeness = Math.round(
    ([form.applicantName, form.idNumber, form.phone, form.assetLocation, form.purpose, form.area].filter(Boolean).length / 6) * 100
  );

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto mt-12 text-center">
        <div className="card p-10">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-srt-navy-dark mb-2">ยื่นคำขอสำเร็จ!</h2>
          <p className="text-gray-600 mb-1">เลขคำขอของคุณคือ</p>
          <div className="text-2xl font-bold text-srt-navy mb-4">LR-2566-0009</div>
          <p className="text-sm text-gray-500 mb-6">
            ระบบจะส่ง Email แจ้งสถานะการดำเนินการไปที่ {form.email || 'อีเมลที่ลงทะเบียน'}
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('requests')} className="btn-primary">ดูรายการคำขอ</button>
            <button onClick={() => { setSubmitted(false); setStep(0); setForm(f => ({ ...f, applicantName: '' })); }} className="btn-secondary">ยื่นคำขอใหม่</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Steps indicator */}
      <div className="card p-4">
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                  i < step ? 'bg-green-500 text-white' :
                  i === step ? 'bg-srt-navy text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {i < step ? <CheckCircle size={14} /> : i + 1}
                </div>
                <span className={`text-xs hidden sm:block ${i === step ? 'text-srt-navy font-medium' : 'text-gray-400'}`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 hidden sm:block ${i < step ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        {/* Completeness */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-srt-navy-dark">
            ขั้นตอนที่ {step + 1}: {STEPS[step]}
          </h2>
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-500">ความครบถ้วน</div>
            <div className="w-20 bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${completeness}%` }}></div>
            </div>
            <div className="text-xs font-medium text-green-600">{completeness}%</div>
          </div>
        </div>

        {/* Step 0: Applicant */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="form-label">ประเภทผู้ขอเช่า *</label>
              <div className="flex gap-3">
                {APPLICANT_TYPES.map(t => (
                  <label key={t} className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer flex-1 transition-all ${form.applicantType === t ? 'border-srt-navy bg-srt-navy/5' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="type" value={t} checked={form.applicantType === t} onChange={() => set('applicantType', t)} className="text-srt-navy" />
                    <span className="text-sm">{t}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="form-label">ชื่อ{form.applicantType === 'นิติบุคคล' ? 'บริษัท/องค์กร' : 'ผู้ขอเช่า'} *</label>
                <input value={form.applicantName} onChange={e => set('applicantName', e.target.value)} placeholder="ระบุชื่อ..." className="form-input" />
              </div>
              <div>
                <label className="form-label">{form.applicantType === 'นิติบุคคล' ? 'เลขทะเบียนนิติบุคคล' : 'เลขบัตรประชาชน'} *</label>
                <input value={form.idNumber} onChange={e => set('idNumber', e.target.value)} placeholder="0-0000-00000-00-0" className="form-input" />
              </div>
              <div>
                <label className="form-label">เบอร์โทรศัพท์ *</label>
                <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="08X-XXXXXXX" className="form-input" />
              </div>
              <div className="col-span-2">
                <label className="form-label">Email</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="example@email.com" className="form-input" />
              </div>
              <div className="col-span-2">
                <label className="form-label">ที่อยู่ติดต่อ</label>
                <textarea value={form.address} onChange={e => set('address', e.target.value)} rows={2} placeholder="ที่อยู่สำหรับติดต่อ..." className="form-input resize-none" />
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Asset */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="form-label">ประเภททรัพย์สินที่ต้องการเช่า *</label>
              <div className="grid grid-cols-3 gap-2">
                {ASSET_TYPES.map(t => (
                  <label key={t} className={`flex flex-col items-center gap-1 p-3 border rounded-lg cursor-pointer transition-all text-center ${form.assetType === t ? 'border-srt-navy bg-srt-navy/5' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="assetType" value={t} checked={form.assetType === t} onChange={() => set('assetType', t)} className="sr-only" />
                    <span className="text-lg">{t === 'ที่ดิน' ? '🏞️' : t === 'อาคาร' ? '🏢' : t === 'ห้อง' ? '🚪' : t === 'ป้ายโฆษณา' ? '📋' : '🏪'}</span>
                    <span className="text-xs font-medium">{t}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="form-label">สถานที่/สถานีที่ต้องการ *</label>
                <select value={form.assetLocation} onChange={e => set('assetLocation', e.target.value)} className="form-select">
                  <option value="">-- เลือกสถานี --</option>
                  {['สถานีกรุงเทพ', 'สถานีบางซื่อ', 'สถานีหัวหมาก', 'สถานีดอนเมือง', 'สถานีลาดกระบัง', 'สถานีพระประแดง', 'สถานีพัทยา', 'สถานีฉะเชิงเทรา'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">พื้นที่ที่ต้องการ (ตร.ม.) *</label>
                <input type="number" value={form.area} onChange={e => set('area', e.target.value)} placeholder="เช่น 50" className="form-input" />
              </div>
              <div>
                <label className="form-label">ชั้น/ตำแหน่ง</label>
                <input value={form.floor} onChange={e => set('floor', e.target.value)} placeholder="เช่น ชั้น 1" className="form-input" />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Lease Details */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="form-label">วัตถุประสงค์การเช่า *</label>
              <select value={form.purpose} onChange={e => set('purpose', e.target.value)} className="form-select">
                <option value="">-- เลือกวัตถุประสงค์ --</option>
                {['ร้านอาหาร', 'ร้านกาแฟ', 'ร้านค้าปลีก', 'สำนักงาน', 'คลังสินค้า', 'จอดรถ', 'ป้ายโฆษณา', 'อื่นๆ'].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">ระยะเวลาเช่า (ปี) *</label>
                <select value={form.requestedPeriod} onChange={e => set('requestedPeriod', e.target.value)} className="form-select">
                  {[1, 2, 3, 5, 10].map(y => <option key={y} value={String(y)}>{y} ปี</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">วันที่ต้องการเริ่มเช่า</label>
                <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} className="form-input" />
              </div>
              <div className="col-span-2">
                <label className="form-label">หมายเหตุ / เงื่อนไขเพิ่มเติม</label>
                <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} placeholder="ระบุข้อมูลเพิ่มเติม..." className="form-input resize-none" />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Documents */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
              <strong>เอกสารที่จำเป็นสำหรับ{form.applicantType}:</strong>
              <ul className="mt-2 space-y-1">
                {docs.map((d, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-srt-navy transition-colors cursor-pointer">
              <Upload size={32} className="mx-auto text-gray-400 mb-3" />
              <p className="text-sm text-gray-600">คลิกหรือลากไฟล์มาวางที่นี่</p>
              <p className="text-xs text-gray-400 mt-1">รองรับ PDF, JPG, PNG ขนาดไม่เกิน 10 MB ต่อไฟล์</p>
              <button className="mt-4 btn-secondary">เลือกไฟล์</button>
            </div>
            <div className="space-y-2">
              {docs.slice(0, 2).map((d, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle size={16} className="text-green-600" />
                  <div className="flex-1 text-sm text-gray-700">{d}</div>
                  <span className="text-xs text-green-600 font-medium">อัปโหลดแล้ว</span>
                </div>
              ))}
              {docs.slice(2).map((d, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-4 h-4 border-2 border-gray-300 rounded-full flex-shrink-0"></div>
                  <div className="flex-1 text-sm text-gray-500">{d}</div>
                  <span className="text-xs text-gray-400">ยังไม่อัปโหลด</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
              โปรดตรวจสอบข้อมูลก่อนยื่นคำขอ หากพบข้อผิดพลาดให้กดย้อนกลับเพื่อแก้ไข
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'ประเภทผู้ขอ', value: form.applicantType },
                { label: 'ชื่อผู้ขอ', value: form.applicantName || '-' },
                { label: 'เบอร์โทร', value: form.phone || '-' },
                { label: 'Email', value: form.email || '-' },
                { label: 'ประเภททรัพย์สิน', value: form.assetType },
                { label: 'สถานที่', value: form.assetLocation || '-' },
                { label: 'พื้นที่', value: form.area ? `${form.area} ตร.ม.` : '-' },
                { label: 'วัตถุประสงค์', value: form.purpose || '-' },
                { label: 'ระยะเวลา', value: `${form.requestedPeriod} ปี` },
                { label: 'วันเริ่มเช่า', value: form.startDate || '-' },
              ].map(item => (
                <div key={item.label} className="flex gap-2">
                  <span className="text-xs text-gray-500 w-32 flex-shrink-0">{item.label}:</span>
                  <span className="text-xs font-medium text-gray-800">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-4">
              <p className="text-xs text-gray-500">
                ข้าพเจ้ายืนยันว่าข้อมูลที่ระบุมีความถูกต้องและครบถ้วน พร้อมยอมรับเงื่อนไขการยื่นคำขอเช่าทรัพย์สินของการรถไฟแห่งประเทศไทย
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
          <div>
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} className="btn-secondary">ย้อนกลับ</button>
            )}
          </div>
          <div className="flex gap-3">
            <button className="btn-secondary flex items-center gap-2">
              <Save size={14} /> บันทึกร่าง
            </button>
            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep(s => s + 1)} className="btn-primary flex items-center gap-2">
                ถัดไป <ChevronRight size={14} />
              </button>
            ) : (
              <button onClick={() => setSubmitted(true)} className="btn-primary flex items-center gap-2">
                <Send size={14} /> ยื่นคำขอ
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
