// socket-client.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as WebSocket from 'ws';
import { timer } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { BinanceHttpService } from './binance.http.service';
import { AccountUpdate } from 'src/interfaces/stream/account.update.interface';
import { RedisService } from 'src/services/redis.service';
// import { OrderUpdate } from 'src/interfaces/stream/order.update.interface';

@Injectable()
export class WSService implements OnModuleInit {
  private ws: WebSocket;
  private isConnect = false;
  private listenKey: string = '';
  private apiKey: string;

  constructor(
    private configService: ConfigService,
    private http: BinanceHttpService,
    private redisClient: RedisService,
  ) {}
  onModuleInit() {
    this.apiKey = this.configService.get('BINANCE_TEST_API_KEY');
    this.connect();
    setInterval(
      () => this.http.refreshListenKey(this.listenKey, this.apiKey),
      1200000,
    );
  }

  async connect() {
    if (!this.listenKey) {
      const listenKey = await this.http.getLisnetKey(this.apiKey);
      this.listenKey = listenKey;
    }

    this.ws = new WebSocket(
      `${this.configService.get('BINANCE_WS_TEST_BASE_URL')}/${this.listenKey}`,
    );

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
      timer(5000).subscribe(() => {
        this.isConnect = false;
        this.listenKey = '';
        this.connect();
      });
    });

    this.ws.on('message', (message: any) => {
      const binanceMessage: AccountUpdate = JSON.parse(message.toString());

      if (binanceMessage.e === 'outboundAccountPosition') {
        const message = JSON.stringify(binanceMessage);
        this.redisClient.publish('account_update', { message });
      }
    });
  }

  getIsConnect() {
    return this.isConnect;
  }
}
