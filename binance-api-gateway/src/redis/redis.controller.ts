import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { RedisService } from './redis.service';

@Controller()
export class RedisController {
  constructor(private readonly redisService: RedisService) {}

  @EventPattern('new_order')
  new_order() {
    return console.log('nueva orden generada, emitir mensaje al websocket');
  }
}
