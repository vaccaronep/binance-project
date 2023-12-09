import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { encryptParams } from 'src/helpers/crypto.helper';
import { buildQueryString } from 'src/helpers/http.helper';

@Injectable()
export class BinanceHttpService {
  constructor(
    private http: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getLisnetKey(apiKey: string): Promise<string> {
    const {
      data: { listenKey },
    } = await firstValueFrom(
      this._publicRequest('POST', '/api/v3/userDataStream', apiKey),
    );
    return listenKey;
  }

  async refreshListenKey(listenKey: string, apiKey: string) {
    await firstValueFrom(
      this._publicRequest('PUT', '/api/v3/userDataStream', apiKey, {
        listenKey,
      }),
    );
  }

  async getAccount(apiUrl: string, apikey: string, secret: string) {
    try {
      const result = await firstValueFrom(
        await this._privateRequest(
          apiUrl,
          'GET',
          '/api/v3/account',
          apikey,
          secret,
        ),
      );
      return result;
    } catch (error) {
      console.log(error);
    }
  }

  async getAccountTradeList(
    apiUrl: string,
    apiKey: string,
    secret: string,
    ticker: string,
  ) {
    try {
      const result = await firstValueFrom(
        await this._privateRequest(
          apiUrl,
          'GET',
          '/api/v3/myTrades',
          apiKey,
          secret,
          {
            symbol: ticker,
          },
        ),
      );
      return result;
    } catch (error) {
      console.log(error);
    }
  }

  private async getServerData(apikey: string) {
    const {
      data: { serverTime },
    } = await firstValueFrom(
      this._publicRequest('GET', '/api/v1/time', apikey),
    );
    return serverTime;
  }

  private _publicRequest(
    method: string,
    path: string,
    apiKey: string,
    params: any = {},
  ) {
    params = buildQueryString(params);
    if (params !== '') {
      path = `${path}?${params}`;
    }
    return this.http.request({
      method,
      baseURL: this.configService.get('BINANCE_API_TEST_BASE_URL'),
      url: path,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
        'X-MBX-APIKEY': apiKey,
      },
    });
  }

  private async _privateRequest(
    apiUrl: string,
    method: string,
    path: string,
    apiKey: string,
    secret: string,
    params: any = {},
  ) {
    const timestamp = await this.getServerData(apiKey);
    const queryString = buildQueryString({ ...params, timestamp });
    const signature = encryptParams(secret, queryString);

    try {
      const res = this.http.request({
        method,
        baseURL: apiUrl,
        url: `${path}?${queryString}&signature=${signature}`,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent':
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
          'X-MBX-APIKEY': apiKey,
        },
      });
      return res;
    } catch (error) {
      console.log(error);
    }
  }
}
