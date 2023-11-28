import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { WSService } from './binance.ws.client.service';
import { ConfigService } from '@nestjs/config';
import { BinanceHttpService } from './binance.http.service';
import { RedisService } from 'src/services/redis.service';
import { DbService } from 'src/services/db.service';
import { IConfig } from 'src/interfaces/config.interface';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class BinanceWsWrapper implements OnModuleInit {
  private webSockets: { [userId: string]: WSService } = {};

  constructor(
    private configService: ConfigService,
    private http: BinanceHttpService,
    private redisClient: RedisService,
    private dbService: DbService,
    @Inject('USERS_SERVICE') private accountService: ClientProxy,
  ) {}

  onModuleInit() {
    this.initializeWs();
  }

  async initializeWs() {
    const data = await firstValueFrom(
      this.accountService.send(
        { cmd: 'users_get_all' },
        {
          is_active: true,
          is_confirmed: true,
          account_activated: true,
        },
      ),
    );

    if (data.status === 200) {
      data.users.map(async (user) => {
        console.log('activating ws to ->' + user.id);
        const configs = await this.dbService.getAccountKeysByUser({
          userId: user.id,
          is_active: true,
        });
        if (configs) {
          configs.forEach((config) => {
            this.addWsToDictionary(config);
          });
        }
      });
    }
  }

  private addWsToDictionary(config: IConfig) {
    const key = `${config.id}`;
    if (typeof this.webSockets[key] === 'undefined') {
      this.webSockets[key] = new WSService(
        this.configService,
        this.http,
        this.redisClient,
        config.api_key,
        config.api_secret,
        this.configService.get('BINANCE_WS_TEST_BASE_URL'),
        config.userId,
      );
      this.webSockets[key].connect();
    }
  }

  async connectNewWs(userId: string) {
    const configs = await this.dbService.getAccountKeysByUser({
      userId,
      is_active: true,
    });
    if (configs) {
      configs.forEach((config) => {
        this.addWsToDictionary(config);
      });
    }
  }

  async removeNewWs(userId: string) {
    const configs = await this.dbService.getAccountKeysByUser({ userId });
    configs.forEach((config) => {
      if (typeof this.webSockets[config.id] !== 'undefined') {
        this.webSockets[config.id].close(true);
        delete this.webSockets[config.id];
      }
    });
  }
}
