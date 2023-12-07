import * as WebSocket from 'ws';
import { firstValueFrom, timer } from 'rxjs';
import { BinanceHttpService } from './binance.http.service';
import { OrderUpdate } from 'src/interfaces/stream/order.update.interface';
import { RedisService } from 'src/services/redis.service';
import { OrdersService } from 'src/services/orders.service';
import { ClientProxy } from '@nestjs/microservices';
// import { OrderUpdate } from 'src/interfaces/stream/order.update.interface';

export class WSService {
  private ws: WebSocket;
  private isConnect = false;
  private listenKey: string = '';
  private withoutReconnect: boolean = false;
  private api_key: string;
  private api_secret: string;
  private ws_url: string;
  private userId: string;
  private is_futures: boolean;

  constructor(
    private http: BinanceHttpService,
    private redisClient: RedisService,
    private config: any, //TODO: tipear el config
    private orderClient: OrdersService,
    private rulesService: ClientProxy,
  ) {
    console.log('connected user: ' + config.userId);
    this.api_key = this.config.api_key;
    this.api_secret = this.config.api_secret;
    this.ws_url = this.config.ws_url;
    this.userId = this.config.userId;
    this.is_futures = this.config.is_futures;
  }

  async connect() {
    if (!this.listenKey) {
      const listenKey = await this.http.getLisnetKey(this.api_key);
      this.listenKey = listenKey;
    }

    // setInterval(
    //   () => this.http.refreshListenKey(this.listenKey, this.apiKey),
    //   1200000,
    // );

    this.ws = new WebSocket(`${this.ws_url}/${this.listenKey}`);

    this.ws.on('open', () => {
      this.isConnect = true;
      console.log('The connection is established.');
    });

    this.ws.on('ping', (data: Buffer) => {
      console.log(`A ping ${data.toString()} is received from the server.`);
      this.ws.pong();
    });

    this.ws.on('pong', () => {
      console.log('Received PONG from server');
    });

    this.ws.on('error', (message) => {
      console.log(message);
      this.ws.close();
      this.isConnect = false;
    });

    this.ws.on('close', (message) => {
      console.log(message);
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
        const savedObject = await this.orderClient.saveOrder(binanceMessage);

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
            if (rules)
              this.orderClient.placeStopLossAndTakeProfit(
                this.config,
                rules[0],
                savedObject,
              );
          }
        }

        this.redisClient.publish('order_update', {
          message: JSON.stringify(savedObject),
        });
      }
    });
  }

  close(withoutReconnect: boolean) {
    this.withoutReconnect = withoutReconnect;
    this.ws.close();
  }

  getIsConnect() {
    return this.isConnect;
  }
}
