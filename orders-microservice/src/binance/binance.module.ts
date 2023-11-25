import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WSService } from './binance.ws.client.service';
// import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { BinanceHttpService } from './binance.http.service';
import { HttpModule } from '@nestjs/axios';
import { RedisModule } from 'src/redis/redis.module';
import { OrdersService } from 'src/services/orders.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoConfigService } from 'src/services/config/mongo.config.service';
import { OrderSchema } from 'src/schema/order.schema';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule.forRoot(),
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
    ConfigService,
    WSService,
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
  ],
  exports: [BinanceHttpService],
})
export class BinanceModule {}
