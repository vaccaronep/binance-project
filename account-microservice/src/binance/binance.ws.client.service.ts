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
  private api_url: string;
  private api_secret: string;
  private userId: string;

  constructor(
    private http: BinanceHttpService,
    private redisClient: RedisService,
    private config: any,
  ) {
    this.apiKey = this.config.api_key;
    this.api_secret = this.config.api_secret;
    this.wsUrl = this.config.ws_url;
    this.userId = this.config.userId;
    this.api_url = this.config.api_url;
  }

  async connect() {
    if (!this.listenKey) {
      const listenKey = await this.http.getLisnetKey(this.api_url, this.apiKey);
      this.listenKey = listenKey;
    }

    this.interval = setInterval(() => {
      console.log(`[${this.config.name}] - refreshing license key`);
      this.http.refreshListenKey(this.api_url, this.listenKey, this.apiKey);
    }, 1200000);

    this.ws = new WebSocket(`${this.wsUrl}/${this.listenKey}`);

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

    this.ws.on('message', (message: any) => {
      const binanceMessage: AccountUpdate = JSON.parse(message.toString());

      if (binanceMessage.e === 'outboundAccountPosition') {
        console.log(`[${this.config.name}] - recieving account message`);
        const message = JSON.stringify(binanceMessage);
        this.redisClient.publish('account_update', {
          message,
          configId: this.config._id,
        });
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
