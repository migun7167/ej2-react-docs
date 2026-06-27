import { useState } from 'react';
import { CheckCircle, Upload, X, ChevronRight, ChevronLeft, User, Building2, FileText, Paperclip, Check } from 'lucide-react';
import { mockAssets } from '../data/mockData';

const STEPS = [
  { label: 'ข้อมูลผู้ขอเช่า',     icon: User },
  { label: 'เลือกทรัพย์สิน',      icon: Building2 },
  { label: 'รายละเอียดการเช่า',   icon: FileText },
  { label: 'เอกสารประกอบ',        icon: Paperclip },
  { label: 'ยืนยันและส่งคำขอ',   icon: Check },
];

const ASSET_TYPES_LIST = [
  { value: 'ร้านค้า', emoji: '🏪' },
  { value: 'ร้านอาหาร', emoji: '🍽️' },
  { value: 'สำนักงาน', emoji: '🏢' },
  { value: 'แผงค้า', emoji: '🛒' },
  { value: 'พื้นที่โฆษณา', emoji: '📢' },
];

const PURPOSES = ['ร้านค้าทั่วไป','ร้านอาหาร/เครื่องดื่ม','ร้านกาแฟ','สำนักงาน','ธนาคาร/ATM','ร้านสะดวกซื้อ','ตู้เอทีเอ็ม','ร้านเสริมสวย','ร้านยา','อื่นๆ'];
const PERIODS = [{ v: 1, l: '1 ปี' }, { v: 2, l: '2 ปี' }, { v: 3, l: '3 ปี' }, { v: 5, l: '5 ปี' }, { v: 10, l: '10 ปี' }];
const STATIONS = [...new Set(mockAssets.map(a => a.location))];

