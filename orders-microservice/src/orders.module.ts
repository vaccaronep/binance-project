import { Module } from '@nestjs/common';
import { AppController } from './orders.controller';
import { OrdersService } from './services/orders.service';
import { RedisModule } from './redis/redis.module';
import { BinanceModule } from './binance/binance.module';

@Module({
  imports: [RedisModule, BinanceModule],
  controllers: [AppController],
  providers: [OrdersService],
})
export class AppModule {}
