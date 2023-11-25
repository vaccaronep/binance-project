import { Injectable } from '@nestjs/common';

import { RedisService } from './redis.service';
import { NewOrder } from 'src/orders.controller';
import { BinanceHttpService } from 'src/binance/binance.http.service';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IOrder } from 'src/schema/order.schema';
import { OrderUpdate } from 'src/interfaces/stream/order.update.interface';

@Injectable()
export class OrdersService {
  constructor(
    private readonly redisService: RedisService,
    private readonly httpService: BinanceHttpService,
    private readonly configService: ConfigService,
    @InjectModel('Order') private readonly orderModel: Model<IOrder>,
  ) {}

  newOrder(newOrder: NewOrder) {
    const apikey = this.configService.get('BINANCE_TEST_API_KEY');
    const secret = this.configService.get('BINANCE_TEST_API_SECRET');
    const result = this.httpService.placeNewOrder(apikey, secret, {
      symbol: newOrder.symbol.toUpperCase(),
      side: newOrder.side.toLocaleUpperCase(),
      type: newOrder.type.toLocaleUpperCase(),
      strategyId: newOrder.strategy,
      quoteOrderQty: newOrder.quantity,
    });
    console.log(result);
    return true;
  }

  public async getAll(limit: number, symbol: string): Promise<IOrder[]> {
    const contidionts = {};

    if (symbol) {
      const rgx = (pattern) => new RegExp(`.*${pattern}.*`);
      const searchRgx = rgx(symbol || '');
      contidionts['$or'] = [
        {
          symbol: {
            $exists: true,
            $ne: null,
            $regex: searchRgx,
            $options: 'i',
          },
        },
      ];
    }

    let query = this.orderModel.find(contidionts);

    if (limit) query = query.limit(limit);

    return query.exec();
  }

  saveOrder(binanceOrder: OrderUpdate): Promise<IOrder> {
    const userModel = new this.orderModel({
      eventType: binanceOrder.e,
      eventTime: binanceOrder.E,
      symbol: binanceOrder.s,
      clientOrderId: binanceOrder.c,
      side: binanceOrder.S,
      orderType: binanceOrder.o,
      orderQuantity: binanceOrder.q,
      orderPrice: binanceOrder.p,
      stopPrice: binanceOrder.P,
      orderListId: binanceOrder.g,
      originalClientOrderId: binanceOrder.C,
      currentExecutionType: binanceOrder.x,
      currentOrderStatus: binanceOrder.X,
      orderId: binanceOrder.i,
      lastExecutedQuantity: binanceOrder.l,
      cumulativeFilledQuantity: binanceOrder.z,
      lastExecutedPrice: binanceOrder.L,
      commissionAmmount: binanceOrder.n,
      commissionAsset: binanceOrder.N,
      transactionTime: binanceOrder.T,
      tradeId: binanceOrder.t,
      orderCreationTime: binanceOrder.O,
      quoteOrderQuantity: binanceOrder.Q,
      strategyId: binanceOrder.j,
    });
    return userModel.save();
  }
}
