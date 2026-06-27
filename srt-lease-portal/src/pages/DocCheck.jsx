import { useState } from 'react';
import { CheckCircle, XCircle, RotateCcw, FileText } from 'lucide-react';
import { mockRequests } from '../data/mockData';

const DOC_SETS = {
  'บุคคลธรรมดา': [
    'สำเนาบัตรประชาชน',
    'สำเนาทะเบียนบ้าน',
    'รูปถ่ายผู้ขอ 2 นิ้ว',
    'แผนธุรกิจ/วัตถุประสงค์',
    'หลักฐานการเงินย้อนหลัง 6 เดือน',
  ],
  'นิติบุคคล': [
    'หนังสือรับรองบริษัท (ไม่เกิน 3 เดือน)',
    'บัญชีรายชื่อผู้ถือหุ้น',
    'สำเนาบัตรประชาชนกรรมการ',
    'งบการเงินปีล่าสุด',
    'แผนธุรกิจ',
    'หนังสือมอบอำนาจ (ถ้ามี)',
  ],
};

const getRandomDocs = (type) => {
  const docs = DOC_SETS[type] || DOC_SETS['บุคคลธรรมดา'];
  return docs.map(name => ({ name, status: Math.random() > 0.3 ? 'ok' : 'missing', note: '' }));
};

const DOC_CHECK_REQS = mockRequests
  .filter(r => r.status === 'DOC_CHECK' || r.status === 'DOC_INCOMPLETE')
  .concat(mockRequests.filter(r => r.status === 'SUBMITTED').slice(0, 2));

