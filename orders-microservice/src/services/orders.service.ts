import { Injectable } from '@nestjs/common';

import { RedisService } from './redis.service';
import { NewOrder } from 'src/orders.controller';
import { BinanceHttpService } from 'src/binance/binance.http.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OrdersService {
  constructor(
    private readonly redisService: RedisService,
    private readonly httpService: BinanceHttpService,
    private readonly configService: ConfigService,
  ) {}

  newOrder(newOrder: NewOrder) {
    const apikey = this.configService.get('BINANCE_TEST_API_KEY');
    const secret = this.configService.get('BINANCE_TEST_API_SECRET');
    return this.httpService.placeNewOrder(apikey, secret, {
      symbol: newOrder.symbol.toUpperCase(),
      side: newOrder.side.toLocaleUpperCase(),
      type: newOrder.type.toLocaleUpperCase(),
      strategyId: newOrder.strategy,
      quoteOrderQty: newOrder.quantity,
    });
  }
}
