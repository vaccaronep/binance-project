import * as WebSocket from 'ws';
import { timer } from 'rxjs';
import { RedisService } from 'src/services/redis.service';
import { MarketPriceUpdate } from 'src/interface/streams.interface';

export class WSService {
  private ws: WebSocket;
  private isConnect = false;
  private withoutReconnect: boolean = false;
  private ws_url: string;
  private userId: string;
  private wishlist: string[];

  constructor(
    private redisClient: RedisService,
    private config: any,
  ) {
    this.ws_url = this.config.ws_url;
    this.userId = this.config.userId;
  }

  async connect(wishlist: string[]) {
    this.ws = new WebSocket(`${this.ws_url}`);

    this.ws.on('open', () => {
      this.isConnect = true;
      const streams = wishlist.map((wl) => `${wl.toLocaleLowerCase()}@trade`);
      this.wishlist = wishlist;
      this.subscribe(streams);
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
          this.connect(this.wishlist);
        });
      }
    });

    this.ws.on('message', async (message: any) => {
      const trade: MarketPriceUpdate = JSON.parse(message.toString());
      this.redisClient.publish('market_update', {
        message: { price: trade.p, symbol: trade.s, quantity: trade.q },
        configId: this.config._id,
      });
    });
  }

  close(withoutReconnect: boolean) {
    this.withoutReconnect = withoutReconnect;
    this.ws.close();
  }

  subscribe(ticker) {
    let stream = ticker;
    if (!this.wishlist.length) {
      this.connect([ticker]);
    } else {
      if (!Array.isArray(ticker)) {
        stream = [`${ticker.toLocaleLowerCase()}@trade`];
      }
      const payload = {
        method: 'SUBSCRIBE',
        params: stream,
        id: Date.now(),
      };
      this.ws.send(JSON.stringify(payload));
    }
  }

  unsubscribe(ticker: string) {
    let stream = [];
    if (!Array.isArray(ticker)) {
      stream = [`${ticker.toLocaleLowerCase()}@trade`];
    }
    const payload = {
      method: 'UNSUBSCRIBE',
      params: stream,
      id: Date.now(),
    };

    this.ws.send(JSON.stringify(payload));

    this.wishlist = this.wishlist.filter(
      (symbol) => symbol.toLocaleLowerCase() !== ticker.toLocaleLowerCase(),
    );

    if (!this.wishlist.length) {
      this.close(true);
    }
  }

  getIsConnect() {
    return this.isConnect;
  }
}
