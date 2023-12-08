import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BinanceHttpService } from './binance.http.service';
import { HttpModule } from '@nestjs/axios';
import { RedisModule } from 'src/redis/redis.module';
import { BinanceWsWrapper } from './binance.ws';
import { DbService } from 'src/services/db.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigSchema } from 'src/schema/config.schema';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule.forRoot(),
    HttpModule,
    RedisModule,
    MongooseModule.forFeature([
      {
        name: 'Config',
        schema: ConfigSchema,
        collection: 'config',
      },
    ]),
  ],
  providers: [
    BinanceHttpService,
    ConfigService,
    BinanceWsWrapper,
    DbService,
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
      provide: 'ORDERS_SERVICE',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            host: configService.get('ORDERS_SERVICE_HOST'),
            port: configService.get('ORDERS_SERVICE_PORT'),
          },
        });
      },
    },
  ],
  exports: [BinanceHttpService, BinanceWsWrapper],
})
export class BinanceModule {}
