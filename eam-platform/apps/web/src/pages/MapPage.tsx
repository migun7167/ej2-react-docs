import maplibregl from 'maplibre-gl';
import { useEffect, useRef, useState } from 'react';
import { api } from '../api';

/**
 * แผนที่หมุดสี (EAM-GEO-011..019)
 * - หมุดสีตาม meter_type หรือสถานะ สลับโหมดได้ (EAM-GEO-012/013)
 * - server-side bbox query — โหลดเฉพาะจุดในกรอบ (EAM-GEO-017)
 * - เกิน 2,000 จุด server จะ cluster ให้ (EAM-GEO-016)
 */
export default function MapPage() {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map>();
  const [layer, setLayer] = useState<'meters' | 'assets'>('meters');
  const [colorBy, setColorBy] = useState<'type' | 'status'>('type');
  const [legend, setLegend] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    api(`/api/v1/admin/lookups?type=${layer === 'meters' && colorBy === 'type' ? 'meter_type' : 'asset_status'}`)
      .then((r) => setLegend(r.data));
  }, [layer, colorBy]);

  useEffect(() => {
    if (!el.current) return;
    api('/api/v1/me').then(({ tile_url }) => {
      const map = new maplibregl.Map({
        container: el.current!,
        style: {
          version: 8,
          sources: {
            osm: {
              type: 'raster',
              tiles: [tile_url || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors',
            },
          },
          layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
        },
        center: [100.5018, 13.7563],
        zoom: 12,
      });
      map.addControl(new maplibregl.NavigationControl());
      map.addControl(new maplibregl.GeolocateControl({ trackUserLocation: true })); // EAM-GEO-022
      mapRef.current = map;
      map.on('load', () => refresh());
      map.on('moveend', () => refresh());
    });
    return () => mapRef.current?.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markers = useRef<maplibregl.Marker[]>([]);

  const refresh = async () => {
    const map = mapRef.current;
    if (!map) return;
    const b = map.getBounds();
    const bbox = [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()].join(',');
    const fc = await api(`/api/v1/geo/features?bbox=${bbox}&layer=${layer}&color_by=${colorBy}`);
    setTotal(fc.total);
    markers.current.forEach((m) => m.remove());
    markers.current = fc.features.map((f: any) => {
      const [lng, lat] = f.geometry.coordinates;
      const dot = document.createElement('div');
      if (f.properties.kind === 'cluster') {
        dot.style.cssText =
          'background:#111827cc;color:#fff;border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700';
        dot.textContent = String(f.properties.count);
      } else {
        dot.style.cssText = `background:${f.properties.color};width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 3px rgb(0 0 0/40%)`;
        dot.title = `${f.properties.code} ${f.properties.name}`;
      }
      const marker = new maplibregl.Marker({ element: dot }).setLngLat([lng, lat]);
      if (f.properties.kind === 'point') {
        marker.setPopup(new maplibregl.Popup({ offset: 12 }).setHTML(
          `<b>${f.properties.code}</b> ${f.properties.name}<br/>` +
          (f.properties.last_reading != null ? `ค่าล่าสุด: ${f.properties.last_reading} ${f.properties.unit ?? ''}<br/>` : '') +
          (f.properties.accuracy_m != null ? `<small>พิกัด ±${f.properties.accuracy_m} ม.</small>` : ''),
        ));
      }
      marker.addTo(map);
      return marker;
    });
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layer, colorBy]);

  return (
    <>
      <h1>แผนที่</h1>
      <div className="toolbar">
        <select value={layer} onChange={(e) => setLayer(e.target.value as any)}>
          <option value="meters">ชั้นข้อมูล: มิเตอร์</option>
          <option value="assets">ชั้นข้อมูล: สินทรัพย์</option>
        </select>
        <select value={colorBy} onChange={(e) => setColorBy(e.target.value as any)}>
          <option value="type">สีตามประเภท</option>
          <option value="status">สีตามสถานะ</option>
        </select>
        <span className="hint">{total} จุดในกรอบนี้</span>
      </div>
      <div className="map-wrap">
        <div ref={el} style={{ position: 'absolute', inset: 0 }} />
        <div className="map-legend">
          {legend.map((l) => (
            <div className="row" key={l.code}>
              <span className="dot" style={{ background: l.color ?? '#6b7280' }} />
              {l.name_th}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
