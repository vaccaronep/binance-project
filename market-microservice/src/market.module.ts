import { Module } from '@nestjs/common';
import { MarketController } from './market.controller';
import { RedisModule } from './redis/redis.module';
import { BinanceModule } from './binance/binance.module';

@Module({
  imports: [RedisModule, BinanceModule],
  controllers: [MarketController],
  providers: [],
})
export class AppModule {}
