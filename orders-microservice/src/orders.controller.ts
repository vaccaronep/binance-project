import { Controller, HttpStatus } from '@nestjs/common';
import { OrdersService } from './services/orders.service';
import { MessagePattern } from '@nestjs/microservices';
import { IOrdersGetResponse } from './interfaces/api/get-orders-response.interface';
import { BinanceWsWrapper } from './binance/binance.ws';

export interface NewOrder {
  symbol: string;
  side: string;
  type: string;
  quantity: number;
  strategy: string;
  market: string;
  testing: boolean;
}

@Controller()
export class OrdersController {
  constructor(
    private readonly orderService: OrdersService,
    private readonly wsService: BinanceWsWrapper,
  ) {}

  @MessagePattern({ cmd: 'order_new' })
  placeOrder(data: { order: NewOrder; userId: string; configId: string }) {
    return this.orderService.newOrder(data.order, data.userId, data.configId);
  }

  @MessagePattern({ cmd: 'order_add_ws_user' })
  async addUserToWs(data: { userId: string; configId: string }) {
    console.log('recibiendo mensaje adicionar ws:' + data.configId);
    this.wsService.connectNewWs(data.configId);
  }

  @MessagePattern({ cmd: 'order_remove_ws_user' })
  async removeUserToWs(data: { userId: string; configId: string }) {
    console.log('recibiendo mensaje remover ws:' + data.configId);
    this.wsService.removeNewWs(data.configId);
  }

  @MessagePattern({ cmd: 'order_reconnect_ws_user' })
  async recconectWs(data: { userId: string; configId: string }) {
    console.log('recibiendo mensaje reconectar ws:' + data.configId);
    this.wsService.reconnectWs(data.configId);
  }

  @MessagePattern({ cmd: 'orders_get_all' })
  public async getAllOrders(data: {
    configId: string;
    limit: number;
    symbol: string;
  }): Promise<IOrdersGetResponse> {
    let result: IOrdersGetResponse;
    try {
      const orders = await this.orderService.getAll(
        data.configId,
        data.limit,
        data.symbol,
      );
      result = {
        status: HttpStatus.OK,
        message: 'orders_get_all_success',
        errors: null,
        orders,
      };
    } catch (error) {
      result = {
        status: HttpStatus.PRECONDITION_FAILED,
        message: 'orders_get_all_failed',
        orders: null,
        errors: error.errors,
      };
    }
    return result;
  }

  @MessagePattern({ cmd: 'orders_get_all_binance' })
  public async getAllOrdersFromBinance(data: {
    configId: string;
    symbol: string;
  }) {
    const response = await this.orderService.getAllOrdersFromBinance(
      data.configId,
      data.symbol,
    );
    return response.data;
  }

  // @MessagePattern({ cmd: 'order_bulk' })
  // placeOrderBulk(): string {
  //   return this.orderService.newOrder();
  // }

  // @MessagePattern({ cmd: 'order_cancel' })
  // cancelOrder(): string {
  //   return this.orderService.newOrder();
  // }
}
