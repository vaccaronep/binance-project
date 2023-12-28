import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from 'src/redis/redis.module';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { BinanceWsWrapper } from './binance.ws';

@Module({
  imports: [ConfigModule, RedisModule],
  providers: [
    BinanceWsWrapper,
    ConfigService,
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
    {
      provide: 'USERS_SERVICE',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            host: configService.get('USERS_SERVICE_HOST'),
            port: configService.get('USERS_SERVICE_PORT'),
          },
        });
      },
    },
    {
      provide: 'ACCOUNT_SERVICE',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            host: configService.get('ACCOUNT_SERVICE_HOST'),
            port: configService.get('ACCOUNT_SERVICE_PORT'),
          },
        });
      },
    },
  ],
  exports: [BinanceWsWrapper],
})
export class BinanceModule {}
