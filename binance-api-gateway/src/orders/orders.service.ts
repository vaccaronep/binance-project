import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OrdersService {
  constructor(
    @Inject('ORDERS_SERVICE') private readonly ordersMicroService: ClientProxy,
  ) {}

  async findAll() {
    const ordersMicroserviceResponse: any = await firstValueFrom(
      this.ordersMicroService.send({ cmd: 'get_hello' }, {}),
    );
    return {
      response: ordersMicroserviceResponse,
    };
  }
}
