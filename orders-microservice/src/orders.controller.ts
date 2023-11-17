import { Controller, HttpStatus } from '@nestjs/common';
import { OrdersService } from './services/orders.service';
import { MessagePattern } from '@nestjs/microservices';
import { IOrdersGetResponse } from './interfaces/api/get-orders-response.interface';

export interface NewOrder {
  symbol: string;
  side: string;
  type: string;
  quantity: number;
  strategy: string;
}

@Controller()
export class OrdersController {
  constructor(private readonly orderService: OrdersService) {}

  @MessagePattern({ cmd: 'order_new' })
  placeOrder(newOrder: NewOrder) {
    this.orderService.newOrder(newOrder);
    return true;
  }

  @MessagePattern({ cmd: 'orders_get_all' })
  public async getAllOrders(data: {
    limit: number;
    symbol: string;
  }): Promise<IOrdersGetResponse> {
    let result: IOrdersGetResponse;
    try {
      const orders = await this.orderService.getAll(data.limit, data.symbol);
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

  // @MessagePattern({ cmd: 'order_bulk' })
  // placeOrderBulk(): string {
  //   return this.orderService.newOrder();
  // }

  // @MessagePattern({ cmd: 'order_cancel' })
  // cancelOrder(): string {
  //   return this.orderService.newOrder();
  // }
}
