import { Controller } from '@nestjs/common';
import { OrdersService } from './services/orders.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class OrdersController {
  constructor(private readonly orderService: OrdersService) {}

  @MessagePattern({ cmd: 'order_new' })
  placeOrder(): string {
    return this.orderService.newOrder();
  }

  //submit order
  //market
  //limit
  //take_profit
  //stop_loss<<
}
