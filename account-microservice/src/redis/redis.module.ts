import { Module } from '@nestjs/common';
import { RedisService } from '../services/redis.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  providers: [RedisService],
  imports: [
    ClientsModule.register([
      {
        name: 'API_GATEWAY_SUBSCRIBER',
        transport: Transport.REDIS,
        options: {
          host: 'host.docker.internal',
          port: 6379,
        },
      },
    ]),
  ],
  exports: [RedisService],
})
export class RedisModule {}
