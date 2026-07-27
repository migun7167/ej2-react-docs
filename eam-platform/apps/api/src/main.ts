import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true, credentials: true });

  // API-first (EAM-PRN-004): OpenAPI เสมอ — /api/docs
  const config = new DocumentBuilder()
    .setTitle('EAM Platform API')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));

  await app.listen(Number(process.env.PORT ?? 3000), '0.0.0.0');
  console.log(`EAM API listening on :${process.env.PORT ?? 3000}`);
}
bootstrap();
