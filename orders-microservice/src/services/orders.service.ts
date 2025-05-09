import { Inject, Injectable } from '@nestjs/common';
import { NewOrder } from 'src/orders.controller';
import { BinanceHttpService } from 'src/binance/binance.http.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IOrder } from 'src/schema/order.schema';
import { OrderUpdate } from 'src/interfaces/stream/order.update.interface';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OrdersService {
  constructor(
    private readonly httpService: BinanceHttpService,
    @InjectModel('Order') private readonly orderModel: Model<IOrder>,
    @Inject('ACCOUNT_SERVICE') private accountService: ClientProxy,
  ) {}

  async getAllOrdersFromBinance(configId: string, symbol: string) {
    const configResponse = await firstValueFrom(
      await this.accountService.send(
        { cmd: 'account_get_keys_by_id' },
        {
          configId,
        },
      ),
    );

    if (configResponse.status === 200) {
      const config = configResponse.configs[0];
      if (config) {
        const apikey = config.api_key;
        const secret = config.api_secret;
        return this.httpService.getAllOrders(config.api_url, apikey, secret, {
          symbol,
          limit: 600,
        });
      }
    }
  }

  async newOrder(newOrder: NewOrder, userId: string, configId: string) {
    const configResponse = await firstValueFrom(
      await this.accountService.send(
        { cmd: 'account_get_keys_by_id' },
        {
          configId,
        },
      ),
    );

    if (configResponse.status === 200) {
      const config = configResponse.configs[0];
      if (config) {
        const apikey = config.api_key;
        const secret = config.api_secret;
        this.httpService.placeNewOrder(config.api_url, apikey, secret, {
          symbol: newOrder.symbol.toUpperCase(),
          side: newOrder.side.toLocaleUpperCase(),
          type: newOrder.type.toLocaleUpperCase(),
          strategyId: newOrder.strategy,
          quoteOrderQty: newOrder.quantity,
        });
        return true;
      }
    }

    return false;
  }

  public async getAll(
    configId: string,
    limit: number,
    symbol: string,
  ): Promise<IOrder[]> {
    const contidionts = [];

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

    contidionts.push({
      configId: {
        $eq: configId,
      },
    });

    let query = this.orderModel.find({
      $and: contidionts,
    });

    if (limit) query = query.limit(limit);

    return query.exec();
  }

  saveOrder(configId: string, binanceOrder: OrderUpdate): Promise<IOrder> {
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
      configId,
    });
    return userModel.save();
  }

  async placeStopLossAndTakeProfit(config: any, rule: any, order: IOrder) {
    if (rule.type == 'OCO') {
      const [take_profit_action] = rule.actions.filter(
        (action) => action.type === 'TAKE_PROFIT',
      );

      const [stop_loss_action] = rule.actions.filter(
        (action) => action.type === 'STOP_LOSS',
      );

      const lastPrice = +order.lastExecutedPrice;
      const price = +(lastPrice * (1 + +take_profit_action.percentage)).toFixed(
        2,
      );

      const stopPrice = +(
        lastPrice *
        (1 - +(stop_loss_action.percentage * 0.8).toFixed(2))
      ).toFixed(2);

      const stopLimitPrice = +(
        lastPrice *
        (1 - +stop_loss_action.percentage)
      ).toFixed(2);

      const params = {
        symbol: order.symbol,
        side: order.side === 'SELL' ? 'BUY' : 'SELL',
        quantity: +order.cumulativeFilledQuantity,
        price,
        stopPrice,
        stopLimitPrice,
        stopLimitTimeInForce: 'GTC',
        strategyId: config._id,
        stopStrategyId: order.strategyId.toString(),
        limitStrategyId: order.strategyId.toString(),
      };

      this.httpService.placeNewOcoOrder(
        config.api_url,
        config.api_key,
        config.api_secret,
        params,
      );
    }
  }
}
