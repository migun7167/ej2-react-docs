import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AdminController, DashboardController } from './admin.controller';
import { AssetTypesController, AssetsController, LocationsController } from './assets.controller';
import { AuditService } from './audit.service';
import { AuthMiddleware } from './auth.middleware';
import { ApiExceptionFilter } from './common';
import { CustomFieldService } from './custom-field.service';
import { DbService } from './db.service';
import { GeoController, GeoService } from './geo.controller';
import { HealthController } from './health.controller';
import { MetersController, ReadingService } from './meters.controller';
import { PmController, PmService } from './pm.controller';
import { WorkOrdersController } from './work-orders.controller';

@Module({
  controllers: [
    HealthController,
    AssetsController,
    AssetTypesController,
    LocationsController,
    MetersController,
    WorkOrdersController,
    GeoController,
    PmController,
    AdminController,
    DashboardController,
  ],
  providers: [
    DbService,
    AuditService,
    CustomFieldService,
    GeoService,
    ReadingService,
    PmService,
    { provide: APP_FILTER, useClass: ApiExceptionFilter },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('api/*');
  }
}
