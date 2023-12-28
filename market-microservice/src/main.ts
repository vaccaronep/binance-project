import { NestFactory } from '@nestjs/core';
import { AppModule } from './market.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: 3070,
      },
    },
  );
  await app.listen();
}
bootstrap();
