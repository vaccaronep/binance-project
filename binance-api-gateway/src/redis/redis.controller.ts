import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { RedisService } from './redis.service';
import { MyGateway } from './gateway';

@Controller()
export class RedisController {
  constructor(
    private readonly redisService: RedisService,
    private readonly gateway: MyGateway,
  ) {}

  @EventPattern('new_order')
  new_order() {
    return console.log('nueva orden generada, emitir mensaje al websocket');
  }

  @EventPattern('order_update')
  orderUpdate(data: { message: string; configId: string }) {
    this.gateway.newMessage(data);
  }

  @EventPattern('account_update')
  accountUpdate(data: { message: string; configId: string }) {
    this.gateway.updateAccount(data);
  }
}
