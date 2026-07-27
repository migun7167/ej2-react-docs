import { Controller, Get } from '@nestjs/common';
import { DbService } from './db.service';

@Controller()
export class HealthController {
  constructor(private readonly db: DbService) {}

  @Get('health')
  health() {
    return { status: 'ok' };
  }

  @Get('health/ready')
  async ready() {
    await this.db.query('SELECT 1');
    return { status: 'ready', db: 'ok' };
  }

  /** ผู้ใช้ปัจจุบัน + config ที่ frontend ต้องรู้ */
  @Get('api/v1/me')
  me() {
    return { auth_mode: process.env.AUTH_MODE ?? 'dev', tile_url: process.env.TILE_URL ?? '' };
  }
}
