/* logistics/src/main.ts */

import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { LogisticsModule } from './logistics.module';

async function bootstrap() {
  const app = await NestFactory.create(LogisticsModule);

  // Obtener ConfigService
  const configService = app.get(ConfigService);

  // Habilitar CORS
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  // Obtener puerto desde .env
  const port = configService.get<number>('LOGISTICS_PORT') || 3003;

  await app.listen(port);
  console.log(
    `📦 Logistics Microservice corriendo en: http://localhost:${port}`,
  );
}

bootstrap();
