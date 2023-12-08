import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { WSService } from './binance.ws.client.service';
import { BinanceHttpService } from './binance.http.service';
import { RedisService } from 'src/services/redis.service';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { OrdersService } from 'src/services/orders.service';

@Injectable()
export class BinanceWsWrapper implements OnModuleInit {
  private webSockets: { [configId: string]: WSService } = {};

  constructor(
    private http: BinanceHttpService,
    private redisClient: RedisService,
    private orderClient: OrdersService,
    @Inject('USERS_SERVICE') private userService: ClientProxy,
    @Inject('ACCOUNT_SERVICE') private accountService: ClientProxy,
    @Inject('RULES_SERVICE') private rulesService: ClientProxy,
  ) {}

  onModuleInit() {
    this.initializeWs();
  }
  async initializeWs() {
    const data = await firstValueFrom(
      this.userService.send(
        { cmd: 'users_get_all' },
        {
          is_active: true,
          is_confirmed: true,
        },
      ),
    );

    if (data.status === 200) {
      data.users.map(async (user) => {
        console.log('activating ws to ->' + user.id);
        const apiResponse = await firstValueFrom(
          this.accountService.send(
            { cmd: 'account_get_keys' },
            {
              userId: user.id,
              is_active: true,
              orders_activated: true,
            },
          ),
        );
        if (apiResponse.status === 200) {
          apiResponse.configs.forEach((config) => {
            this.addWsToDictionary(config);
          });
        }
      });
    }
  }

  addWsToDictionary(config: any) {
    const key = `${config.id}`;
    if (typeof this.webSockets[key] === 'undefined') {
      this.webSockets[key] = new WSService(
        this.http,
        this.redisClient,
        config,
        this.orderClient,
        this.rulesService,
      );
      this.webSockets[key].connect();
    }
  }

  async removeNewWs(configId: string) {
    const apiResponse = await firstValueFrom(
      this.accountService.send(
        { cmd: 'account_get_keys_by_id' },
        {
          configId,
          is_active: true,
        },
      ),
    );
    if (apiResponse.status === 200) {
      const config = apiResponse.configs[0];
      if (typeof this.webSockets[config.id] !== 'undefined') {
        this.webSockets[config.id].close(true);
        delete this.webSockets[config.id];
      }
    }
  }
  async connectNewWs(configId: string) {
    console.log('conectando ws:' + configId);
    const apiResponse = await firstValueFrom(
      this.accountService.send(
        { cmd: 'account_get_keys_by_id' },
        {
          configId,
          is_active: true,
        },
      ),
    );
    if (apiResponse.status === 200) {
      const config = apiResponse.configs[0];
      if (config) {
        this.addWsToDictionary(config);
      }
    }
  }
}
