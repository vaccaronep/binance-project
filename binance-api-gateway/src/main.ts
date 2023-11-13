import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      host: 'host.docker.internal',
      port: 6379,
    },
  });
  const options = new DocumentBuilder()
    .setTitle('API docs')
    .addTag('orders')
    .addTag('users')
    .addTag('rules')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);
  await app.startAllMicroservices();
  await app.listen(8000);
}
bootstrap();
