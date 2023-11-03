import { Module } from '@nestjs/common';
import { BinanceService } from './binance.service';
import { WebsocketBinanceService } from './websocket.service';
import { WebSocketModule } from 'nestjs-websocket';

@Module({
  imports: [
    WebSocketModule.forRoot({
      url: 'wss://stream.binance.com:9443/ws/bnbusdt@trade',
    }),
  ],
  providers: [BinanceService, WebsocketBinanceService],
})
export class BinanceModule {}
