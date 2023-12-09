import { Inject, Injectable, OnModuleInit, forwardRef } from '@nestjs/common';
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
    @Inject(forwardRef(() => DbService))
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
        },
      ),
    );

    if (data.status === 200) {
      data.users.map(async (user) => {
        console.log('activating ws to ->' + user.id);
        const configs = await this.dbService.getAccountKeysByUser({
          userId: user.id,
          is_active: true,
          account_activated: true,
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
      this.webSockets[key] = new WSService(this.http, this.redisClient, config);
      this.webSockets[key].connect();
    }
  }

  async reconnectWs(config: IConfig) {
    if (typeof this.webSockets[config.id] !== 'undefined') {
      this.webSockets[config.id].close(true);
      delete this.webSockets[config.id];
    }
    this.addWsToDictionary(config);
  }

  async connectNewWs(configId: string) {
    console.log('adding:' + configId);
    const config = await this.dbService.searchConfigById(configId);
    if (config) {
      this.addWsToDictionary(config);
    }
  }

  async removeNewWs(configId: string) {
    const config = await this.dbService.searchConfigById(configId);
    if (typeof this.webSockets[config.id] !== 'undefined') {
      this.webSockets[config.id].close(true);
      delete this.webSockets[config.id];
    }
  }
}
