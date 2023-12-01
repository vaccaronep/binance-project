import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PythonAnyWhereHttp {
  constructor(
    private http: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async updateConfiguration(
    ticker: string,
    strategyId: number,
    market: string,
    pyramiding: number,
    qty: number,
    actual_trade: number,
  ) {
    const url = `${this.configService.get('PYTHON_ANYWHERE_BASE_URL')}/config`;
    const { data } = await firstValueFrom(
      await this.http.post(url, {
        key: `${strategyId}_${market}_${ticker}`,
        pyramiding,
        qty,
        actual_trade,
        is_active: true,
        strategyId,
      }),
    );
    return data;
  }

  async getConfigurations() {
    const { data } = await firstValueFrom(
      await this.http.request({
        method: 'GET',
        baseURL: this.configService.get('PYTHON_ANYWHERE_BASE_URL'),
        url: '/config',
      }),
    );
    return data;
  }
}
