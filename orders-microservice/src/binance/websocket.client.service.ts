// socket-client.ts
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import * as WebSocket from 'ws';
import { timer } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { BinanceHttpService } from './binance.http.service';
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
    @Inject('API_GATEWAY_SUBSCRIBER') private client: ClientProxy,
  ) {}
  onModuleInit() {
    this.apiKey = this.configService.get('BINANCE_API_KEY');
    // this.connect();
    // setInterval(
    //   () => this.http.refreshListenKey(this.listenKey, this.apiKey),
    //   1200000,
    // );
  }

  async connect() {
    if (!this.listenKey) {
      const listenKey = await this.http.getLisnetKey(this.apiKey);
      this.listenKey = listenKey;
    }

    this.ws = new WebSocket(
      `${this.configService.get('BINANCE_WS_BASE_URL_MULTIPLE')}=${
        this.listenKey
      }`,
    );

    this.ws.on('open', () => {
      this.isConnect = true;
      console.log('The connection is established.');
    });

    this.ws.on('ping', (data: Buffer) => {
      console.log(`A ping ${data.toString()} is received from the server.`);
      this.ws.pong();
      // this.client.emit('order_update', { message: data.toString() });
      // this.http.getAccount(
      //   this.configService.get('BINANCE_API_KEY'),
      //   this.configService.get('BINANCE_API_SECRET'),
      // );
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
      // const binanceMessage: OrderUpdate = JSON.parse(message.toString());
      // if (binanceMessage.e === 'executionReport') {
      //   this.client.emit('order_update', { message: binanceMessage });
      // }
      console.log(JSON.stringify(message.toString()));
    });
  }

  getIsConnect() {
    return this.isConnect;
  }
}
