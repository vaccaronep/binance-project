import { Injectable } from '@nestjs/common';
import { BinanceHttpService } from '../binance/binance.http.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AccountService {
  constructor(
    private readonly binanceHttpService: BinanceHttpService,
    private readonly configService: ConfigService,
  ) {}

  async getAccount() {
    const apikey = this.configService.get('BINANCE_TEST_API_KEY');
    const secret = this.configService.get('BINANCE_TEST_API_SECRET');
    const response = await this.binanceHttpService.getAccount(apikey, secret);
    console.log(response);
    return response.data;
  }

  async getAccountTrades(ticker: string) {
    const apikey = this.configService.get('BINANCE_TEST_API_KEY');
    const secret = this.configService.get('BINANCE_TEST_API_SECRET');
    const response = await this.binanceHttpService.getAccountTradeList(
      apikey,
      secret,
      ticker,
    );
    // response.status !== 200
    return response.data;
  }
}
