import { useEffect, useRef, useState } from 'react';

export interface GpsFix {
  lat: number;
  lng: number;
  accuracy_m: number;
  source: 'gps';
  confirmed?: boolean;
}

/**
 * ปุ่ม "ใช้ตำแหน่งปัจจุบัน" (EAM-GEO-031..034)
 * - เก็บค่าต่อเนื่อง 8 วินาที เลือกค่าที่ accuracy ดีที่สุด ไม่ใช่ค่าแรก (EAM-GEO-033)
 * - แสดง accuracy ให้เห็นก่อนบันทึก — ผู้ใช้จะรอเองเมื่อเห็นตัวเลขกำลังดีขึ้น
 */
export function GpsCapture({ onFix }: { onFix: (fix: GpsFix | null) => void }) {
  const [state, setState] = useState<'idle' | 'capturing' | 'done' | 'error'>('idle');
  const [best, setBest] = useState<GpsFix | null>(null);
  const [remaining, setRemaining] = useState(0);
  const watchRef = useRef<number>();

  useEffect(() => () => {
    if (watchRef.current !== undefined) navigator.geolocation.clearWatch(watchRef.current);
  }, []);

  const start = () => {
    if (!navigator.geolocation) {
      setState('error');
      return;
    }
    setState('capturing');
    setBest(null);
    setRemaining(8);
    let bestFix: GpsFix | null = null;
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const fix: GpsFix = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy_m: Math.round(pos.coords.accuracy * 10) / 10,
          source: 'gps',
        };
        if (!bestFix || fix.accuracy_m < bestFix.accuracy_m) {
          bestFix = fix;
          setBest(fix);
        }
      },
      () => setState('error'),
      { enableHighAccuracy: true, maximumAge: 0 },
    );
    const timer = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(timer);
          if (watchRef.current !== undefined) navigator.geolocation.clearWatch(watchRef.current);
          setState('done');
          setBest((b) => {
            onFix(b ? { ...b, confirmed: true } : null);
            return b;
          });
          return 0;
        }
        return r - 1;
      });
    }, 1000);
  };

  const accClass = (a: number) => (a <= 10 ? 'good' : a <= 15 ? 'warn' : 'bad');

  return (
    <div className="gps-box">
      {state === 'idle' && (
        <button type="button" className="btn secondary" onClick={start}>📍 ใช้ตำแหน่งปัจจุบัน</button>
      )}
      {state === 'capturing' && (
        <>
          <div>กำลังรอสัญญาณให้นิ่ง… ({remaining} วิ)</div>
          {best && <div className={'acc ' + accClass(best.accuracy_m)}>±{best.accuracy_m} ม.</div>}
          <div className="hint">ระบบเก็บหลายค่าแล้วเลือกค่าที่แม่นที่สุด</div>
        </>
      )}
      {state === 'done' && best && (
        <>
          <div>
            ได้ตำแหน่ง {best.lat.toFixed(6)}, {best.lng.toFixed(6)}{' '}
            <span className={'acc ' + accClass(best.accuracy_m)}>±{best.accuracy_m} ม.</span>
          </div>
          {best.accuracy_m > 15 && (
            <div className="error-text">ความแม่นยำแย่กว่าเกณฑ์ 15 ม. — ระบบจะปฏิเสธ ลองใหม่ในที่โล่ง</div>
          )}
          {best.accuracy_m > 10 && best.accuracy_m <= 15 && (
            <div className="hint">เกินเกณฑ์เตือน 10 ม. — จะบันทึกพร้อม flag ยืนยัน</div>
          )}
          <button type="button" className="btn secondary" onClick={start}>ลองใหม่</button>
        </>
      )}
      {state === 'error' && <div className="error-text">อ่านตำแหน่งไม่ได้ — ตรวจสิทธิ์ location ของเบราว์เซอร์</div>}
    </div>
  );
}
