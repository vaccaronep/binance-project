import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisController } from './redis.controller';
import { MyGateway } from './gateway';

@Module({
  controllers: [RedisController],
  providers: [RedisService, MyGateway],
})
export class RedisModule {}
