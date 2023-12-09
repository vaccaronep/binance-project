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

  async getLisnetKey(baseUrl: string, apiKey: string): Promise<string> {
    const {
      data: { listenKey },
    } = await firstValueFrom(
      this._publicRequest(baseUrl, 'POST', '/api/v3/userDataStream', apiKey),
    );
    return listenKey;
  }

  async refreshListenKey(baseUrl: string, listenKey: string, apiKey: string) {
    await firstValueFrom(
      this._publicRequest(baseUrl, 'PUT', '/api/v3/userDataStream', apiKey, {
        listenKey,
      }),
    );
  }

  async getAllOrders(
    baseUrl: string,
    apikey: string,
    secret: string,
    params: any,
  ) {
    const data = await firstValueFrom(
      await this._privateRequest(
        baseUrl,
        'GET',
        '/api/v3/allOrders',
        apikey,
        secret,
        params,
      ),
    );
    return data;
  }

  async placeNewOrder(
    baseUrl: string,
    apikey: string,
    secret: string,
    params: any,
  ) {
    const data = await firstValueFrom(
      await this._privateRequest(
        baseUrl,
        'POST',
        '/api/v3/order',
        apikey,
        secret,
        params,
      ),
    );
    return data;
  }

  async placeNewOcoOrder(
    baseUrl: string,
    apikey: string,
    secret: string,
    params: any,
  ) {
    const data = await firstValueFrom(
      await this._privateRequest(
        baseUrl,
        'POST',
        '/api/v3/order/oco',
        apikey,
        secret,
        params,
      ),
    );
    return data;
  }

  private async getServerData(baseUrl: string, apikey: string) {
    const {
      data: { serverTime },
    } = await firstValueFrom(
      this._publicRequest(baseUrl, 'GET', '/api/v1/time', apikey),
    );
    return serverTime;
  }

  private _publicRequest(
    baseUrl: string,
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
      baseURL: baseUrl,
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
    baseUrl: string,
    method: string,
    path: string,
    apiKey: string,
    secret: string,
    params: any = {},
  ) {
    const timestamp = await this.getServerData(baseUrl, apiKey);
    const queryString = buildQueryString({ ...params, timestamp });
    const signature = encryptParams(secret, queryString);
    try {
      const res = this.http.request({
        method,
        baseURL: baseUrl,
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
