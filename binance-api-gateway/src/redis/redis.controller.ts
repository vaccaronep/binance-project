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
    console.log(data.message);
    this.gateway.newMessage(data.message, data.configId);
  }

  @EventPattern('account_update')
  accountUpdate(message: string) {
    this.gateway.updateAccount(message);
  }
}
