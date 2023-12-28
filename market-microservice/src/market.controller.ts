import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { BinanceWsWrapper } from './binance/binance.ws';

@Controller()
export class MarketController {
  constructor(private readonly wsService: BinanceWsWrapper) {}

  @MessagePattern({ cmd: 'market_add_ws_user' })
  async addUserToWs(data: { userId: string; configId: string }) {
    console.log('recibiendo mensaje adicionar ws:' + data.configId);
    this.wsService.connectNewWs(data.configId);
  }

  @MessagePattern({ cmd: 'market_remove_ws_user' })
  async removeUserToWs(data: { userId: string; configId: string }) {
    console.log('recibiendo mensaje remover ws:' + data.configId);
    this.wsService.removeNewWs(data.configId);
  }

  @MessagePattern({ cmd: 'market_reconnect_ws_user' })
  async recconectWs(data: { userId: string; configId: string }) {
    console.log('recibiendo mensaje reconectar ws:' + data.configId);
    this.wsService.reconnectWs(data.configId);
  }

  @MessagePattern({ cmd: 'market_add_ticker_to_ws' })
  async addTickerToWs(data: { userId: string; ticker: string }) {
    this.wsService.subscribeNewTicker(data.userId, data.ticker);
  }

  @MessagePattern({ cmd: 'market_remove_ticker_to_ws' })
  async removeTickerFromWs(data: { userId: string; ticker: string }) {
    this.wsService.unsubscribeNewTicker(data.userId, data.ticker);
  }
}
