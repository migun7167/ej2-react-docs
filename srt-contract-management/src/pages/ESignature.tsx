import React, { useState } from 'react';
import { PenTool, CheckCircle, Shield, QrCode, Download, Send, Clock, AlertTriangle, Smartphone, Mail } from 'lucide-react';
import { contracts, formatDate, formatCurrency } from '../data/mockData';

const signingContracts = contracts.filter(c => c.status === 'pending_signature' || c.status === 'approved');

function SigningModal({ contractId, onClose }: { contractId: string; onClose: () => void }) {
  const contract = contracts.find(c => c.id === contractId);
  const [step, setStep] = useState(0);
  const [otp, setOtp] = useState('');
  const [signed, setSigned] = useState(false);
  if (!contract) return null;

  const signSteps = ['ยืนยันตัวตน', 'ตรวจสอบสัญญา', 'ลงนาม', 'สำเร็จ'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-box-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span style={{ fontWeight: 700 }}>ลงนามสัญญาออนไลน์ - {contract.contractNo}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}>×</button>
        </div>
        <div className="modal-body">
          {/* Step bar */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
            {signSteps.map((s, i) => (
              <React.Fragment key={i}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 11, background: i < step ? 'var(--srt-green)' : i === step ? 'var(--srt-navy)' : 'var(--srt-gray-200)', color: i <= step ? '#fff' : 'var(--srt-gray-500)' }}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <div style={{ fontSize: 10, marginTop: 4, color: i === step ? 'var(--srt-navy)' : 'var(--srt-gray-400)', fontWeight: i === step ? 600 : 400 }}>{s}</div>
                </div>
                {i < signSteps.length - 1 && <div style={{ flex: 1, height: 2, background: i < step ? 'var(--srt-green)' : 'var(--srt-gray-200)', margin: '0 6px', marginBottom: 16 }} />}
              </React.Fragment>
            ))}
          </div>

          {step === 0 && (
            <div>
              <div className="alert alert-info"><Shield size={14} /> กรุณายืนยันตัวตนก่อนลงนาม ระบบจะส่ง OTP ไปยังโทรศัพท์/อีเมลของท่าน</div>
              <div className="grid grid-2 mb-4" style={{ gap: 12 }}>
                <div className="card" style={{ padding: 16, textAlign: 'center', cursor: 'pointer', border: '2px solid var(--srt-navy)', background: '#f0f4ff' }}>
                  <Smartphone size={28} color="var(--srt-navy)" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontWeight: 600 }}>SMS OTP</div>
                  <div style={{ fontSize: 12, color: 'var(--srt-gray-500)' }}>ส่งไปยัง 08x-xxx-x789</div>
                </div>
                <div className="card" style={{ padding: 16, textAlign: 'center', cursor: 'pointer' }}>
                  <Mail size={28} color="var(--srt-gray-400)" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontWeight: 600 }}>Email OTP</div>
                  <div style={{ fontSize: 12, color: 'var(--srt-gray-500)' }}>ส่งไปยัง c****@email.com</div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">กรอกรหัส OTP 6 หลัก <span className="required">*</span></label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="form-control" value={otp} onChange={e => setOtp(e.target.value)} placeholder="XXXXXX" maxLength={6} style={{ letterSpacing: 8, fontSize: 18, textAlign: 'center' }} />
                  <button className="btn btn-outline" style={{ flexShrink: 0 }}>ส่งใหม่</button>
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--srt-gray-400)' }}>รหัสหมดอายุใน 5:00 นาที</div>
            </div>
          )}

          {step === 1 && (
            <div>
              <div className="alert alert-warning"><AlertTriangle size={14} /> กรุณาอ่านสัญญาให้ครบถ้วนก่อนลงนาม</div>
              <div style={{ border: '1px solid var(--srt-gray-200)', borderRadius: 8, padding: 20, position: 'relative', minHeight: 280, background: '#fafafa' }}>
                <div className="watermark">DRAFT</div>
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>สัญญาเช่าทรัพย์สินการรถไฟแห่งประเทศไทย</div>
                  <div style={{ fontSize: 13, color: 'var(--srt-gray-500)' }}>เลขที่สัญญา: {contract.contractNo}</div>
                </div>
                <div style={{ fontSize: 13, lineHeight: 2, color: 'var(--srt-gray-700)' }}>
                  <p>สัญญาฉบับนี้ทำขึ้นระหว่าง <strong>การรถไฟแห่งประเทศไทย</strong> ซึ่งต่อไปในสัญญาจะเรียกว่า "ผู้ให้เช่า" ฝ่ายหนึ่ง กับ <strong>{contract.tenantName}</strong> ซึ่งต่อไปในสัญญาจะเรียกว่า "ผู้เช่า" อีกฝ่ายหนึ่ง</p>
                  <p style={{ marginTop: 12 }}>ข้อ 1. ผู้ให้เช่าตกลงให้เช่า และผู้เช่าตกลงเช่า <strong>{contract.assetName}</strong> ที่ {contract.station} มีเนื้อที่ประมาณ {contract.area > 0 ? contract.area : '-'} ตารางเมตร...</p>
                  <p style={{ marginTop: 12 }}>ข้อ 2. ระยะเวลาเช่า ตั้งแต่วันที่ <strong>{formatDate(contract.startDate)}</strong> ถึงวันที่ <strong>{formatDate(contract.endDate)}</strong>...</p>
                  <p style={{ marginTop: 12 }}>ข้อ 3. ค่าเช่า ผู้เช่าตกลงชำระค่าเช่าเดือนละ <strong>{formatCurrency(contract.monthlyRent)}</strong> ภายในวันที่ 5 ของทุกเดือน...</p>
                </div>
              </div>
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" id="consent" />
                <label htmlFor="consent" style={{ fontSize: 13 }}>ข้าพเจ้ายืนยันว่าได้อ่านและเข้าใจเนื้อหาสัญญาทั้งหมดแล้ว และยินยอมใช้ e-Signature ในการลงนาม</label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="grid grid-2 mb-4" style={{ gap: 12 }}>
                <div>
                  <label className="form-label">ลายมือชื่อดิจิทัล</label>
                  <div className={`signature-pad ${signed ? 'signed' : ''}`} onClick={() => setSigned(true)}>
                    {signed ? (
                      <div style={{ textAlign: 'center' }}>
                        <CheckCircle size={32} color="var(--srt-green)" style={{ marginBottom: 8 }} />
                        <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--srt-green)' }}>นายวิชัย การรถไฟ</div>
                        <div style={{ fontSize: 11 }}>27/06/2567 14:32:15</div>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center' }}>
                        <PenTool size={24} style={{ marginBottom: 8 }} />
                        <div>คลิกเพื่อลงลายมือชื่อ</div>
                      </div>
                    )}
                  </div>
                  <button className="btn btn-ghost btn-sm mt-2" onClick={() => setSigned(false)}>ล้างลายมือชื่อ</button>
                </div>
                <div>
                  <label className="form-label">หลักฐานการลงนาม (Signing Evidence)</label>
                  <div className="card" style={{ padding: 14 }}>
                    {[['ผู้ลงนาม', 'นายวิชัย การรถไฟ'], ['IP Address', '192.168.1.100'], ['อุปกรณ์', 'Chrome / Windows 11'], ['เวลา', '27/06/2567 14:32:15'], ['OTP ยืนยัน', '08x-xxx-x789'], ['Digital Cert', 'SRT-CERT-2024-001']].map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '5px 0', borderBottom: '1px solid var(--srt-gray-100)' }}>
                        <span style={{ color: 'var(--srt-gray-500)' }}>{k}:</span>
                        <span style={{ fontWeight: 500 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="alert alert-info"><Shield size={14} /> ข้อมูลทั้งหมดจะถูกบันทึกลง Audit Trail และ e-Sign Evidence ทันทีที่ลงนาม</div>
            </div>
          )}

          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <CheckCircle size={64} color="var(--srt-green)" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--srt-green)', marginBottom: 8 }}>ลงนามสำเร็จ!</h3>
              <p style={{ color: 'var(--srt-gray-600)', marginBottom: 20 }}>สัญญา {contract.contractNo} ได้รับการลงนามเรียบร้อยแล้ว</p>
              <div className="card" style={{ padding: 16, textAlign: 'left', marginBottom: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 12 }}>สถานะการลงนาม</div>
                {[
                  { name: contract.signerTenant || 'ผู้เช่า', role: 'ผู้เช่า', done: true },
                  { name: 'นายพยาน ดีจริง', role: 'พยาน', done: true },
                  { name: 'นายวิชัย การรถไฟ', role: 'ผู้มีอำนาจ SRT', done: true },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <CheckCircle size={16} color="var(--srt-green)" />
                    <span style={{ fontSize: 13 }}>{s.name}</span>
                    <span style={{ fontSize: 11, color: 'var(--srt-gray-400)' }}>({s.role})</span>
                    <span className="badge badge-active" style={{ marginLeft: 'auto' }}>ลงนามแล้ว</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                <button className="btn btn-outline"><Download size={14} /> ดาวน์โหลด PDF</button>
                <button className="btn btn-primary"><Send size={14} /> ส่งสัญญาทางอีเมล</button>
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>ปิด</button>
          {step < 3 && (
            <button className="btn btn-primary" onClick={() => setStep(step + 1)} disabled={step === 0 && otp.length < 6}>
              {step === 2 ? 'ยืนยันการลงนาม' : 'ถัดไป'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ESignature() {
  const [signingContractId, setSigningContractId] = useState<string | null>(null);
  const [tab, setTab] = useState('pending');

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-title"><PenTool size={22} /> e-Signature ลงนามออนไลน์</div>
        <div className="page-header-sub">ระบบลงนามสัญญาออนไลน์ พร้อม Identity Verification และ Tamper Evidence</div>
      </div>

      {/* KPIs */}
      <div className="grid grid-4 mb-4">
        {[
          { label: 'รอลงนาม', value: signingContracts.length, icon: <Clock size={20} />, color: '#f39c12' },
          { label: 'ลงนามวันนี้', value: 5, icon: <CheckCircle size={20} />, color: '#16a34a' },
          { label: 'รอผู้เช่าลงนาม', value: 3, icon: <PenTool size={20} />, color: '#0a1f44' },
          { label: 'รอผู้มีอำนาจ SRT', value: 2, icon: <Shield size={20} />, color: '#c0392b' },
        ].map(k => (
          <div key={k.label} className="stat-card">
            <div className="stat-icon" style={{ background: k.color + '18' }}><span style={{ color: k.color }}>{k.icon}</span></div>
            <div className="stat-info"><h3>{k.value}</h3><p>{k.label}</p></div>
          </div>
        ))}
      </div>

      <div className="tab-nav">
        {['pending', 'signed', 'verify', 'settings'].map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'pending' ? 'รอลงนาม' : t === 'signed' ? 'ลงนามแล้ว' : t === 'verify' ? 'ตรวจสอบเอกสาร' : 'ตั้งค่า Signing'}
          </button>
        ))}
      </div>

      {tab === 'pending' && (
        <div>
          {signingContracts.map(c => (
            <div key={c.id} className="card mb-4">
              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span style={{ fontWeight: 700, color: 'var(--srt-navy)' }}>{c.contractNo}</span>
                      <span className="badge badge-pending">รอลงนาม</span>
                      {c.daysToExpiry > 0 && c.daysToExpiry <= 30 && <span className="badge badge-expiring">ด่วน</span>}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--srt-gray-600)', marginBottom: 4 }}>ผู้เช่า: {c.tenantName}</div>
                    <div style={{ fontSize: 13, color: 'var(--srt-gray-600)' }}>ทรัพย์สิน: {c.assetName}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--srt-gray-500)', marginBottom: 8, textAlign: 'right' }}>สถานะการลงนาม</div>
                    <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
                      {[
                        { name: 'ผู้เช่า', done: c.tenantSigned },
                        { name: 'ผู้มีอำนาจ SRT', done: c.srtSigned },
                      ].map((s, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                          {s.done ? <CheckCircle size={14} color="var(--srt-green)" /> : <Clock size={14} color="var(--srt-gold)" />}
                          <span>{s.name}</span>
                          <span className={`badge ${s.done ? 'badge-active' : 'badge-pending'}`}>{s.done ? 'ลงนามแล้ว' : 'รอลงนาม'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="divider" />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost btn-sm"><Send size={12} /> แจ้งเตือนผู้ลงนาม</button>
                  <button className="btn btn-ghost btn-sm"><Download size={12} /> ดูเอกสาร</button>
                  <div style={{ marginLeft: 'auto' }}>
                    <button className="btn btn-primary" onClick={() => setSigningContractId(c.id)}>
                      <PenTool size={14} /> ลงนามออนไลน์
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'signed' && (
        <div className="card">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr><th>เลขสัญญา</th><th>ผู้เช่า</th><th>วันลงนาม</th><th>ผู้ลงนามผู้เช่า</th><th>ผู้ลงนาม SRT</th><th>QR Code</th><th>ดาวน์โหลด</th></tr>
              </thead>
              <tbody>
                {contracts.filter(c => c.tenantSigned && c.srtSigned).map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600, color: 'var(--srt-navy)', fontSize: 12 }}>{c.contractNo}</td>
                    <td style={{ fontSize: 12 }}>{c.tenantName}</td>
                    <td style={{ fontSize: 12 }}>{formatDate(c.startDate)}</td>
                    <td style={{ fontSize: 12 }}>{c.signerTenant}</td>
                    <td style={{ fontSize: 12 }}>{c.signerSRT}</td>
                    <td>
                      <div style={{ width: 40, height: 40, background: '#f1f5f9', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <QrCode size={20} color="var(--srt-gray-400)" />
                      </div>
                    </td>
                    <td><button className="btn btn-ghost btn-sm"><Download size={12} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'verify' && (
        <div className="card">
          <div className="card-header"><span className="card-title">ตรวจสอบความถูกต้องเอกสาร (Tamper Evidence)</span></div>
          <div className="card-body">
            <div className="alert alert-info"><Shield size={14} /> อัปโหลดไฟล์สัญญาเพื่อตรวจสอบว่าเอกสารไม่ถูกแก้ไขหลังลงนาม</div>
            <div style={{ border: '2px dashed var(--srt-gray-300)', borderRadius: 10, padding: 40, textAlign: 'center', cursor: 'pointer', background: 'var(--srt-gray-50)' }}>
              <Download size={32} color="var(--srt-gray-400)" style={{ marginBottom: 12 }} />
              <div style={{ fontWeight: 600, marginBottom: 4 }}>ลากและวางไฟล์ PDF ที่นี่</div>
              <div style={{ fontSize: 12, color: 'var(--srt-gray-400)' }}>หรือคลิกเพื่อเลือกไฟล์</div>
            </div>
          </div>
        </div>
      )}

      {tab === 'settings' && (
        <div className="card">
          <div className="card-header"><span className="card-title">ตั้งค่า Signing Workflow</span></div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">ลำดับการลงนาม</label>
              <div className="card" style={{ padding: 16 }}>
                {['ผู้เช่า / ตัวแทนผู้เช่า', 'พยานฝ่ายผู้เช่า', 'ผู้มีอำนาจลงนาม SRT'].map((s, i) => (
                  <div key={i} className="approval-step">
                    <div className="approval-step-num">{i + 1}</div>
                    <div className="approval-step-info"><div className="approval-step-name">{s}</div></div>
                    <span className="badge badge-active">เปิดใช้งาน</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-2" style={{ gap: 12 }}>
              <div className="form-group">
                <label className="form-label">วันหมดอายุ Link ลงนาม</label>
                <select className="form-control">
                  <option>7 วัน</option><option>14 วัน</option><option>30 วัน</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">วิธียืนยันตัวตน</label>
                <select className="form-control">
                  <option>SMS OTP</option><option>Email OTP</option><option>Digital ID</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {signingContractId && <SigningModal contractId={signingContractId} onClose={() => setSigningContractId(null)} />}
    </div>
  );
}
