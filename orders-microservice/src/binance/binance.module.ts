import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
// import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { BinanceHttpService } from './binance.http.service';
import { HttpModule } from '@nestjs/axios';
import { RedisModule } from 'src/redis/redis.module';
import { OrdersService } from 'src/services/orders.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoConfigService } from 'src/services/config/mongo.config.service';
import { OrderSchema } from 'src/schema/order.schema';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { BinanceWsWrapper } from './binance.ws';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    RedisModule,
    MongooseModule.forRootAsync({
      useClass: MongoConfigService,
    }),
    MongooseModule.forFeature([
      {
        name: 'Order',
        schema: OrderSchema,
        collection: 'orders',
      },
    ]),
  ],
  providers: [
    BinanceHttpService,
    BinanceWsWrapper,
    ConfigService,
    OrdersService,
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
    {
      provide: 'RULES_SERVICE',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            host: configService.get('RULES_SERVICE_HOST'),
            port: configService.get('RULES_SERVICE_PORT'),
          },
        });
      },
    },
  ],
  exports: [BinanceHttpService, BinanceWsWrapper],
})
export class BinanceModule {}
