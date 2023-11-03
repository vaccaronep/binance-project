import { Controller } from '@nestjs/common';
import { OrdersService } from './services/orders.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly orderService: OrdersService) {}

  @MessagePattern({ cmd: 'get_hello' })
  getHello(): string {
    return this.orderService.getHello();
  }
}
