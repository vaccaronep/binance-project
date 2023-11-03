import { Injectable } from '@nestjs/common';

import { RedisService } from './redis.service';

@Injectable()
export class OrdersService {
  constructor(private readonly redisService: RedisService) {}

  getHello(): string {
    this.redisService.publish();
    return 'Hello World!';
  }
}
