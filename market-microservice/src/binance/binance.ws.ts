import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { WSService } from './binance.ws.client.service';
import { RedisService } from 'src/services/redis.service';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class BinanceWsWrapper implements OnModuleInit {
  private webSockets: { [configId: string]: WSService } = {};

  constructor(
    private redisClient: RedisService,
    @Inject('USERS_SERVICE') private userService: ClientProxy,
    @Inject('ACCOUNT_SERVICE') private accountService: ClientProxy,
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
        if (user.wishlist) {
          const apiResponse = await firstValueFrom(
            this.accountService.send(
              { cmd: 'account_get_keys' },
              {
                userId: user.id,
                is_active: true,
                market_activated: true,
              },
            ),
          );
          if (apiResponse.status === 200) {
            apiResponse.configs.forEach((config) => {
              if (user.wishlist.length)
                this.addWsToDictionary(config, user.wishlist);
            });
          }
        }
      });
    }
  }

  addWsToDictionary(config: any, wishlist: string[]) {
    console.log('adding ws config: ' + config._id);
    const key = `${config._id}`;
    if (typeof this.webSockets[key] === 'undefined') {
      this.webSockets[key] = new WSService(this.redisClient, config);
      this.webSockets[key].connect(wishlist);
    }
  }

  async reconnectWs(configId: string) {
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

      const userData = await firstValueFrom(
        this.userService.send(
          { cmd: 'users_get_all' },
          {
            is_active: true,
            is_confirmed: true,
            userId: config.userId,
          },
        ),
      );

      if (userData.status === 200) {
        const user = userData.users[0];
        if (typeof this.webSockets[config._id] !== 'undefined') {
          this.webSockets[config._id].close(true);
          delete this.webSockets[config._id];
          if (user.wishlist.length)
            this.addWsToDictionary(config, user.wishlist);
        }
      }
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
      if (typeof this.webSockets[config._id] !== 'undefined') {
        this.webSockets[config._id].close(true);
        delete this.webSockets[config._id];
      }
    }
  }
  async connectNewWs(configId: string) {
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
        const userData = await firstValueFrom(
          this.userService.send(
            { cmd: 'users_get_all' },
            {
              is_active: true,
              is_confirmed: true,
              userId: config.userId,
            },
          ),
        );
        if (userData.status === 200) {
          const user = userData.users[0];
          if (user.wishlist.length)
            this.addWsToDictionary(config, user.wishlist);
        }
      }
    }
  }

  public async subscribeNewTicker(userId: string, ticker: string) {
    const apiResponse = await firstValueFrom(
      this.accountService.send(
        { cmd: 'account_get_keys' },
        {
          userId,
          is_active: true,
          market_activated: true,
        },
      ),
    );

    if (apiResponse.status === 200) {
      apiResponse.configs.forEach((config) => {
        const key = `${config._id}`;
        if (typeof this.webSockets[key] !== 'undefined') {
          this.webSockets[key].subscribe(ticker);
        }
      });
    }
  }

  public async unsubscribeNewTicker(userId: string, ticker: string) {
    const apiResponse = await firstValueFrom(
      this.accountService.send(
        { cmd: 'account_get_keys' },
        {
          userId,
          is_active: true,
          market_activated: true,
        },
      ),
    );

    if (apiResponse.status === 200) {
      apiResponse.configs.forEach((config) => {
        const key = `${config._id}`;
        if (typeof this.webSockets[key] !== 'undefined') {
          this.webSockets[key].unsubscribe(ticker);
        }
      });
    }
  }
}
