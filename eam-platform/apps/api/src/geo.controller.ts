import { Body, Controller, Get, Injectable, Post, Query } from '@nestjs/common';
import { ApiError, CurrentUser, User } from './common';
import { DbService, TENANT_ID } from './db.service';

const MAX_RAW_FEATURES = 2000; // เกินนี้ server จะ cluster ให้ (EAM-GEO-016/017)

@Injectable()
export class GeoService {
  constructor(private readonly db: DbService) {}

  async currentPoint(entityType: string, entityId: string) {
    return this.db.one(
      `SELECT id, ST_Y(geom::geometry) AS lat, ST_X(geom::geometry) AS lng,
              accuracy_m, source, captured_at
       FROM geo.geo_point
       WHERE tenant_id = $1 AND entity_type = $2 AND entity_id = $3 AND superseded_by IS NULL
       ORDER BY captured_at DESC LIMIT 1`,
      [TENANT_ID, entityType, entityId],
    );
  }

  /**
   * บันทึกพิกัดพร้อม accuracy metadata (EAM-GEO-002) — แก้พิกัด = แถวใหม่ แถวเก่าถูก supersede (EAM-GEO-004)
   * เกณฑ์ accuracy จาก org settings: gps_reject_m ปฏิเสธ, gps_warn_m ต้อง confirm (EAM-GEO-034)
   */
  async addPoint(
    entityType: string,
    entityId: string,
    geo: { lat: number; lng: number; accuracy_m?: number; sat_count?: number; source?: string; confirmed?: boolean },
    userId: string,
  ) {
    const settings = (await this.db.one(
      `SELECT settings FROM core.organization WHERE tenant_id = $1 LIMIT 1`, [TENANT_ID]))?.settings ?? {};
    const warn = Number(settings.gps_warn_m ?? 10);
    const reject = Number(settings.gps_reject_m ?? 15);
    const acc = geo.accuracy_m != null ? Number(geo.accuracy_m) : null;
    if (geo.source !== 'manual' && acc !== null) {
      if (acc > reject)
        throw new ApiError(422, 'GPS_ACCURACY_REJECTED',
          `ความแม่นยำ ±${acc} ม. แย่กว่าเกณฑ์ ${reject} ม. — รอสัญญาณนิ่งแล้วลองใหม่ หรือปักหมุดเอง (source=manual)`,
          'accuracy_m', { limit: reject });
      if (acc > warn && !geo.confirmed)
        throw new ApiError(422, 'GPS_ACCURACY_WARN',
          `ความแม่นยำ ±${acc} ม. เกินเกณฑ์เตือน ${warn} ม. — ส่ง confirmed=true เพื่อยืนยันบันทึก`,
          'accuracy_m', { limit: warn });
    }
    return this.db.tx(async (c) => {
      const row = (await c.query(
        `INSERT INTO geo.geo_point
           (tenant_id, entity_type, entity_id, geom, accuracy_m, sat_count, source, captured_by)
         VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326)::geography, $6, $7, COALESCE($8, 'gps'), $9)
         RETURNING id`,
        [TENANT_ID, entityType, entityId, geo.lng, geo.lat, acc, geo.sat_count ?? null, geo.source, userId],
      )).rows[0];
      await c.query(
        `UPDATE geo.geo_point SET superseded_by = $1
         WHERE tenant_id = $2 AND entity_type = $3 AND entity_id = $4
           AND id <> $1 AND superseded_by IS NULL`,
        [row.id, TENANT_ID, entityType, entityId],
      );
      return row;
    });
  }
}

@Controller('api/v1/geo')
export class GeoController {
  constructor(private readonly db: DbService, private readonly geo: GeoService) {}

