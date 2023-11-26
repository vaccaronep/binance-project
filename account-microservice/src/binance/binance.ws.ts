import { Injectable, OnModuleInit } from '@nestjs/common';
import { WSService } from './binance.ws.client.service';
import { ConfigService } from '@nestjs/config';
import { BinanceHttpService } from './binance.http.service';
import { RedisService } from 'src/services/redis.service';
import { DbService } from 'src/services/db.service';
import { IConfig } from 'src/interfaces/config.interface';

@Injectable()
export class BinanceWsWrapper implements OnModuleInit {
  private webSockets: { [userId: string]: WSService } = {};

  constructor(
    private configService: ConfigService,
    private http: BinanceHttpService,
    private redisClient: RedisService,
    // @Inject(forwardRef(() => AccountService))
    private dbService: DbService,
  ) {}

  onModuleInit() {
    this.initializeWs();
  }

  async initializeWs() {
    //BASE DE DATOS A OBTENER USUARIOS Y ME TRAIGO LA KEY, SECRET Y SI ES PAPPER TRADING.
    //POR CADA USER HAGO UN NEW WS_SERVICE
    //LA KEY DEBERIA SER USER_ID_SPOT/FUTURES_REAL/PAPPER
    // const accounts = await this.dbService.getAccountKeys();
    // console.log(accounts);
    // if (this.configService.get('CONNECT')) {
    //   const users = [];
    //   users.forEach((user) => {
    //     this.webSockets[user.id] = new WSService(
    //       this.configService,
    //       this.http,
    //       this.redisClient,
    //       '',
    //       '',
    //       '',
    //     );
    //     this.webSockets[user.id].connect();
    //   });
    // }
  }

  private addWsToDictionary(config: IConfig) {
    if (typeof this.webSockets[config.userId] === 'undefined') {
      this.webSockets[config.userId] = new WSService(
        this.configService,
        this.http,
        this.redisClient,
        config.api_key,
        config.api_secret,
        this.configService.get('BINANCE_WS_TEST_BASE_URL'),
        config.userId,
      );
      this.webSockets[config.userId].connect();
    }
  }

  async connectNewWs(userId: string) {
    const config = await this.dbService.getAccountKeysByUser(userId);
    console.log(config);
    if (config) this.addWsToDictionary(config);
  }

  async removeNewWs(userId: string) {
    if (typeof this.webSockets[userId] !== 'undefined') {
      this.webSockets[userId].close(true);
      delete this.webSockets[userId];
    }
  }
}
