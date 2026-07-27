import { Injectable } from '@nestjs/common';
import { ApiError } from './common';
import { DbService, TENANT_ID } from './db.service';

interface FieldDef {
  field_key: string;
  label_th: string;
  field_type: 'text' | 'number' | 'date' | 'dropdown' | 'checkbox' | 'file';
  required: boolean;
  options: string[];
  rules: { min?: number; max?: number };
  asset_type_id: string | null;
}

/** validate custom_fields ตาม def — กุญแจของ "เพิ่ม field โดยไม่ migrate" (EAM-EXT-001) */
@Injectable()
export class CustomFieldService {
  private cache = new Map<string, { at: number; defs: FieldDef[] }>();

  constructor(private readonly db: DbService) {}

  async defs(entity: string, assetTypeId?: string | null): Promise<FieldDef[]> {
    const key = `${entity}:${assetTypeId ?? '*'}`;
    const hit = this.cache.get(key);
    if (hit && Date.now() - hit.at < 60_000) return hit.defs;
    const defs = await this.db.query<FieldDef>(
      `SELECT field_key, label_th, field_type, required, options, rules, asset_type_id
       FROM ext.custom_field_def
       WHERE tenant_id = $1 AND entity = $2 AND deleted_at IS NULL
         AND (asset_type_id IS NULL OR asset_type_id = $3)
       ORDER BY sort_order`,
      [TENANT_ID, entity, assetTypeId ?? null],
    );
    this.cache.set(key, { at: Date.now(), defs });
    return defs;
  }

  invalidate() {
    this.cache.clear();
  }

  async validate(entity: string, assetTypeId: string | null, values: Record<string, unknown>) {
    const defs = await this.defs(entity, assetTypeId);
    const known = new Set(defs.map((d) => d.field_key));
    for (const k of Object.keys(values ?? {})) {
      if (!known.has(k))
        throw new ApiError(400, 'UNKNOWN_CUSTOM_FIELD', `ไม่มีนิยาม field '${k}'`, k);
    }
    for (const d of defs) {
      const v = values?.[d.field_key];
      if (v === undefined || v === null || v === '') {
        if (d.required)
          throw new ApiError(400, 'CUSTOM_FIELD_REQUIRED', `ต้องระบุ ${d.label_th}`, d.field_key);
        continue;
      }
      switch (d.field_type) {
        case 'number': {
          const n = Number(v);
          if (Number.isNaN(n))
            throw new ApiError(400, 'CUSTOM_FIELD_TYPE', `${d.label_th} ต้องเป็นตัวเลข`, d.field_key);
          if (d.rules?.min !== undefined && n < d.rules.min)
            throw new ApiError(400, 'CUSTOM_FIELD_RANGE', `${d.label_th} ต้อง ≥ ${d.rules.min}`, d.field_key);
          if (d.rules?.max !== undefined && n > d.rules.max)
            throw new ApiError(400, 'CUSTOM_FIELD_RANGE', `${d.label_th} ต้อง ≤ ${d.rules.max}`, d.field_key);
          break;
        }
        case 'date':
          if (Number.isNaN(Date.parse(String(v))))
            throw new ApiError(400, 'CUSTOM_FIELD_TYPE', `${d.label_th} ต้องเป็นวันที่`, d.field_key);
          break;
        case 'dropdown':
          if (!d.options.includes(String(v)))
            throw new ApiError(400, 'CUSTOM_FIELD_OPTION', `${d.label_th} ต้องเป็นหนึ่งใน: ${d.options.join(', ')}`, d.field_key);
          break;
        case 'checkbox':
          if (typeof v !== 'boolean')
            throw new ApiError(400, 'CUSTOM_FIELD_TYPE', `${d.label_th} ต้องเป็น true/false`, d.field_key);
          break;
      }
    }
  }
}
