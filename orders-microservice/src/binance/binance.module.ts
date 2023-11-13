import { Module } from '@nestjs/common';
import { BinanceService } from './binance.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WSService } from './websocket.client.service';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { BinanceHttpService } from './binance.http.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [ConfigModule.forRoot(), HttpModule],
  providers: [
    BinanceHttpService,
    BinanceService,
    ConfigService,
    WSService,
    {
      provide: 'API_GATEWAY_SUBSCRIBER',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.REDIS,
          options: {
            host: configService.get('API_GATEWAY_HOST'),
            port: configService.get('API_GATEWAY_PORT'),
          },
        });
      },
    },
  ],
})
export class BinanceModule {}
