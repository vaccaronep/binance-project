import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './services/orders.service';
import { RedisModule } from './redis/redis.module';
import { BinanceModule } from './binance/binance.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoConfigService } from './services/config/mongo.config.service';

@Module({
  imports: [
    RedisModule,
    BinanceModule,
    MongooseModule.forRootAsync({
      useClass: MongoConfigService,
    }),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrderModule {}