export default function DocCheck() {
  const [requests, setRequests] = useState(
    DOC_CHECK_REQS.map(r => ({
      ...r,
      docs: getRandomDocs(r.applicantType),
      officerNote: '',
      result: null,
    }))
  );
  const [selected, setSelected] = useState(requests[0] || null);

  const toggleDoc = (reqId, docName) => {
    setRequests(prev => prev.map(r => {
      if (r.id !== reqId) return r;
      return {
        ...r,
        docs: r.docs.map(d => d.name === docName ? { ...d, status: d.status === 'ok' ? 'missing' : 'ok' } : d),
      };
    }));
    if (selected?.id === reqId) {
      setSelected(prev => ({
        ...prev,
        docs: prev.docs.map(d => d.name === docName ? { ...d, status: d.status === 'ok' ? 'missing' : 'ok' } : d),
      }));
    }
  };

  const setNote = (reqId, note) => {
    setRequests(prev => prev.map(r => r.id === reqId ? { ...r, officerNote: note } : r));
    if (selected?.id === reqId) setSelected(prev => ({ ...prev, officerNote: note }));
  };

  const setResult = (reqId, result) => {
    setRequests(prev => prev.map(r => r.id === reqId ? { ...r, result } : r));
    if (selected?.id === reqId) setSelected(prev => ({ ...prev, result }));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Request List */}
        <div className="space-y-3">
          <h3 className="font-bold text-srt-navy text-sm px-1">รายการรอตรวจสอบเอกสาร ({requests.length})</h3>
          {requests.map(req => {
            const okCount  = req.docs.filter(d => d.status === 'ok').length;
            const allOk    = okCount === req.docs.length;
            return (
              <div
                key={req.id}
                className={`card p-4 cursor-pointer transition-all ${selected?.id === req.id ? 'ring-2 ring-srt-navy' : 'hover:shadow-md'}`}
                onClick={() => setSelected(req)}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-bold text-xs text-srt-navy font-mono">{req.id}</span>
                  {req.result === 'pass'
                    ? <span className="badge bg-green-100 text-green-700">✓ ผ่าน</span>
                    : req.result === 'return'
                    ? <span className="badge bg-amber-100 text-amber-700">ส่งคืน</span>
                    : <span className={`badge ${allOk ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {okCount}/{req.docs.length} ครบ
                      </span>
                  }
                </div>
                <div className="text-sm font-medium text-gray-700 truncate">{req.applicantName}</div>
                <div className="text-xs text-gray-400">{req.assetName}</div>
                <div className="mt-2 bg-gray-100 rounded-full h-1.5">
                  <div className="bg-srt-navy rounded-full h-1.5 transition-all" style={{ width:`${(okCount/req.docs.length)*100}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail */}
        {selected ? (
          <div className="lg:col-span-2 card-p space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-srt-navy">{selected.id}</h3>
                <p className="text-sm text-gray-500">{selected.applicantName} · {selected.applicantType}</p>
                <p className="text-xs text-gray-400">{selected.assetName} · {selected.location}</p>
              </div>
              <span className="badge bg-srt-navy/10 text-srt-navy">{selected.applicantType}</span>
            </div>

            <div>
              <h4 className="font-bold text-sm text-gray-600 mb-3 flex items-center gap-2">
                <FileText size={14} />รายการเอกสาร ({selected.docs.filter(d => d.status === 'ok').length}/{selected.docs.length} ครบ)
              </h4>
              <div className="space-y-2">
                {selected.docs.map(doc => (
                  <div key={doc.name} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors
                    ${doc.status === 'ok' ? 'border-green-100 bg-green-50' : 'border-red-100 bg-red-50'}`}>
                    <button onClick={() => toggleDoc(selected.id, doc.name)}>
                      {doc.status === 'ok'
                        ? <CheckCircle size={18} className="text-green-500" />
                        : <XCircle size={18} className="text-red-400" />
                      }
                    </button>
                    <span className="flex-1 text-sm">{doc.name}</span>
                    <span className={`text-xs font-medium ${doc.status === 'ok' ? 'text-green-600' : 'text-red-500'}`}>
                      {doc.status === 'ok' ? 'ครบถ้วน' : 'ขาด'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="lbl">หมายเหตุสำหรับเอกสารที่ขาด / ไม่ถูกต้อง</label>
              <textarea
                className="inp"
                rows={3}
                value={selected.officerNote}
                onChange={e => setNote(selected.id, e.target.value)}
                placeholder="ระบุรายการเอกสารที่ต้องการให้ผู้ขอเช่าดำเนินการแก้ไข เช่น หนังสือรับรองบริษัทหมดอายุ กรุณาส่งฉบับใหม่..."
              />
            </div>

            {selected.result ? (
              <div className={`flex items-center gap-2 rounded-xl p-3 text-sm font-medium
                ${selected.result === 'pass' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {selected.result === 'pass' ? <CheckCircle size={16} /> : <RotateCcw size={16} />}
                {selected.result === 'pass' ? 'ผ่านการตรวจสอบเอกสาร — ส่งต่อขั้นตอนถัดไปแล้ว' : 'ส่งคืนเอกสารให้ผู้ขอเช่าแก้ไขแล้ว'}
              </div>
            ) : (
              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button
                  className="btn-green flex-1"
                  onClick={() => setResult(selected.id, 'pass')}
                  disabled={selected.docs.some(d => d.status === 'missing')}
                >
                  <CheckCircle size={16} />ผ่าน — ส่งต่อขั้นตอนถัดไป
                </button>
                <button
                  className="btn-white"
                  onClick={() => setResult(selected.id, 'return')}
                >
                  <RotateCcw size={16} />ส่งคืนให้แก้ไข
                </button>
              </div>
            )}
            {selected.docs.some(d => d.status === 'missing') && !selected.result && (
              <div className="text-xs text-amber-600 flex items-center gap-1">
                ⚠️ ยังมีเอกสารขาด {selected.docs.filter(d => d.status === 'missing').length} รายการ ไม่สามารถ "ผ่าน" ได้
              </div>
            )}
          </div>
        ) : (
          <div className="lg:col-span-2 card-p flex items-center justify-center text-gray-400">
            <div className="text-center">
              <FileText size={40} className="mx-auto opacity-20 mb-3" />
              <p>เลือกรายการเพื่อตรวจสอบเอกสาร</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
