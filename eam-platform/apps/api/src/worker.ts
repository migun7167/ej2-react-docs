import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Queue, Worker } from 'bullmq';
import { AppModule } from './app.module';
import { PmService } from './pm.controller';

/**
 * Worker process — image เดียวกับ api, entrypoint คนละตัว
 * งานปัจจุบัน: PM generation ทุกคืน + เก็บกวาด idempotency key
 */
async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const pm = app.get(PmService);

  const connection = { url: process.env.REDIS_URL ?? 'redis://localhost:6379' };
  const queue = new Queue('eam-jobs', { connection });

  await queue.upsertJobScheduler('pm-generate', { pattern: '0 2 * * *' }, {
    name: 'pm-generate',
  });
  await queue.upsertJobScheduler('idem-cleanup', { pattern: '30 3 * * *' }, {
    name: 'idem-cleanup',
  });

  const worker = new Worker(
    'eam-jobs',
    async (job) => {
      if (job.name === 'pm-generate') {
        return pm.generateDue();
      }
      if (job.name === 'idem-cleanup') {
        const db = app.get((await import('./db.service')).DbService);
        await db.query(`DELETE FROM audit.idempotency_key WHERE created_at < now() - interval '48 hours'`);
        return { cleaned: true };
      }
    },
    { connection },
  );

  worker.on('completed', (job, result) =>
    console.log(`[worker] ${job.name} done`, JSON.stringify(result)));
  worker.on('failed', (job, err) =>
    console.error(`[worker] ${job?.name} failed: ${err.message}`));

  // รันทันทีหนึ่งครั้งตอน start เพื่อให้ PM ค้างถูกสร้างโดยไม่ต้องรอตี 2
  await queue.add('pm-generate', {});
  console.log('EAM worker started');
}
main();
