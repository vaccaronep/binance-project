import { Controller } from '@nestjs/common';
import { OrdersService } from './services/orders.service';
import { MessagePattern } from '@nestjs/microservices';

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

  // @MessagePattern({ cmd: 'order_bulk' })
  // placeOrderBulk(): string {
  //   return this.orderService.newOrder();
  // }

  // @MessagePattern({ cmd: 'order_cancel' })
  // cancelOrder(): string {
  //   return this.orderService.newOrder();
  // }

  //submit order
  //market
  //limit
  //take_profit
  //stop_loss<<
}
