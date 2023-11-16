import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Authorization } from './decorators/auth.decorator';

@Controller('orders')
@ApiTags('orders')
export class OrdersController {
  constructor(
    @Inject('ORDERS_SERVICE') private readonly ordersMicroService: ClientProxy,
  ) {}

  @Get()
  @Authorization(true)
  async findAll() {
    const ordersMicroserviceResponse: any = await firstValueFrom(
      this.ordersMicroService.send({ cmd: 'get_hello' }, {}),
    );
    return {
      response: ordersMicroserviceResponse,
    };
  }

  @Post('/new_order')
  @Authorization(true)
  async createOrder(
    @Body()
    data: {
      quantity: number;
      symbol: string;
      side: string;
      type: string;
      strategy: string;
    },
  ) {
    console.log(data);
    const ordersMicroserviceResponse: any = await firstValueFrom(
      this.ordersMicroService.send({ cmd: 'order_new' }, data),
    );
    return {
      response: ordersMicroserviceResponse,
    };
  }
}
