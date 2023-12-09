import * as WebSocket from 'ws';
import { firstValueFrom, timer } from 'rxjs';
import { BinanceHttpService } from './binance.http.service';
import { OrderUpdate } from 'src/interfaces/stream/order.update.interface';
import { RedisService } from 'src/services/redis.service';
import { OrdersService } from 'src/services/orders.service';
import { ClientProxy } from '@nestjs/microservices';

export class WSService {
  private ws: WebSocket;
  private isConnect = false;
  private listenKey: string = '';
  private withoutReconnect: boolean = false;
  private api_key: string;
  private api_secret: string;
  private ws_url: string;
  private api_url: string;
  private userId: string;
  private is_futures: boolean;
  private interval: any;

  constructor(
    private http: BinanceHttpService,
    private redisClient: RedisService,
    private config: any, //TODO: tipear el config
    private orderClient: OrdersService,
    private rulesService: ClientProxy,
  ) {
    this.api_key = this.config.api_key;
    this.api_secret = this.config.api_secret;
    this.ws_url = this.config.ws_url;
    this.userId = this.config.userId;
    this.is_futures = this.config.is_futures;
    this.api_url = this.config.api_url;
  }

  async connect() {
    if (!this.listenKey) {
      const listenKey = await this.http.getLisnetKey(
        this.api_url,
        this.api_key,
      );
      this.listenKey = listenKey;
    }

    this.interval = setInterval(() => {
      console.log(`[${this.config.name}] - refreshing license key`);
      this.http.refreshListenKey(this.api_url, this.listenKey, this.api_key);
    }, 1200000);

    this.ws = new WebSocket(`${this.ws_url}/${this.listenKey}`);

    this.ws.on('open', () => {
      this.isConnect = true;
      console.log(`[${this.config.name}] - The connection is established.`);
    });

    this.ws.on('ping', (data: Buffer) => {
      console.log(
        `[${
          this.config.name
        }] - A ping ${data.toString()} is received from the server.`,
      );
      this.ws.pong();
    });

    this.ws.on('pong', () => {
      console.log(`[${this.config.name}] - Received PONG from server`);
    });

    this.ws.on('error', (message) => {
      console.log(`[${this.config.name}] - ${message}`);
      this.ws.close();
      this.isConnect = false;
    });

    this.ws.on('close', (message) => {
      console.log(`[${this.config.name}] - ${message}`);
      if (!this.withoutReconnect) {
        timer(5000).subscribe(() => {
          this.isConnect = false;
          this.listenKey = '';
          this.connect();
        });
      }
    });

    this.ws.on('message', async (message: any) => {
      const binanceMessage: OrderUpdate = JSON.parse(message.toString());
      if (binanceMessage.e === 'executionReport') {
        console.log(`[${this.config.name}] - recieving order message`);
        const savedObject = await this.orderClient.saveOrder(
          this.config._id,
          binanceMessage,
        );

        if (
          savedObject.currentOrderStatus === 'FILLED' &&
          savedObject.orderType === 'MARKET'
        ) {
          const rulesResponse = await firstValueFrom(
            this.rulesService.send(
              { cmd: 'rules_get_all' },
              {
                ticker: savedObject.symbol,
                userId: this.config.userId,
                is_active: true,
                strategyId: savedObject.strategyId,
                is_futures: this.config.is_futures,
              },
            ),
          );

          if (rulesResponse.status === 200) {
            const rules = rulesResponse.rules;
            if (rules && rules.length)
              this.orderClient.placeStopLossAndTakeProfit(
                this.config,
                rules[0],
                savedObject,
              );
          }
        }

        this.redisClient.publish('order_update', {
          message: JSON.stringify(savedObject),
          configId: this.config._id,
        });
      }
    });
  }

  close(withoutReconnect: boolean) {
    clearInterval(this.interval);
    this.withoutReconnect = withoutReconnect;
    this.ws.close();
  }

  getIsConnect() {
    return this.isConnect;
  }
}