  /**
   * GET /geo/features?bbox=minLng,minLat,maxLng,maxLat&layer=meters|assets|work_orders&color_by=type|status
   * ส่งเฉพาะจุดในกรอบ (EAM-GEO-017); เกิน 2,000 จุด → grid cluster ฝั่ง DB (EAM-GEO-016)
   */
  @Get('features')
  async features(@Query() q: any) {
    const bbox = String(q.bbox ?? '').split(',').map(Number);
    if (bbox.length !== 4 || bbox.some(Number.isNaN))
      throw new ApiError(400, 'BAD_BBOX', 'bbox=minLng,minLat,maxLng,maxLat', 'bbox');
    const [minLng, minLat, maxLng, maxLat] = bbox;
    const layer = q.layer ?? 'meters';
    const colorBy = q.color_by ?? 'type';

    const layerSql: Record<string, string> = {
      meters: `
        SELECT g.id AS point_id, g.geom, g.accuracy_m, m.id, m.code, m.name,
               CASE WHEN $6 = 'status' THEN COALESCE(av.color, '#6b7280') ELSE COALESCE(lv.color, '#6b7280') END AS color,
               m.meter_type_code AS sub, m.last_reading, m.unit
        FROM geo.geo_point g
        JOIN core.meter m ON m.id = g.entity_id AND m.deleted_at IS NULL
        LEFT JOIN ext.lookup_value lv ON lv.tenant_id = $1 AND lv.type_code = 'meter_type' AND lv.code = m.meter_type_code
        LEFT JOIN core.asset a2 ON a2.id = m.asset_id
        LEFT JOIN ext.lookup_value av ON av.tenant_id = $1 AND av.type_code = 'asset_status' AND av.code = a2.status_code
        WHERE g.tenant_id = $1 AND g.entity_type = 'meter' AND g.superseded_by IS NULL
          AND g.geom && ST_MakeEnvelope($2, $3, $4, $5, 4326)::geography`,
      assets: `
        SELECT g.id AS point_id, g.geom, g.accuracy_m, a.id, a.code, a.name,
               CASE WHEN $6 = 'status' THEN COALESCE(sv.color, '#6b7280') ELSE COALESCE(t.color, '#6b7280') END AS color,
               t.code AS sub, NULL::numeric AS last_reading, NULL::text AS unit
        FROM geo.geo_point g
        JOIN core.asset a ON a.id = g.entity_id AND a.deleted_at IS NULL
        LEFT JOIN core.asset_type t ON t.id = a.asset_type_id
        LEFT JOIN ext.lookup_value sv ON sv.tenant_id = $1 AND sv.type_code = 'asset_status' AND sv.code = a.status_code
        WHERE g.tenant_id = $1 AND g.entity_type = 'asset' AND g.superseded_by IS NULL
          AND g.geom && ST_MakeEnvelope($2, $3, $4, $5, 4326)::geography`,
    };
    const sql = layerSql[layer];
    if (!sql) throw new ApiError(400, 'BAD_LAYER', `layer ต้องเป็น: ${Object.keys(layerSql).join(', ')}`, 'layer');
    const params = [TENANT_ID, minLng, minLat, maxLng, maxLat, colorBy];

    const count = Number((await this.db.one(
      `SELECT count(*) AS n FROM (${sql}) x`, params))?.n ?? 0);

    if (count > MAX_RAW_FEATURES) {
      const grid = Math.max((maxLng - minLng) / 25, 0.0005);
      const clusters = await this.db.query(
        `SELECT count(*) AS n,
                ST_X(ST_Centroid(ST_Collect(geom::geometry))) AS lng,
                ST_Y(ST_Centroid(ST_Collect(geom::geometry))) AS lat
         FROM (${sql}) x
         GROUP BY ST_SnapToGrid(geom::geometry, $7, $7)`,
        [...params, grid],
      );
      return {
        type: 'FeatureCollection',
        clustered: true,
        total: count,
        features: clusters.map((c) => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [Number(c.lng), Number(c.lat)] },
          properties: { kind: 'cluster', count: Number(c.n) },
        })),
      };
    }

    const rows = await this.db.query(
      `SELECT *, ST_X(geom::geometry) AS lng, ST_Y(geom::geometry) AS lat FROM (${sql}) x`, params);
    return {
      type: 'FeatureCollection',
      clustered: false,
      total: count,
      features: rows.map((r) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [Number(r.lng), Number(r.lat)] },
        properties: {
          kind: 'point', id: r.id, code: r.code, name: r.name, color: r.color,
          sub: r.sub, accuracy_m: r.accuracy_m, last_reading: r.last_reading, unit: r.unit,
        },
      })),
    };
  }

  @Post('points')
  async addPoint(@Body() body: any, @User() user: CurrentUser) {
    if (!body.entity_type || !body.entity_id || body.lat == null || body.lng == null)
      throw new ApiError(400, 'VALIDATION', 'entity_type, entity_id, lat, lng จำเป็น');
    return this.geo.addPoint(body.entity_type, body.entity_id, body, user.id);
  }

  /** สิ่งที่อยู่ใกล้ฉันในรัศมี N เมตร (EAM-GEO-023) */
  @Get('nearby')
  async nearby(@Query() q: any) {
    const { lat, lng } = q;
    const radius = Math.min(Number(q.radius ?? 500), 10000);
    if (lat == null || lng == null) throw new ApiError(400, 'VALIDATION', 'lat, lng จำเป็น');
    return {
      data: await this.db.query(
        `SELECT g.entity_type, g.entity_id,
                ST_Distance(g.geom, ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography) AS distance_m,
                COALESCE(a.code, m.code) AS code, COALESCE(a.name, m.name) AS name
         FROM geo.geo_point g
         LEFT JOIN core.asset a ON g.entity_type = 'asset' AND a.id = g.entity_id
         LEFT JOIN core.meter m ON g.entity_type = 'meter' AND m.id = g.entity_id
         WHERE g.tenant_id = $1 AND g.superseded_by IS NULL
           AND ST_DWithin(g.geom, ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography, $4)
         ORDER BY distance_m LIMIT 50`,
        [TENANT_ID, Number(lng), Number(lat), radius],
      ),
    };
  }
}
