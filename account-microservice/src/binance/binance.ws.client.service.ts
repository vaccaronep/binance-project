import * as WebSocket from 'ws';
import { timer } from 'rxjs';
import { BinanceHttpService } from './binance.http.service';
import { AccountUpdate } from 'src/interfaces/stream/account.update.interface';
import { RedisService } from 'src/services/redis.service';

export class WSService {
  private ws: WebSocket;
  private isConnect = false;
  private listenKey: string = '';
  private withoutReconnect: boolean = false;
  private interval: any;
  private apiKey: string;
  private wsUrl: string;
  private userId: string;

  constructor(
    private http: BinanceHttpService,
    private redisClient: RedisService,
    private config: any,
  ) {
    this.apiKey = this.config.api_key;
    this.wsUrl = this.config.ws_url;
    this.userId = this.config.userId;
  }

  async connect() {
    if (!this.listenKey) {
      const listenKey = await this.http.getLisnetKey(this.apiKey);
      this.listenKey = listenKey;
    }

    this.interval = setInterval(
      () => this.http.refreshListenKey(this.listenKey, this.apiKey),
      1200000,
    );

    this.ws = new WebSocket(`${this.wsUrl}/${this.listenKey}`);

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

    this.ws.on('message', (message: any) => {
      const binanceMessage: AccountUpdate = JSON.parse(message.toString());

      if (binanceMessage.e === 'outboundAccountPosition') {
        const message = JSON.stringify(binanceMessage);
        this.redisClient.publish('account_update', { message });
      }
    });
  }

  async close(withoutReconnect: boolean) {
    clearInterval(this.interval);
    this.withoutReconnect = withoutReconnect;
    this.ws.close();
  }

  getIsConnect() {
    return this.isConnect;
  }
}
