import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './services/orders.service';
import { RedisModule } from './redis/redis.module';
import { BinanceModule } from './binance/binance.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoConfigService } from './services/config/mongo.config.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OrderSchema } from './schema/order.schema';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule,
    RedisModule,
    BinanceModule,
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
  controllers: [OrdersController],
  providers: [
    OrdersService,
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
})
export class OrderModule {}
