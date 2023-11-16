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
  orderUpdate(message: string) {
    console.log('desde order update ' + message);
    this.gateway.newMessage(message);
  }

  @EventPattern('account_update')
  accountUpdate(message: string) {
    console.log('desde account update ' + message);
    this.gateway.updateAccount(message);
  }
}
