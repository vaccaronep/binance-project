import { Injectable } from '@nestjs/common';

import { RedisService } from './redis.service';

@Injectable()
export class OrdersService {
  constructor(private readonly redisService: RedisService) {}

  newOrder(): string {
    return 'Hello World!';
  }
}
