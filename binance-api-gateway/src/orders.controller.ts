import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Authorization } from './decorators/auth.decorator';
import { Permission } from './decorators/permission.decorator';
import { IAuthorizedRequest } from './interfaces/common/authorized-request.interface';

@Controller('orders')
@ApiTags('orders')
export class OrdersController {
  constructor(
    @Inject('ORDERS_SERVICE') private readonly ordersMicroService: ClientProxy,
  ) {}

  @Get('/all')
  @Authorization(true)
  @Permission('orders_get_all')
  async findAll(
    @Query('configId') configId: string,
    @Query('limit') limit?: string,
    @Query('symbol') symbol?: string,
  ) {
    const ordersMicroserviceResponse: any = await firstValueFrom(
      this.ordersMicroService.send(
        { cmd: 'orders_get_all' },
        { configId, limit, symbol },
      ),
    );

    if (ordersMicroserviceResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: ordersMicroserviceResponse.message,
          data: null,
          errors: ordersMicroserviceResponse.errors,
        },
        ordersMicroserviceResponse.status,
      );
    }
    return {
      message: ordersMicroserviceResponse.message,
      data: {
        orders: ordersMicroserviceResponse.orders,
      },
      errors: null,
    };
  }

  @Get('/all/binance')
  @Authorization(true)
  async getAllBinance(
    @Query('configId') configId: string,
    @Query('limit') limit?: string,
    @Query('symbol') symbol?: string,
  ) {
    const ordersMicroserviceResponse: any = await firstValueFrom(
      this.ordersMicroService.send(
        { cmd: 'orders_get_all_binance' },
        { configId, symbol },
      ),
    );

    return ordersMicroserviceResponse;

    // if (ordersMicroserviceResponse.status !== HttpStatus.OK) {
    //   throw new HttpException(
    //     {
    //       message: ordersMicroserviceResponse.message,
    //       data: null,
    //       errors: ordersMicroserviceResponse.errors,
    //     },
    //     ordersMicroserviceResponse.status,
    //   );
    // }
    // return {
    //   message: ordersMicroserviceResponse.message,
    //   data: {
    //     orders: ordersMicroserviceResponse.orders,
    //   },
    //   errors: null,
    // };
  }

  @Post('/new_order')
  @Authorization(true)
  @Permission('order_new')
  async createOrder(
    @Body()
    data: {
      quantity: number;
      symbol: string;
      side: string;
      type: string;
      strategy: string;
    },
    @Req() request: IAuthorizedRequest,
    @Query('configId') configId: string,
  ) {
    const userId = request.user.id;
    const ordersMicroserviceResponse: any = await firstValueFrom(
      this.ordersMicroService.send(
        { cmd: 'order_new' },
        { order: data, userId, configId },
      ),
    );
    return {
      response: ordersMicroserviceResponse,
    };
  }
}
