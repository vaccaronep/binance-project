import { Module } from '@nestjs/common';
import { BinanceService } from './binance.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WSService } from './binance.ws.client.service';
// import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { BinanceHttpService } from './binance.http.service';
import { HttpModule } from '@nestjs/axios';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [ConfigModule.forRoot(), HttpModule, RedisModule],
  providers: [
    BinanceHttpService,
    BinanceService,
    ConfigService,
    WSService,
    // {
    //   provide: 'API_GATEWAY_SUBSCRIBER',
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) => {
    //     return ClientProxyFactory.create({
    //       transport: Transport.REDIS,
    //       options: {
    //         host: configService.get('API_GATEWAY_HOST'),
    //         port: configService.get('API_GATEWAY_PORT'),
    //       },
    //     });
    //   },
    // },
  ],
  exports: [BinanceHttpService],
})
export class BinanceModule {}
