import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BinanceHttpService } from 'src/binance/binance.http.service';

@Injectable()
export class AccountService {
  constructor(
    @Inject(forwardRef(() => BinanceHttpService))
    private readonly binanceHttpService: BinanceHttpService,
    private readonly configService: ConfigService,
  ) {}

  async getAccount() {
    const apikey = this.configService.get('BINANCE_TEST_API_KEY');
    const secret = this.configService.get('BINANCE_TEST_API_SECRET');
    const response = await this.binanceHttpService.getAccount(apikey, secret);
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
    return response.data;
  }
}