const DOCS_PERSONAL = [
  'สำเนาบัตรประชาชน', 'สำเนาทะเบียนบ้าน', 'รูปถ่ายผู้ขอ 2 นิ้ว',
  'แผนธุรกิจ/วัตถุประสงค์', 'หลักฐานการเงินย้อนหลัง 6 เดือน',
];
const DOCS_CORPORATE = [
  'หนังสือรับรองบริษัท (ไม่เกิน 3 เดือน)', 'บัญชีรายชื่อผู้ถือหุ้น',
  'สำเนาบัตรประชาชนกรรมการผู้มีอำนาจ', 'งบการเงินปีล่าสุด (ตรวจสอบแล้ว)',
  'แผนธุรกิจ', 'หนังสือมอบอำนาจ (ถ้ามี)',
];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((step, i) => {
        const done    = i < current;
        const active  = i === current;
        const Icon    = step.icon;
        return (
          <div key={i} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all
                ${done   ? 'bg-green-500 border-green-500 text-white' : ''}
                ${active ? 'bg-srt-navy border-srt-navy text-white' : ''}
                ${!done && !active ? 'bg-white border-gray-200 text-gray-400' : ''}
              `}>
                {done ? <Check size={16} /> : <Icon size={15} />}
              </div>
              <div className={`text-[10px] mt-1 font-medium text-center w-20 leading-tight
                ${active ? 'text-srt-navy' : done ? 'text-green-600' : 'text-gray-400'}`}>
                {step.label}
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mb-5 mx-1 ${done ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function NewRequest({ navigate }) {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [refNo] = useState(`LR-2567-${String(Math.floor(1000 + Math.random() * 9000))}`);

  const [form, setForm] = useState({
    applicantType: 'บุคคลธรรมดา', name: '', idCard: '', taxId: '', phone: '', email: '',
    address: '', contactPerson: '',
    assetType: '', station: '', area: '', floor: '',
    purpose: '', period: 1, startDate: '', conditions: '', notes: '',
    docs: [],
    agreed: false,
  });

  const [assetCheck, setAssetCheck] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const up = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const checkAvailability = () => {
    const available = mockAssets.find(a => a.location === form.station && a.type === form.assetType && a.status === 'Available');
    setAssetCheck(available ? 'available' : 'unavailable');
  };

  const reqDocs = form.applicantType === 'บุคคลธรรมดา' ? DOCS_PERSONAL : DOCS_CORPORATE;

  const handleSubmit = () => {
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto card-p text-center py-12 mt-10">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={40} className="text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-srt-navy mb-2">ยื่นคำขอสำเร็จ!</h2>
        <p className="text-gray-500 text-sm mb-4">คำขอของท่านได้รับการบันทึกเรียบร้อยแล้ว</p>
        <div className="bg-srt-navy/5 rounded-2xl p-4 mb-6">
          <div className="text-xs text-gray-400 mb-1">เลขที่คำขอ</div>
          <div className="text-2xl font-bold text-srt-navy font-mono">{refNo}</div>
          <div className="text-xs text-gray-400 mt-2">กรุณาเก็บเลขที่คำขอไว้เพื่อติดตามสถานะ</div>
        </div>
        <div className="flex gap-3 justify-center">
          <button className="btn-white" onClick={() => navigate('requests')}>ดูรายการคำขอ</button>
          <button className="btn-navy" onClick={() => { setSubmitted(false); setStep(0); setForm({ applicantType:'บุคคลธรรมดา',name:'',idCard:'',taxId:'',phone:'',email:'',address:'',contactPerson:'',assetType:'',station:'',area:'',floor:'',purpose:'',period:1,startDate:'',conditions:'',notes:'',docs:[],agreed:false }); }}>
            ยื่นคำขอใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="card-p">
        <h2 className="text-lg font-bold text-srt-navy mb-6">ยื่นคำขอเช่าทรัพย์สิน</h2>
        <StepIndicator current={step} />

        {/* Step 1 */}
        {step === 0 && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-700 mb-3">ข้อมูลผู้ขอเช่า</h3>
            <div>
              <label className="lbl">ประเภทผู้ขอเช่า</label>
              <div className="flex gap-4">
                {['บุคคลธรรมดา','นิติบุคคล'].map(t => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" className="accent-srt-navy" checked={form.applicantType === t} onChange={() => up('applicantType', t)} />
                    <span className="text-sm">{t}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="lbl">ชื่อ-นามสกุล / ชื่อบริษัท</label><input className="inp" value={form.name} onChange={e => up('name', e.target.value)} placeholder="ระบุชื่อ" /></div>
              {form.applicantType === 'บุคคลธรรมดา'
                ? <div><label className="lbl">เลขบัตรประชาชน</label><input className="inp" value={form.idCard} onChange={e => up('idCard', e.target.value)} placeholder="13 หลัก" /></div>
                : <div><label className="lbl">เลขทะเบียนนิติบุคคล</label><input className="inp" value={form.taxId} onChange={e => up('taxId', e.target.value)} placeholder="13 หลัก" /></div>
              }
              <div><label className="lbl">เบอร์โทรศัพท์</label><input className="inp" value={form.phone} onChange={e => up('phone', e.target.value)} placeholder="0XX-XXX-XXXX" /></div>
              <div><label className="lbl">อีเมล</label><input className="inp" value={form.email} onChange={e => up('email', e.target.value)} placeholder="example@email.com" /></div>
              {form.applicantType === 'นิติบุคคล' && (
                <div><label className="lbl">ผู้ติดต่อ / ผู้รับมอบอำนาจ</label><input className="inp" value={form.contactPerson} onChange={e => up('contactPerson', e.target.value)} placeholder="ชื่อ-นามสกุล" /></div>
              )}
            </div>
            <div><label className="lbl">ที่อยู่ติดต่อ</label><textarea className="inp" rows={2} value={form.address} onChange={e => up('address', e.target.value)} placeholder="บ้านเลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์" /></div>
          </div>
        )}

        {/* Step 2 */}
        {step === 1 && (
          <div className="space-y-5">
            <h3 className="font-bold text-gray-700 mb-3">เลือกประเภทและทรัพย์สิน</h3>
            <div>
              <label className="lbl">ประเภททรัพย์สิน</label>
              <div className="grid grid-cols-5 gap-2">
                {ASSET_TYPES_LIST.map(t => (
                  <button
                    key={t.value}
                    onClick={() => { up('assetType', t.value); setAssetCheck(null); }}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-sm transition-all
                      ${form.assetType === t.value ? 'border-srt-navy bg-srt-navy/5 text-srt-navy font-bold' : 'border-gray-200 hover:border-srt-navy/40'}`}
                  >
                    <span className="text-2xl">{t.emoji}</span>
                    <span className="text-[11px] text-center leading-tight">{t.value}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="lbl">สถานี</label>
                <select className="sel" value={form.station} onChange={e => { up('station', e.target.value); setAssetCheck(null); }}>
                  <option value="">-- เลือกสถานี --</option>
                  {STATIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div><label className="lbl">พื้นที่ที่ต้องการ (ตร.ม.)</label><input type="number" className="inp" value={form.area} onChange={e => up('area', e.target.value)} placeholder="เช่น 45" /></div>
              <div><label className="lbl">ชั้น</label><input className="inp" value={form.floor} onChange={e => up('floor', e.target.value)} placeholder="เช่น G, 1, 2, B1" /></div>
            </div>
            {form.assetType && form.station && (
              <div>
                <button className="btn-white" onClick={checkAvailability}>ตรวจสอบความว่างของทรัพย์สิน</button>
                {assetCheck === 'available' && (
                  <div className="mt-3 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                    <CheckCircle size={18} className="text-green-500" />
                    <span className="text-green-700 text-sm font-medium">มีทรัพย์สินว่างตามเงื่อนไขที่ท่านระบุ</span>
                  </div>
                )}
                {assetCheck === 'unavailable' && (
                  <div className="mt-3 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    <X size={18} className="text-red-500" />
                    <span className="text-red-700 text-sm font-medium">ไม่พบทรัพย์สินว่างตามเงื่อนไข กรุณาเปลี่ยนประเภทหรือสถานี</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 3 */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-700 mb-3">รายละเอียดการเช่า</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="lbl">วัตถุประสงค์การเช่า</label>
                <select className="sel" value={form.purpose} onChange={e => up('purpose', e.target.value)}>
                  <option value="">-- เลือกวัตถุประสงค์ --</option>
                  {PURPOSES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="lbl">ระยะเวลาที่ต้องการเช่า</label>
                <select className="sel" value={form.period} onChange={e => up('period', Number(e.target.value))}>
                  {PERIODS.map(p => <option key={p.v} value={p.v}>{p.l}</option>)}
                </select>
              </div>
              <div>
                <label className="lbl">วันที่ต้องการเริ่มเช่า (โดยประมาณ)</label>
                <input type="date" className="inp" value={form.startDate} onChange={e => up('startDate', e.target.value)} />
              </div>
            </div>
            <div><label className="lbl">เงื่อนไขพิเศษ (ถ้ามี)</label><textarea className="inp" rows={2} value={form.conditions} onChange={e => up('conditions', e.target.value)} placeholder="ระบุความต้องการพิเศษ เช่น ต้องการน้ำประปาเพิ่มเติม ระบบดูดควัน ฯลฯ" /></div>
            <div><label className="lbl">หมายเหตุเพิ่มเติม</label><textarea className="inp" rows={2} value={form.notes} onChange={e => up('notes', e.target.value)} placeholder="ข้อมูลอื่นๆ ที่ต้องการแจ้ง" /></div>
          </div>
        )}

        {/* Step 4 */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-700 mb-3">เอกสารประกอบการยื่นคำขอ</h3>
            <p className="text-sm text-gray-500">กรุณาเตรียมเอกสารต่อไปนี้ (สำหรับ{form.applicantType})</p>
            <div className="space-y-2">
              {reqDocs.map((doc, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center border-2 ${uploadedFiles.includes(doc) ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                    {uploadedFiles.includes(doc) && <Check size={10} className="text-white" />}
                  </div>
                  <span className="text-sm text-gray-700 flex-1">{doc}</span>
                  <button
                    className={uploadedFiles.includes(doc) ? 'btn-ghost btn-sm text-xs text-green-600' : 'btn-white btn-sm text-xs'}
                    onClick={() => setUploadedFiles(prev => prev.includes(doc) ? prev.filter(d => d !== doc) : [...prev, doc])}
                  >
                    {uploadedFiles.includes(doc) ? '✓ อัปโหลดแล้ว' : 'อัปโหลด'}
                  </button>
                </div>
              ))}
            </div>
            {/* Upload area */}
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-srt-navy/40 transition-colors cursor-pointer">
              <Upload size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-400">ลากและวางไฟล์ที่นี่ หรือคลิกเพื่อเลือกไฟล์</p>
              <p className="text-xs text-gray-300 mt-1">รองรับ PDF, JPG, PNG ขนาดสูงสุด 10 MB ต่อไฟล์</p>
            </div>
            {uploadedFiles.length > 0 && (
              <div className="text-sm text-gray-500">อัปโหลดแล้ว {uploadedFiles.length}/{reqDocs.length} เอกสาร</div>
            )}
          </div>
        )}

        {/* Step 5 */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-700 mb-3">ยืนยันและส่งคำขอ</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="font-bold text-gray-500 text-xs uppercase mb-2">ข้อมูลผู้ขอเช่า</div>
                <div className="space-y-1 text-gray-700">
                  <div><span className="text-gray-400">ประเภท:</span> {form.applicantType}</div>
                  <div><span className="text-gray-400">ชื่อ:</span> {form.name || '-'}</div>
                  <div><span className="text-gray-400">โทร:</span> {form.phone || '-'}</div>
                  <div><span className="text-gray-400">อีเมล:</span> {form.email || '-'}</div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="font-bold text-gray-500 text-xs uppercase mb-2">ทรัพย์สินที่ต้องการ</div>
                <div className="space-y-1 text-gray-700">
                  <div><span className="text-gray-400">ประเภท:</span> {form.assetType || '-'}</div>
                  <div><span className="text-gray-400">สถานี:</span> {form.station || '-'}</div>
                  <div><span className="text-gray-400">พื้นที่:</span> {form.area ? `${form.area} ตร.ม.` : '-'}</div>
                  <div><span className="text-gray-400">ชั้น:</span> {form.floor || '-'}</div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="font-bold text-gray-500 text-xs uppercase mb-2">รายละเอียดการเช่า</div>
                <div className="space-y-1 text-gray-700">
                  <div><span className="text-gray-400">วัตถุประสงค์:</span> {form.purpose || '-'}</div>
                  <div><span className="text-gray-400">ระยะเวลา:</span> {form.period} ปี</div>
                  <div><span className="text-gray-400">วันเริ่ม:</span> {form.startDate || '-'}</div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="font-bold text-gray-500 text-xs uppercase mb-2">เอกสาร</div>
                <div className="text-gray-700">
                  อัปโหลดแล้ว {uploadedFiles.length}/{reqDocs.length} เอกสาร
                </div>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              <strong>หมายเหตุ:</strong> หลังจากยื่นคำขอ เจ้าหน้าที่จะตรวจสอบเอกสารและแจ้งผลภายใน 3-5 วันทำการ
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-0.5 accent-srt-navy" checked={form.agreed} onChange={e => up('agreed', e.target.checked)} />
              <span className="text-sm text-gray-600">
                ข้าพเจ้าขอรับรองว่าข้อมูลทั้งหมดที่กรอกเป็นความจริง และยอมรับเงื่อนไขการใช้งานระบบและระเบียบการเช่าทรัพย์สินของการรถไฟแห่งประเทศไทย
              </span>
            </label>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
          <button
            className="btn-white"
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
          >
            <ChevronLeft size={16} />
            ย้อนกลับ
          </button>
          {step < STEPS.length - 1 ? (
            <button className="btn-navy" onClick={() => setStep(s => s + 1)}>
              ถัดไป
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              className="btn-green"
              onClick={handleSubmit}
              disabled={!form.agreed}
            >
              <CheckCircle size={16} />
              ยืนยันส่งคำขอ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
